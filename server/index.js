import express        from 'express';
import cors           from 'cors';
import dotenv         from 'dotenv';
import rateLimit      from 'express-rate-limit';

dotenv.config();

// ── Middlewares ────────────────────────────────────────────────
import { requestLogger } from './middlewares/logger.js';

// ── Routes ────────────────────────────────────────────────────
import contactRoute   from './routes/contact.js';
import messagesRoute  from './routes/messages.js';
import dashboardRoute from './routes/dashboard.js';
import mediaRoute     from './routes/media.js';
import { contentRouter }                  from './routes/content.js';
import { singletonRouter, seoRouter }     from './routes/settings.js';

const app  = express();
const port = process.env.PORT || 5000;

// ── Security & CORS ────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.set('trust proxy', 1); // Required for Render / behind reverse proxy

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Rate limiting ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many messages sent. Please wait before trying again.' },
});

app.use(globalLimiter);

// ── Body parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ────────────────────────────────────────────
app.use(requestLogger);

// ── Health check ───────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV ?? 'development',
  });
});

// ── API routes ─────────────────────────────────────────────────

// Public
app.use('/api/contact', contactLimiter, contactRoute);

// Admin — all protected by requireAuth inside each router
app.use('/api/dashboard',    dashboardRoute);
app.use('/api/messages',     messagesRoute);
app.use('/api/media',        mediaRoute);

// Content tables (public GET, protected mutations)
app.use('/api/services',     contentRouter('services'));
app.use('/api/skills',       contentRouter('skills'));
app.use('/api/projects',     contentRouter('projects'));
app.use('/api/experience',   contentRouter('experience'));
app.use('/api/education',    contentRouter('education'));
app.use('/api/certificates', contentRouter('certificates'));
app.use('/api/testimonials', contentRouter('testimonials'));

// Singleton content
app.use('/api/home',         singletonRouter('home_content'));
app.use('/api/about',        singletonRouter('about_content'));
app.use('/api/settings',     singletonRouter('website_settings'));

// SEO (per-page)
app.use('/api/seo',          seoRouter);

// ── Global error handler ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  const status  = err.status ?? err.statusCode ?? 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  res.status(status).json({ error: message });
});

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`\n🚀 Portfolio API server running on http://localhost:${port}`);
  console.log(`   Health:  http://localhost:${port}/health`);
  console.log(`   Contact: POST http://localhost:${port}/api/contact\n`);
});
