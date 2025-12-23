const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const dataPath = path.join(__dirname, 'data', 'projects.json');

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
