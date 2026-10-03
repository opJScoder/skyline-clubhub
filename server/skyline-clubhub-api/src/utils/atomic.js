const mongoose = require('mongoose');

/**
 * Runs fn(session) inside a MongoDB transaction when MONGO_TRANSACTIONS=true
 * (requires a replica set, e.g. Atlas). Otherwise runs fn(undefined) so the app
 * works on a plain local mongod. Callers must pass `{ session }` to every query.
 * Idempotency guards in the callers keep the non-transaction path safe.
 */
async function runAtomic(fn) {
  if (process.env.MONGO_TRANSACTIONS !== 'true') {
    return fn(undefined);
  }
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = { runAtomic };
