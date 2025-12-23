import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const dataPath = path.join(__dirname, '..', 'data', 'projects.json');

function readProjects() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/projects', (_req, res) => {
  const projects = readProjects();
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const projects = readProjects();
  const project = projects.find(p => String(p.id) === String(req.params.id));
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
