// =============================================
// server.js — VetClinic API Server
// =============================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── API Routes ───────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/records',      require('./routes/records'));
app.use('/api/users',        require('./routes/users'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// Stats for dashboard
app.get('/api/stats', require('./middleware/auth').requireAuth, (_req, res) => {
  const { Patients, Appointments, Users, Records } = require('./db');
  const today = new Date().toISOString().split('T')[0];
  const appts = Appointments.all();
  res.json({
    totalPatients:    Patients.all().length,
    totalDoctors:     Users.doctors().length,
    totalRecords:     Records.all().length,
    todayAppts:       appts.filter(a => a.date === today).length,
    pendingAppts:     appts.filter(a => a.status === 'pending').length,
    completedAppts:   appts.filter(a => a.status === 'completed').length,
  });
});

// 404 for unknown API calls
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Serve SPA (all non-API routes)
app.get('*', (req, res) => {
  const file = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
  const fullPath = path.join(__dirname, file);
  const fs = require('fs');
  if (fs.existsSync(fullPath)) res.sendFile(fullPath);
  else res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🐾 VetClinic Management System');
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('  Accounts:');
  console.log('  admin@vetclinic.com     / Admin123');
  console.log('  dr.webb@vetclinic.com   / Doctor123');
  console.log('  dr.bennett@vetclinic.com/ Doctor123');
  console.log('  reception@vetclinic.com / Recep123');
  console.log('');
});
