const Joi = require('joi');
const eventFields = {
  title: Joi.string(), description: Joi.string().allow(''), venue: Joi.string().allow(''),
  startsAt: Joi.date(), capacity: Joi.number().integer().min(1),
  memberPrice: Joi.number().integer().min(0), nonMemberPrice: Joi.number().integer().min(0),
  saleStartsAt: Joi.date().allow(null), saleEndsAt: Joi.date().allow(null),
  status: Joi.string().valid('draft', 'published', 'cancelled', 'completed')
};
const cat = Joi.string().valid('meeting', 'deadline', 'change-of-plan', 'general');
module.exports = {
  register: Joi.object({
    name: Joi.string().min(2).max(80).required(), email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    phone: Joi.string().allow('', null), studentId: Joi.string().allow('', null)
  }),
  login: Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }),
  event: Joi.object(eventFields).fork(['title', 'startsAt', 'capacity', 'memberPrice', 'nonMemberPrice'], s => s.required()),
  eventUpdate: Joi.object(eventFields),
  ticketOrder: Joi.object({ quantity: Joi.number().integer().min(1).max(10).required() }),
  checkIn: Joi.object({ ticketCode: Joi.string().required() }),
  announcement: Joi.object({ title: Joi.string().required(), body: Joi.string().required(), category: cat, pinned: Joi.boolean() }),
  announcementUpdate: Joi.object({ title: Joi.string(), body: Joi.string(), category: cat, pinned: Joi.boolean() }),
  role: Joi.object({ role: Joi.string().valid('member', 'volunteer', 'treasurer', 'admin').required() }),
  settings: Joi.object({
    duesAmount: Joi.number().integer().min(0), membershipExpiryDate: Joi.date(),
    memberDiscountPercent: Joi.number().min(0).max(100), openingBalance: Joi.number().integer()
  }),
  ledger: Joi.object({
    type: Joi.string().valid('income', 'expense').required(),
    source: Joi.string().valid('dues', 'tickets', 'merchandise', 'fundraiser', 'reimbursement', 'other').required(),
    amount: Joi.number().integer().min(1).required(), description: Joi.string().allow(''),
    eventId: Joi.string().allow(null, ''), receiptUrl: Joi.string().uri().allow('', null)
  })
};
