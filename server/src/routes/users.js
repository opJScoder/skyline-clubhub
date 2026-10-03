const router = require('express').Router();
const User = require('../models/User');
const Settings = require('../models/Settings');
const validate = require('../middleware/validate');
const v = require('../validators');
const { authenticate, requireRole, volunteerPlus } = require('../middleware/auth');
const { createPayment } = require('../services/payment');

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.put('/users/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, studentId, emailPrefs } = req.body;
    const u = await User.findByIdAndUpdate(req.user._id,
      { name, phone, studentId, 'emailPrefs.announcements': emailPrefs?.announcements }, { new: true, omitUndefined: true });
    res.json({ user: u.toSafe() });
  } catch (e) { next(e); }
});

router.get('/users', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const { q, status } = req.query, f = {};
    if (q) f.$or = [{ name: new RegExp(esc(q), 'i') }, { email: new RegExp(esc(q), 'i') }];
    if (status) f.membershipStatus = String(status);
    res.json(await User.find(f).select('-passwordHash').sort('-createdAt').limit(200));
  } catch (e) { next(e); }
});

router.put('/users/:id/role', authenticate, requireRole('admin'), validate(v.role), async (req, res, next) => {
  try { res.json(await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-passwordHash')); }
  catch (e) { next(e); }
});

router.post('/membership/pay', authenticate, async (req, res, next) => {
  try {
    const { duesAmount } = await Settings.get();
    const orderId = await createPayment({ userId: req.user._id, purpose: 'dues', referenceId: req.user._id, amount: duesAmount });
    res.json({ orderId, amount: duesAmount, currency: 'INR', devMode: orderId.startsWith('dev_') });
  } catch (e) { next(e); }
});

router.get('/members/verify/:memberId', authenticate, volunteerPlus, async (req, res, next) => {
  try {
    const u = await User.findOne({ memberId: req.params.memberId });
    if (!u) return res.status(404).json({ message: 'Unknown member' });
    res.json({ name: u.name, status: u.isActiveMember() ? 'active' : (u.membershipStatus === 'active' ? 'expired' : u.membershipStatus) });
  } catch (e) { next(e); }
});

router.get('/settings', authenticate, async (_req, res, next) => { try { res.json(await Settings.get()); } catch (e) { next(e); } });
router.put('/settings', authenticate, requireRole('admin'), validate(v.settings), async (req, res, next) => {
  try { const s = await Settings.get(); Object.assign(s, req.body); res.json(await s.save()); } catch (e) { next(e); }
});

module.exports = router;
