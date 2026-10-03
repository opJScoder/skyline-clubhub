const express = require('express');
const cors = require('cors');
const { env, connectDB, hasRazorpay } = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors({ origin: env.CLIENT_URL || 'http://localhost:5173' }));

// Webhook route uses its own express.raw(), so it is mounted BEFORE express.json()
app.use('/api', require('./routes/webhook'));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, payments: hasRazorpay ? 'razorpay' : 'dev-mode' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/events'));
app.use('/api', require('./routes/announcements'));
app.use('/api', require('./routes/ledger'));
app.use(errorHandler);

connectDB().then(() => {
  require('./jobs')();
  app.listen(env.PORT || 5000, () => console.log(`API on :${env.PORT || 5000} (payments: ${hasRazorpay ? 'razorpay' : 'dev-mode'})`));
}).catch(e => { console.error('DB connection failed:', e.message); process.exit(1); });
