import { sql, initDB } from '../db.js';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await initDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const jobId = parseInt(id, 10);
      const { rows } = await sql`SELECT * FROM jobs WHERE id = ${jobId}`;
      if (rows.length === 0) {
        res.status(404).json({ error: 'Job not found' });
      } else {
        res.status(200).json(rows[0]);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  } else if (req.method === 'PUT') {
    try {
      const jobId = parseInt(id, 10);
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
      const jobId = parseInt(id, 10);
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
}
