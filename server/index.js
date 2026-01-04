const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

const db = new Database(path.join(__dirname, 'jobs.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec(`ALTER TABLE jobs ADD COLUMN notes TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE jobs ADD COLUMN pros TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE jobs ADD COLUMN cons TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE jobs ADD COLUMN offered_salary TEXT;`);
} catch (e) {}

function extractJobInfo(text) {
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

app.get('/api/jobs', (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.post('/api/jobs', (req, res) => {
  const { original_text } = req.body;
  
  const extracted = extractJobInfo(original_text);
  
  const stmt = db.prepare(`
    INSERT INTO jobs (title, company, location, salary, description, original_text, stage)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    extracted.title,
    extracted.company,
    extracted.location,
    extracted.salary,
    extracted.description,
    original_text,
    'Nový'
  );
  
  const newJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
  res.json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const { title, company, location, salary, description, stage, cv_sent_date, notes, pros, cons, offered_salary } = req.body;
  
  const stmt = db.prepare(`
    UPDATE jobs 
    SET title = ?, company = ?, location = ?, salary = ?, description = ?, stage = ?, cv_sent_date = ?, notes = ?, pros = ?, cons = ?, offered_salary = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(title, company, location, salary, description, stage, cv_sent_date, notes, pros, cons, offered_salary, req.params.id);
  
  const updatedJob = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  res.json(updatedJob);
});

app.delete('/api/jobs/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
