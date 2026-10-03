const express = require('express');
const Joi = require('joi');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

const createSchema = Joi.object({
  title: Joi.string().trim().max(150).required(),
  description: Joi.string().trim().max(2000).allow('').default(''),
  venue: Joi.string().trim().max(200).allow('').default(''),
  date: Joi.date().iso().greater('now').required(),
  capacity: Joi.number().integer().min(1).required(),
  // Prices are integer paise. Razorpay's minimum order is 100 paise (Rs 1).
  memberPricePaise: Joi.number().integer().min(100).required(),
  publicPricePaise: Joi.number().integer().min(100).required(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const events = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.json({ success: true, events });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new AppError(404, 'Event not found');
    res.json({ success: true, event });
  })
);

router.post(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN, ROLES.VOLUNTEER),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, event });
  })
);

module.exports = router;
