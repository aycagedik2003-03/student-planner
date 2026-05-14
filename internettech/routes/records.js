const express = require('express');
const router  = express.Router();
const { Records, Patients, Users, Appointments } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

function enrich(record) {
  const patient = Patients.findById(record.patient_id);
  const doctor  = Users.findById(record.doctor_id);
  const appt    = record.appointment_id ? Appointments.findById(record.appointment_id) : null;
  return {
    ...record,
    patient_name: patient ? patient.name : 'Unknown',
    patient_species: patient ? patient.species : '',
    doctor_name: doctor ? doctor.name : 'Unknown',
    appointment_date: appt ? appt.date : null,
    appointment_time: appt ? appt.time : null
  };
}

// GET /api/records
router.get('/', requireAuth, (req, res) => {
  let list = Records.all();
  if (req.user.role === 'doctor') {
    list = list.filter(r => r.doctor_id === req.user.id);
  }
  res.json(list.map(enrich));
});

// GET /api/records/:id
router.get('/:id', requireAuth, (req, res) => {
  const record = Records.findById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found.' });
  if (req.user.role === 'doctor' && record.doctor_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(enrich(record));
});

// POST /api/records  (admin, doctor only)
router.post('/', requireRole('admin', 'doctor'), (req, res) => {
  const { appointment_id, patient_id, diagnosis, treatment, medications, notes } = req.body;
  if (!patient_id || !diagnosis) {
    return res.status(400).json({ error: 'patient_id and diagnosis are required.' });
  }
  if (!Patients.findById(patient_id)) return res.status(404).json({ error: 'Patient not found.' });

  const doctor_id = req.user.role === 'doctor' ? req.user.id : req.body.doctor_id;
  const record = Records.create({ appointment_id: appointment_id ? Number(appointment_id) : null, patient_id: Number(patient_id), doctor_id: Number(doctor_id), diagnosis, treatment, medications, notes });

  // Mark appointment as completed if linked
  if (appointment_id) {
    Appointments.update(appointment_id, { status: 'completed' });
  }

  res.status(201).json(enrich(record));
});

// PUT /api/records/:id  (admin, doctor — own records)
router.put('/:id', requireRole('admin', 'doctor'), (req, res) => {
  const record = Records.findById(req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found.' });
  if (req.user.role === 'doctor' && record.doctor_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const updated = Records.update(req.params.id, req.body);
  res.json(enrich(updated));
});

// DELETE /api/records/:id  (admin only)
router.delete('/:id', requireRole('admin'), (req, res) => {
  const ok = Records.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Record not found.' });
  res.json({ message: 'Record deleted.' });
});

module.exports = router;
