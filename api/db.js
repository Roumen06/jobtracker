import { sql } from '@vercel/postgres';

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

export function extractJobInfo(text) {
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
  }
  
  const locationPatterns = [
    /(?:lokalita|místo|location):\s*(.+)/i,
    /(?:Praha|Brno|Ostrava|Plzeň|Liberec|Olomouc|Hradec Králové|České Budějovice|Pardubice|Karlovy Vary|Zlín|Jihlava|Ústí nad Labem|Zlín)/i
  ];
  
  for (const line of lines) {
    for (const pattern of locationPatterns) {
      const match = line.match(pattern);
      if (match) {
        info.location = match[1] || match[0];
        break;
      }
    }
  }

  const salaryPatterns = [
    /(?:plat|mzda|salary|odměna):\s*(.+)/i,
    /(\d+\s*(?:000)?\s*(?:-|až)\s*\d+\s*(?:000)?\s*(?:Kč|CZK|EUR))/i,
    /(\d+\s*Kč)/i
  ];
  
  for (const line of lines) {
    for (const pattern of salaryPatterns) {
      const match = line.match(pattern);
      if (match) {
        info.salary = match[1] || match[0];
        break;
      }
    }
  }

  const descLines = lines.slice(1, 4).join(' ');
  info.description = descLines.substring(0, 200);

  return info;
}
