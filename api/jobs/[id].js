import { sql } from '@vercel/postgres';
import { initDB } from '../db.js';

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
      const { rows } = await sql`SELECT * FROM jobs WHERE id = ${id}`;
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
        WHERE id = ${id}
        RETURNING *
      `;
      
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ error: 'Failed to update job' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM jobs WHERE id = ${id}`;
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
