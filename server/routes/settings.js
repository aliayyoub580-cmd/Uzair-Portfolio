/**
 * /api/settings  — website_settings (single-row upsert)
 * /api/home       — home_content  (single-row upsert)
 * /api/about      — about_content (single-row upsert)
 * /api/seo        — seo_settings  (per-page upsert)
 */
import express from 'express';
import { requireAuth }   from '../middlewares/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logActivity }   from '../utils/activity.js';

// ── Generic single-row GET/PATCH for website_settings / home_content / about_content ──
export function singletonRouter(table) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      res.json(data ?? {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/', requireAuth, async (req, res) => {
    try {
      const { id, ...rest } = req.body;
      let result;
      if (id) {
        const { data, error } = await supabaseAdmin.from(table).update(rest).eq('id', id).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabaseAdmin.from(table).insert(req.body).select().single();
        if (error) throw error;
        result = data;
      }
      await logActivity(`Updated ${table}`, table, null, {}, req.user.id);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/', requireAuth, async (req, res) => {
    try {
      const { data: existing } = await supabaseAdmin.from(table).select('id').limit(1).single();
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const { data, error } = await supabaseAdmin.from(table).update(req.body).eq('id', existing.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

// ── SEO per-page router ──────────────────────────────────────
export const seoRouter = (() => {
  const router = express.Router();

  router.get('/:page', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('seo_settings').select('*').eq('page', req.params.page).single();
      if (error && error.code !== 'PGRST116') throw error;
      res.json(data ?? { page: req.params.page });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:page', requireAuth, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('seo_settings')
        .update({ ...req.body, page: req.params.page })
        .eq('page', req.params.page)
        .select()
        .single();
      if (error) throw error;
      await logActivity('Updated SEO settings', 'seo', req.params.page, {}, req.user.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
})();
