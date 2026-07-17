/**
 * Generic CRUD router factory for simple content tables.
 * Usage: contentRouter('services', validationRules)
 */
import express from 'express';
import { requireAuth }   from '../middlewares/auth.js';
import { validate }      from '../middlewares/validate.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logActivity }   from '../utils/activity.js';

export function contentRouter(table, rules = []) {
  const router = express.Router();

  // Public GET (portfolio pages read data without auth)
  router.get('/', async (req, res) => {
    try {
      let q = supabaseAdmin.from(table).select('*');
      // Apply common sort
      if (req.query.order) q = q.order(req.query.order);
      else q = q.order('display_order', { ascending: true, nullsFirst: false });
      const { data, error } = await q;
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').eq('id', req.params.id).single();
      if (error) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Protected mutations
  router.use(requireAuth);

  router.post('/', rules, validate, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).insert(req.body).select().single();
      if (error) throw error;
      await logActivity(`Created ${table} entry`, table, data.id, {}, req.user.id);
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', rules, validate, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).update(req.body).eq('id', req.params.id).select().single();
      if (error) throw error;
      await logActivity(`Updated ${table} entry`, table, req.params.id, {}, req.user.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from(table).update(req.body).eq('id', req.params.id).select().single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const { error } = await supabaseAdmin.from(table).delete().eq('id', req.params.id);
      if (error) throw error;
      await logActivity(`Deleted ${table} entry`, table, req.params.id, {}, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
