const express = require('express');
const router  = express.Router();
const { Appointments, Patients, Users } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Enrich appointment with patient + doctor names
function enrich(appt) {
  const patient = Patients.findById(appt.patient_id);
  const doctor  = Users.findById(appt.doctor_id);
  return {
    ...appt,
    patient_name: patient ? patient.name : 'Unknown',
    patient_species: patient ? patient.species : '',
    doctor_name: doctor ? doctor.name : 'Unknown',
    doctor_specialization: doctor ? doctor.specialization : ''
  };
}

// GET /api/appointments
router.get('/', requireAuth, (req, res) => {
  let list = Appointments.all();
  // Doctor sees only their own appointments
  if (req.user.role === 'doctor') {
    list = list.filter(a => a.doctor_id === req.user.id);
  }
  res.json(list.map(enrich));
});

// GET /api/appointments/:id
router.get('/:id', requireAuth, (req, res) => {
  const appt = Appointments.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });
  if (req.user.role === 'doctor' && appt.doctor_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(enrich(appt));
});

// POST /api/appointments  (admin, receptionist)
router.post('/', requireRole('admin', 'receptionist'), (req, res) => {
  const { patient_id, doctor_id, date, time, reason, notes } = req.body;
  if (!patient_id || !doctor_id || !date || !time) {
    return res.status(400).json({ error: 'patient_id, doctor_id, date and time are required.' });
  }
  if (!Patients.findById(patient_id)) return res.status(404).json({ error: 'Patient not found.' });
  if (!Users.findById(doctor_id))    return res.status(404).json({ error: 'Doctor not found.' });

  const appt = Appointments.create({ patient_id: Number(patient_id), doctor_id: Number(doctor_id), date, time, reason, notes, created_by: req.user.id });
  res.status(201).json(enrich(appt));
});

// PUT /api/appointments/:id  (admin, receptionist, doctor for notes/status)
router.put('/:id', requireAuth, (req, res) => {
  const appt = Appointments.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found.' });

  // Doctor can only update their own appointments (status/notes)
  if (req.user.role === 'doctor') {
    if (appt.doctor_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
    const { status, notes } = req.body;
    const updated = Appointments.update(req.params.id, { status, notes });
    return res.json(enrich(updated));
  }

  const updated = Appointments.update(req.params.id, req.body);
  res.json(enrich(updated));
});

// DELETE /api/appointments/:id  (admin, receptionist)
router.delete('/:id', requireRole('admin', 'receptionist'), (req, res) => {
  const ok = Appointments.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Appointment not found.' });
  res.json({ message: 'Appointment deleted.' });
});

module.exports = router;
