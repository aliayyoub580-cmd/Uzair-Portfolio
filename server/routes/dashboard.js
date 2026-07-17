/**
 * GET /api/dashboard — aggregated stats for the admin dashboard
 */
import express from 'express';
import { requireAuth }   from '../middlewares/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (_req, res) => {
  try {
    const [services, skills, projects, messages, unread, activity] = await Promise.all([
      supabaseAdmin.from('services').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('skills').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('messages').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
      supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    res.json({
      services:  services.count  ?? 0,
      skills:    skills.count    ?? 0,
      projects:  projects.count  ?? 0,
      messages:  messages.count  ?? 0,
      unread:    unread.count     ?? 0,
      activity:  activity.data   ?? [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
