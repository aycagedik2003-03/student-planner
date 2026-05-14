const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { Users } = require('../db');
const { requireRole } = require('../middleware/auth');

const safe = u => { const { password: _, ...s } = u; return s; };

// GET /api/users  (admin only)
router.get('/', requireRole('admin'), (req, res) => {
  res.json(Users.all().map(safe));
});

// GET /api/users/doctors  (any authenticated)
router.get('/doctors', requireRole('admin', 'receptionist', 'doctor'), (req, res) => {
  res.json(Users.doctors().map(safe));
});

// POST /api/users  (admin only)
router.post('/', requireRole('admin'), (req, res) => {
  const { name, email, password, role, specialization, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, and role are required.' });
  }
  const validRoles = ['admin', 'doctor', 'receptionist'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role.' });
  if (Users.findByEmail(email)) return res.status(409).json({ error: 'Email already in use.' });

  const user = Users.create({ name, email, password: bcrypt.hashSync(password, 10), role, specialization: specialization || null, phone: phone || null });
  res.status(201).json(safe(user));
});

// PUT /api/users/:id  (admin only)
router.put('/:id', requireRole('admin'), (req, res) => {
  const { name, email, password, role, specialization, phone } = req.body;
  const updates = { name, email, role, specialization, phone };
  if (password) updates.password = bcrypt.hashSync(password, 10);

  const user = Users.update(req.params.id, updates);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(safe(user));
});

// DELETE /api/users/:id  (admin only — cannot delete self)
router.delete('/:id', requireRole('admin'), (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account.' });
  }
  const ok = Users.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'User not found.' });
  res.json({ message: 'User deleted.' });
});

module.exports = router;
