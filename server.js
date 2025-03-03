import { Hono } from 'hono';
import { cors } from 'hono/cors';
import multer from 'multer';
import Database from 'better-sqlite3';
import csvParser from 'csv-parser';
import fs from 'fs';

const app = new Hono();
app.use('*', cors());
const db = new Database('attendance.db');

// Initialize DB Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_number TEXT UNIQUE,
    name TEXT,
    class_id INTEGER,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_number TEXT,
    class_id INTEGER,
    date TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );
`);

// Create a new class
app.post('/api/classes', async (c) => {
  const { class_name } = await c.req.json();
  const stmt = db.prepare('INSERT INTO classes (name) VALUES (?)');
  const info = stmt.run(class_name);
  return c.json({ message: 'Class created', class_id: info.lastInsertRowid });
});

// CSV Upload Middleware
const upload = multer({ dest: 'uploads/' });

// Import users via CSV
app.post('/api/classes/:class_id/import', upload.single('file'), async (c) => {
  const { class_id } = c.req.param();
  const filePath = c.req.file.path;
  const students = new Set();
  const stmt = db.prepare('INSERT OR IGNORE INTO students (unique_number, name, class_id) VALUES (?, ?, ?)');

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.unique_number) {
          students.add(row.unique_number);
          stmt.run(row.unique_number, row.name || 'Unknown', class_id);
        }
      })
      .on('end', () => {
        fs.unlinkSync(filePath);
        resolve(c.json({ message: 'Users imported', total_users: students.size }));
      })
      .on('error', reject);
  });
});

// Mark attendance
app.post('/api/classes/:class_id/attendance', async (c) => {
  const { class_id } = c.req.param();
  const { unique_number } = await c.req.json();
  const date = new Date().toISOString().split('T')[0];
  const student = db.prepare('SELECT * FROM students WHERE unique_number = ? AND class_id = ?').get(unique_number, class_id);

  if (!student) {
    return c.json({ message: 'User not found', unique_number });
  }

  db.prepare('INSERT OR IGNORE INTO attendance (unique_number, class_id, date) VALUES (?, ?, ?)')
    .run(unique_number, class_id, date);
  
  return c.json({ message: 'Attendance updated', unique_number, status: 'Present' });
});

// Fetch present students
app.get('/api/classes/:class_id/present', async (c) => {
  const { class_id } = c.req.param();
  const date = new Date().toISOString().split('T')[0];
  const students = db.prepare(`
    SELECT students.unique_number, students.name FROM attendance
    JOIN students ON attendance.unique_number = students.unique_number
    WHERE attendance.class_id = ? AND attendance.date = ?
  `).all(class_id, date);

  return c.json({ class_id, date, present_students: students });
});

// Fetch absent students
app.get('/api/classes/:class_id/absent', async (c) => {
  const { class_id } = c.req.param();
  const date = new Date().toISOString().split('T')[0];
  const students = db.prepare(`
    SELECT unique_number, name FROM students
    WHERE class_id = ? AND unique_number NOT IN (
      SELECT unique_number FROM attendance WHERE class_id = ? AND date = ?
    )
  `).all(class_id, class_id, date);

  return c.json({ class_id, date, absent_students: students });
});

export default app;
