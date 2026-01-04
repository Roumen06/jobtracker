import { sql } from '@vercel/postgres';
import { initDB, extractJobInfo } from '../db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await initDB();

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
      const extracted = extractJobInfo(original_text);
      
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
