const router = require('express').Router();
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const validate = require('../middleware/validate');
const v = require('../validators');
const { authenticate, requireRole } = require('../middleware/auth');
const { broadcast } = require('../services/email');

router.get('/announcements', async (req, res, next) => {
  try {
    const page = Math.max(1, +req.query.page || 1), limit = Math.min(50, +req.query.limit || 10);
    const [items, total] = await Promise.all([
      Announcement.find().sort({ pinned: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('authorId', 'name'),
      Announcement.countDocuments()
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

router.post('/announcements', authenticate, requireRole('admin'), validate(v.announcement), async (req, res, next) => {
  try {
    const a = await Announcement.create({ ...req.body, authorId: req.user._id });
    res.status(201).json(a); // respond first; emails go out in the background
    const emails = (await User.find({ 'emailPrefs.announcements': true }).select('email')).map(u => u.email);
    const { sent, failed } = await broadcast(emails, `[Skyline] ${a.title}`, `<h3>${a.title}</h3><p>${a.body.replace(/\n/g, '<br>')}</p>`);
    await Announcement.findByIdAndUpdate(a._id, { emailsSent: sent, emailsFailed: failed });
  } catch (e) { next(e); }
});

router.put('/announcements/:id', authenticate, requireRole('admin'), validate(v.announcementUpdate), async (req, res, next) => {
  try { res.json(await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { next(e); }
});

module.exports = router;
