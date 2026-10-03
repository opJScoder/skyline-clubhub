const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Public sign-up always creates a plain member. Elevated roles are assigned by an admin only.
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) throw new AppError(409, 'Email is already registered');

    const user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
    });

    res.status(201).json({ success: true, token: signToken(user), user });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
    const ok = user && (await user.verifyPassword(req.body.password));
    if (!ok) throw new AppError(401, 'Invalid email or password');

    res.json({ success: true, token: signToken(user), user });
  })
);

router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    isMembershipActive: req.user.isMembershipActive(),
  });
});

module.exports = router;
