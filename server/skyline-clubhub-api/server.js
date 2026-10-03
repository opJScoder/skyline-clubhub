require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { startReleaseHoldsJob } = require('./src/jobs/releaseHolds');

const paymentsRoutes = require('./src/routes/payments');
const authRoutes = require('./src/routes/auth');
const eventRoutes = require('./src/routes/events');
const orderRoutes = require('./src/routes/orders');
const financeRoutes = require('./src/routes/finance');

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// IMPORTANT: payments router (raw-body webhook) MUST be mounted BEFORE express.json().
app.use('/api/payments', paymentsRoutes);

app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET. Copy .env.example to .env and set it.');
    process.exit(1);
  }

  await connectDB();
  startReleaseHoldsJob();

  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => {
    console.log(`[server] Skyline ClubHub API on http://localhost:${port} (CORS: ${CLIENT_ORIGIN})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

if (require.main === module) {
  start().catch((err) => {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = app;
