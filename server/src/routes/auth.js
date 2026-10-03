const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const v = require('../validators');
const { authenticate } = require('../middleware/auth');
const { env } = require('../config');

const sign = u => jwt.sign({ userId: u._id, role: u.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN || '7d' });

router.post('/register', validate(v.register), async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.create({ ...rest, passwordHash: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: user.toSafe() });
  } catch (e) { e.code === 11000 ? res.status(409).json({ message: 'Email already registered' }) : next(e); }
});

router.post('/login', validate(v.login), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: user.toSafe() });
  } catch (e) { next(e); }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user.toSafe() }));

module.exports = router;
