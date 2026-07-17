/**
 * POST /api/contact
 * Public endpoint — saves message to Supabase AND sends email notification.
 */
import express from 'express';
import { body } from 'express-validator';
import { validate }              from '../middlewares/validate.js';
import { supabaseAdmin }         from '../config/supabase.js';
import { sendContactNotification } from '../utils/mailer.js';
import { logActivity }           from '../utils/activity.js';

const router = express.Router();

const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('subject').optional().trim(),
  body('phone').optional().trim(),
];

router.post('/', contactRules, validate, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Capture IP address (respects proxy headers if behind Render/Vercel)
  const ip = (req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();

  try {
    // 1 — Persist to Supabase
    const { data: saved, error: dbErr } = await supabaseAdmin
      .from('messages')
      .insert({ name, email, phone: phone || null, subject: subject || null, message, ip_address: ip, status: 'unread' })
      .select()
      .single();

    if (dbErr) {
      console.error('[contact] DB insert error:', dbErr.message);
      return res.status(500).json({ error: 'Could not save your message. Please try again.' });
    }

    // 2 — Send email notification (non-fatal if it fails)
    try {
      await sendContactNotification({ name, email, phone, subject, message });
    } catch (mailErr) {
      console.error('[contact] Email send failed:', mailErr.message);
    }

    // 3 — Activity log
    await logActivity('New contact message received', 'message', saved.id, { name, email });

    return res.status(201).json({ success: true, id: saved.id });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
