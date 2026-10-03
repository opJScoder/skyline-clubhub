const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skyline_clubhub';
  mongoose.set('strictQuery', true);

  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('[db] MongoDB reconnected'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log(`[db] Connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = { connectDB };
