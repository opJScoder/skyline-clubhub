const Event = require('../models/Event');

/**
 * Atomically reserves `qty` seats. Single conditional update, so two buyers can never
 * take the last seat. Returns the updated event, or null if not enough seats remain.
 */
function reserveSeats(eventId, qty, session) {
  return Event.findOneAndUpdate(
    { _id: eventId, $expr: { $lte: [{ $add: ['$seatsSold', qty] }, '$capacity'] } },
    { $inc: { seatsSold: qty } },
    { new: true, session }
  );
}

/** Releases previously reserved seats (never below zero). */
function releaseSeats(eventId, qty, session) {
  return Event.updateOne(
    { _id: eventId, seatsSold: { $gte: qty } },
    { $inc: { seatsSold: -qty } },
    { session }
  );
}

module.exports = { reserveSeats, releaseSeats };
