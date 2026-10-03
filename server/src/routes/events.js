const router = require('express').Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const TicketOrder = require('../models/TicketOrder');
const validate = require('../middleware/validate');
const v = require('../validators');
const { authenticate, softAuth, requireRole, volunteerPlus } = require('../middleware/auth');
const { createPayment, releaseTicketOrder } = require('../services/payment');

const view = (e, user) => {
  const o = e.toObject();
  o.seatsLeft = Math.max(0, e.capacity - e.soldCount - e.reservedCount);
  o.yourPrice = user?.isActiveMember() ? e.memberPrice : e.nonMemberPrice;
  return o;
};

router.get('/events', softAuth, async (req, res, next) => {
  try {
    const admin = req.user?.role === 'admin';
    const events = await Event.find(admin ? {} : { status: { $in: ['published', 'completed'] } }).sort('startsAt');
    res.json(events.map(e => view(e, req.user)));
  } catch (e) { next(e); }
});

router.get('/events/:id', softAuth, async (req, res, next) => {
  try {
    const e = await Event.findById(req.params.id);
    if (!e || (e.status === 'draft' && req.user?.role !== 'admin')) return res.status(404).json({ message: 'Event not found' });
    res.json(view(e, req.user));
  } catch (e) { next(e); }
});

router.post('/events', authenticate, requireRole('admin'), validate(v.event), async (req, res, next) => {
  try { res.status(201).json(await Event.create(req.body)); } catch (e) { next(e); }
});

router.put('/events/:id', authenticate, requireRole('admin'), validate(v.eventUpdate), async (req, res, next) => {
  try { res.json(await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { next(e); }
});

// Reserve seats atomically, then create the payment order. Price is computed server-side.
router.post('/events/:id/tickets/order', authenticate, validate(v.ticketOrder), async (req, res, next) => {
  try {
    const { quantity } = req.body, now = new Date();
    const ev = await Event.findById(req.params.id);
    if (!ev || ev.status !== 'published') return res.status(404).json({ message: 'Event not available' });
    if ((ev.saleStartsAt && ev.saleStartsAt > now) || (ev.saleEndsAt && ev.saleEndsAt < now))
      return res.status(400).json({ message: 'Ticket sales are closed' });
    const unitPrice = req.user.isActiveMember() ? ev.memberPrice : ev.nonMemberPrice;
    if (unitPrice === 0) return res.status(400).json({ message: 'Free events are not supported in this build' });

    const held = await Event.findOneAndUpdate(
      { _id: ev._id, $expr: { $lte: [{ $add: ['$soldCount', '$reservedCount', quantity] }, '$capacity'] } },
      { $inc: { reservedCount: quantity } }, { new: true });
    if (!held) return res.status(409).json({ message: 'Not enough seats left' });

    const totalAmount = unitPrice * quantity;
    const order = await TicketOrder.create({
      userId: req.user._id, eventId: ev._id, quantity, unitPrice, totalAmount,
      reservedUntil: new Date(Date.now() + 10 * 60 * 1000)
    });
    try {
      const orderId = await createPayment({ userId: req.user._id, purpose: 'ticket', referenceId: order._id, amount: totalAmount });
      order.razorpayOrderId = orderId; await order.save();
      res.status(201).json({ orderId, amount: totalAmount, currency: 'INR', reservedUntil: order.reservedUntil, devMode: orderId.startsWith('dev_') });
    } catch (err) { await releaseTicketOrder(order._id, 'failed'); throw err; }
  } catch (e) { next(e); }
});

router.get('/tickets/mine', authenticate, async (req, res, next) => {
  try { res.json(await Ticket.find({ userId: req.user._id }).populate('eventId', 'title venue startsAt').sort('-createdAt')); }
  catch (e) { next(e); }
});

router.post('/tickets/check-in', authenticate, volunteerPlus, validate(v.checkIn), async (req, res, next) => {
  try {
    const { ticketCode } = req.body;
    const t = await Ticket.findOneAndUpdate({ ticketCode, checkedIn: false },
      { checkedIn: true, checkedInAt: new Date(), checkedInBy: req.user._id }, { new: true })
      .populate('userId', 'name').populate('eventId', 'title');
    if (t) return res.json({ ok: true, message: 'Checked in', holder: t.userId?.name, event: t.eventId?.title });
    const existing = await Ticket.findOne({ ticketCode });
    res.status(existing ? 409 : 404).json({ ok: false, message: existing ? 'Already checked in' : 'Invalid ticket' });
  } catch (e) { next(e); }
});

router.get('/events/:id/report', authenticate, requireRole('admin', 'treasurer'), async (req, res, next) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    const paid = await TicketOrder.find({ eventId: ev._id, status: 'paid' });
    const attended = await Ticket.countDocuments({ eventId: ev._id, checkedIn: true });
    res.json({ sold: ev.soldCount, attended, noShows: ev.soldCount - attended,
      attendancePct: ev.soldCount ? Math.round(attended / ev.soldCount * 100) : 0,
      revenue: paid.reduce((s, o) => s + o.totalAmount, 0) });
  } catch (e) { next(e); }
});

module.exports = router;
