const express = require('express');
const Joi = require('joi');
const Event = require('../models/Event');
const TicketOrder = require('../models/TicketOrder');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { createOrder, publicKeyId } = require('../services/razorpay');
const { reserveSeats, releaseSeats } = require('../services/seats');

const router = express.Router();
router.use(authenticate);

const ticketSchema = Joi.object({
  eventId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(10).default(1),
});

const checkoutPayload = (order, rzpOrder) => ({
  success: true,
  order,
  checkout: {
    keyId: publicKeyId(),
    razorpayOrderId: rzpOrder.id,
    amountPaise: order.amountPaise,
    currency: order.currency,
  },
});

// Buy event tickets. The price tier (member / public) is decided on the server.
router.post(
  '/tickets',
  validate(ticketSchema),
  asyncHandler(async (req, res) => {
    const { eventId, quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) throw new AppError(404, 'Event not found');
    if (event.date <= new Date()) throw new AppError(400, 'This event has already started');

    const isMember = req.user.isMembershipActive();
    const unitPricePaise = isMember ? event.memberPricePaise : event.publicPricePaise;
    const amountPaise = unitPricePaise * quantity;

    const reserved = await reserveSeats(event._id, quantity);
    if (!reserved) throw new AppError(409, 'Not enough seats left');

    try {
      const rzpOrder = await createOrder({
        amountPaise,
        receipt: `tkt_${Date.now()}`,
        notes: { kind: 'ticket', userId: req.user.id, eventId },
      });

      const order = await TicketOrder.create({
        user: req.user._id,
        kind: 'ticket',
        event: event._id,
        quantity,
        pricingTier: isMember ? 'member' : 'public',
        unitPricePaise,
        amountPaise,
        razorpayOrderId: rzpOrder.id,
        seatsHeld: true,
      });

      res.status(201).json(checkoutPayload(order, rzpOrder));
    } catch (err) {
      await releaseSeats(event._id, quantity);
      throw err;
    }
  })
);

// Buy or renew an annual membership.
router.post(
  '/membership',
  asyncHandler(async (req, res) => {
    const amountPaise = parseInt(process.env.MEMBERSHIP_FEE_PAISE || '50000', 10);

    const rzpOrder = await createOrder({
      amountPaise,
      receipt: `mem_${Date.now()}`,
      notes: { kind: 'membership', userId: req.user.id },
    });

    const order = await TicketOrder.create({
      user: req.user._id,
      kind: 'membership',
      quantity: 1,
      pricingTier: 'public',
      unitPricePaise: amountPaise,
      amountPaise,
      razorpayOrderId: rzpOrder.id,
    });

    res.status(201).json(checkoutPayload(order, rzpOrder));
  })
);

router.get(
  '/mine',
  asyncHandler(async (req, res) => {
    const orders = await TicketOrder.find({ user: req.user._id })
      .populate('event', 'title date venue')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  })
);

module.exports = router;
