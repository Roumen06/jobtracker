import { sql, initDB, extractJobInfo } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await initDB();

  const { id } = req.query;

  // Single job operations (GET, PUT, DELETE by ID)
  if (id) {
    const jobId = parseInt(id, 10);

    if (req.method === 'GET') {
      try {
        const { rows } = await sql`SELECT * FROM jobs WHERE id = ${jobId}`;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Job not found' });
        }
        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ error: 'Failed to fetch job' });
      }
    } else if (req.method === 'PUT') {
      try {
        const { title, company, location, salary, description, stage, cv_sent_date, notes, pros, cons, offered_salary } = req.body;
        
        const { rows } = await sql`
          UPDATE jobs 
          SET 
            title = ${title}, 
            company = ${company}, 
            location = ${location}, 
            salary = ${salary}, 
            description = ${description}, 
            stage = ${stage}, 
            cv_sent_date = ${cv_sent_date}, 
            notes = ${notes}, 
            pros = ${pros}, 
            cons = ${cons}, 
            offered_salary = ${offered_salary}, 
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${jobId}
          RETURNING *
        `;
        
        res.status(200).json(rows[0]);
      } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
      }
    } else if (req.method === 'DELETE') {
      try {
        console.log('Attempting to delete job with ID:', jobId);
        
        const result = await sql`DELETE FROM jobs WHERE id = ${jobId} RETURNING *`;
        console.log('Delete query executed. Rows affected:', result.rows.length);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Job not found' });
        }
        
        res.status(200).json({ success: true, deletedJob: result.rows[0] });
      } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job', message: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    return;
  }

  // List all jobs (GET without ID)
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { original_text } = req.body;
      const extracted = await extractJobInfo(original_text);
      
      const { rows } = await sql`
        INSERT INTO jobs (title, company, location, salary, description, original_text, stage)
        VALUES (${extracted.title}, ${extracted.company}, ${extracted.location}, ${extracted.salary}, ${extracted.description}, ${original_text}, 'Nový')
        RETURNING *
      `;
      
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
