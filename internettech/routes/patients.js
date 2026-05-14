const express = require('express');
const router  = express.Router();
const { Patients, Appointments, Records } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/patients
router.get('/', requireAuth, (req, res) => {
  const patients = Patients.all();
  res.json(patients);
});

// GET /api/patients/:id  (with appointments + records)
router.get('/:id', requireAuth, (req, res) => {
  const patient = Patients.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found.' });

  const appointments = Appointments.byPatient(patient.id);
  const records = Records.byPatient(patient.id);
  res.json({ ...patient, appointments, records });
});

// POST /api/patients  (admin, receptionist)
router.post('/', requireRole('admin', 'receptionist'), (req, res) => {
  const { name, species, breed, age, weight, owner_name, owner_phone, owner_email, owner_address, notes } = req.body;
  if (!name || !species || !owner_name) {
    return res.status(400).json({ error: 'Name, species, and owner name are required.' });
  }
  const patient = Patients.create({ name, species, breed, age: Number(age), weight: Number(weight), owner_name, owner_phone, owner_email, owner_address, notes });
  res.status(201).json(patient);
});

// PUT /api/patients/:id  (admin, receptionist)
router.put('/:id', requireRole('admin', 'receptionist'), (req, res) => {
  const patient = Patients.update(req.params.id, req.body);
  if (!patient) return res.status(404).json({ error: 'Patient not found.' });
  res.json(patient);
});

// DELETE /api/patients/:id  (admin only)
router.delete('/:id', requireRole('admin'), (req, res) => {
  const ok = Patients.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Patient not found.' });
  res.json({ message: 'Patient deleted.' });
});

module.exports = router;
