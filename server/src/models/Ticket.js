const { Schema, model } = require('mongoose');
module.exports = model('Ticket', new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'TicketOrder' },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  ticketCode: { type: String, unique: true },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: Date,
  checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));
