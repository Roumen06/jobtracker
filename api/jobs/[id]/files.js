import { put, list, del } from '@vercel/blob';
import { sql, initDB } from '../../db.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await initDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT * FROM job_files 
        WHERE job_id = ${id} 
        ORDER BY uploaded_at DESC
      `;
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  } else if (req.method === 'POST') {
    try {
      const formData = await req.body;
      
      if (!formData.file || !formData.fileName) {
        return res.status(400).json({ error: 'File data required' });
      }

      const buffer = Buffer.from(formData.file, 'base64');
      
      const blob = await put(`job-${id}/${formData.fileName}`, buffer, {
        access: 'public',
        contentType: formData.fileType || 'application/octet-stream',
      });

      const { rows } = await sql`
        INSERT INTO job_files (job_id, file_name, file_url, file_type, file_size)
        VALUES (${id}, ${formData.fileName}, ${blob.url}, ${formData.fileType}, ${formData.fileSize})
        RETURNING *
      `;

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { fileId } = req.query;
      
      const { rows } = await sql`
        SELECT file_url FROM job_files WHERE id = ${fileId} AND job_id = ${id}
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      await del(rows[0].file_url);
      
      await sql`DELETE FROM job_files WHERE id = ${fileId}`;
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
