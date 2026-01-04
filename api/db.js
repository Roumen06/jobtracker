import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

const { Pool } = pg;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Create connection pool for Prisma Postgres
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function for tagged template queries
export const sql = async (strings, ...values) => {
  const client = await pool.connect();
  try {
    let query = strings[0];
    const params = [];
    
    for (let i = 0; i < values.length; i++) {
      params.push(values[i]);
      query += `$${i + 1}` + strings[i + 1];
    }
    
    const result = await client.query(query, params);
    return { rows: result.rows };
  } finally {
    client.release();
  }
};

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT,
        location TEXT,
        salary TEXT,
        description TEXT,
        original_text TEXT,
        stage TEXT DEFAULT 'Nový',
        cv_sent_date TEXT,
        notes TEXT,
        pros TEXT,
        cons TEXT,
        offered_salary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS job_files (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function extractJobInfo(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyzuj tento pracovní inzerát a extrahuj z něj informace ve formátu JSON. Vrať POUZE validní JSON bez dalšího textu.

Inzerát:
${text}

Odpověz ve formátu:
{
  "title": "název pozice",
  "company": "název firmy",
  "location": "místo/lokalita",
  "salary": "platové rozpětí nebo mzda",
  "description": "stručné shrnutí pozice v 1-2 větách"
}

Pokud některá informace není v textu, vrať prázdný string "". Odpověz POUZE JSON, nic jiného.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = aiText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const extracted = JSON.parse(jsonText);
    
    return {
      title: extracted.title || '',
      company: extracted.company || '',
      location: extracted.location || '',
      salary: extracted.salary || '',
      description: extracted.description || ''
    };
  } catch (error) {
    console.error('AI extraction error:', error);
    
    // Fallback to simple extraction if AI fails
    const info = {
      title: '',
      company: '',
      location: '',
      salary: '',
      description: ''
    };

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      info.title = lines[0].trim();
      info.description = lines.slice(1, 3).join(' ').substring(0, 200);
    }

    return info;
  }
}
