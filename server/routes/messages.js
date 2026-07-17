/**
 * /api/messages — Admin message management + reply sending
 */
import express from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth }     from '../middlewares/auth.js';
import { validate }        from '../middlewares/validate.js';
import { supabaseAdmin }   from '../config/supabase.js';
import { sendReplyEmail }  from '../utils/mailer.js';
import { logActivity }     from '../utils/activity.js';

const router = express.Router();

// All message routes require authentication
router.use(requireAuth);

// GET /api/messages?status=&search=&page=&limit=
router.get('/', [
  query('status').optional().isIn(['unread','read','starred','archived','trash']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], validate, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let q = supabaseAdmin
      .from('messages')
      .select('*, message_replies(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) q = q.eq('status', status);
    if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);

    const { data, count, error } = await q;
    if (error) throw error;

    res.json({ data, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*, message_replies(*)')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Message not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/messages/:id  — update status or notes
router.patch('/:id', [
  body('status').optional().isIn(['unread','read','starred','archived','trash']),
  body('notes').optional().trim(),
], validate, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('messages').delete().eq('id', req.params.id);
    if (error) throw error;
    await logActivity('Deleted message', 'message', req.params.id, {}, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/:id/reply  — send reply email + save to DB
router.post('/:id/reply', [
  body('body').trim().notEmpty().withMessage('Reply body is required'),
], validate, async (req, res) => {
  try {
    const { data: msg, error: msgErr } = await supabaseAdmin
      .from('messages')
      .select('name,email,subject')
      .eq('id', req.params.id)
      .single();
    if (msgErr) return res.status(404).json({ error: 'Message not found' });

    // Save reply
    const { data: reply, error: replyErr } = await supabaseAdmin
      .from('message_replies')
      .insert({ message_id: req.params.id, body: req.body.body, sent_by: 'admin' })
      .select()
      .single();
    if (replyErr) throw replyErr;

    // Mark original message as read
    await supabaseAdmin.from('messages').update({ status: 'read' }).eq('id', req.params.id);

    // Send email
    try {
      await sendReplyEmail({ to: msg.email, toName: msg.name, subject: msg.subject, replyBody: req.body.body });
    } catch (mailErr) {
      console.error('[messages/reply] Email failed:', mailErr.message);
    }

    await logActivity('Replied to message', 'message', req.params.id, {}, req.user.id);
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
