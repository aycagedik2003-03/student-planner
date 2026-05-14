const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const { Users } = require('../db');
const { tokenCreate, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const user = Users.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = tokenCreate(user);
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = Users.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password: _, ...safe } = user;
  res.json(safe);
});

module.exports = router;
