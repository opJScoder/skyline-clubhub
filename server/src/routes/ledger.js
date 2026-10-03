const router = require('express').Router();
const LedgerEntry = require('../models/LedgerEntry');
const Settings = require('../models/Settings');
const validate = require('../middleware/validate');
const v = require('../validators');
const { authenticate, requireRole } = require('../middleware/auth');

const staff = requireRole('treasurer', 'admin');
const filterOf = q => {
  const f = {};
  if (q.source) f.source = String(q.source);
  if (q.eventId) f.eventId = String(q.eventId);
  if (q.from || q.to) f.date = { ...(q.from && { $gte: new Date(q.from) }), ...(q.to && { $lte: new Date(q.to) }) };
  return f;
};

router.get('/ledger', authenticate, staff, async (req, res, next) => {
  try { res.json(await LedgerEntry.find(filterOf(req.query)).sort('-date').limit(500)); } catch (e) { next(e); }
});

router.post('/ledger', authenticate, requireRole('treasurer'), validate(v.ledger), async (req, res, next) => {
  try { res.status(201).json(await LedgerEntry.create({ ...req.body, eventId: req.body.eventId || undefined, createdBy: req.user._id })); }
  catch (e) { next(e); }
});

router.get('/ledger/summary', authenticate, staff, async (_req, res, next) => {
  try {
    const rows = await LedgerEntry.aggregate([{ $group: { _id: { type: '$type', source: '$source' }, total: { $sum: '$amount' } } }]);
    const { openingBalance } = await Settings.get();
    let income = 0, expenses = 0; const bySource = {};
    rows.forEach(r => { r._id.type === 'income' ? (income += r.total) : (expenses += r.total); bySource[`${r._id.type}:${r._id.source}`] = r.total; });
    res.json({ income, expenses, balance: openingBalance + income - expenses, bySource });
  } catch (e) { next(e); }
});

router.get('/ledger/export', authenticate, staff, async (req, res, next) => {
  try {
    const rows = await LedgerEntry.find(filterOf(req.query)).sort('date');
    const csv = ['date,type,source,amount_inr,description'].concat(rows.map(r =>
      [r.date.toISOString(), r.type, r.source, (r.amount / 100).toFixed(2), `"${(r.description || '').replace(/"/g, '""')}"`].join(','))).join('\n');
    res.type('text/csv').attachment('ledger.csv').send(csv);
  } catch (e) { next(e); }
});

module.exports = router;
