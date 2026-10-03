const express = require('express');
const Joi = require('joi');
const LedgerEntry = require('../models/LedgerEntry');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();
router.use(authenticate, requireRole(ROLES.TREASURER, ROLES.ADMIN));

const expenseSchema = Joi.object({
  amountPaise: Joi.number().integer().min(1).required(),
  category: Joi.string().valid('merchandise', 'fundraiser', 'expense', 'other').default('expense'),
  description: Joi.string().trim().min(3).max(300).required(),
});

// Money in, money out, balance, all in integer paise.
router.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const rows = await LedgerEntry.aggregate([
      { $group: { _id: { direction: '$direction', category: '$category' }, total: { $sum: '$amountPaise' } } },
    ]);

    let inPaise = 0;
    let outPaise = 0;
    const byCategory = {};
    rows.forEach(({ _id, total }) => {
      if (_id.direction === 'in') inPaise += total;
      else outPaise += total;
      byCategory[_id.category] = (byCategory[_id.category] || 0) + (_id.direction === 'in' ? total : -total);
    });

    res.json({ success: true, summary: { inPaise, outPaise, balancePaise: inPaise - outPaise, byCategory } });
  })
);

router.get(
  '/ledger',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const [entries, total] = await Promise.all([
      LedgerEntry.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      LedgerEntry.countDocuments(),
    ]);
    res.json({ success: true, page, limit, total, entries });
  })
);

// Record a reimbursed expense. Appends a new "out" entry; nothing is ever edited.
router.post(
  '/expenses',
  validate(expenseSchema),
  asyncHandler(async (req, res) => {
    const entry = await LedgerEntry.create({
      direction: 'out',
      category: req.body.category,
      amountPaise: req.body.amountPaise,
      description: req.body.description,
      recordedBy: req.user._id,
    });
    res.status(201).json({ success: true, entry });
  })
);

module.exports = router;
