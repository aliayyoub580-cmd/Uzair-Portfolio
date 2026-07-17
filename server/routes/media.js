/**
 * /api/media — media_library CRUD (metadata only; files go direct to Supabase Storage from frontend)
 */
import express from 'express';
import { requireAuth }   from '../middlewares/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let q = supabaseAdmin.from('media_library').select('*').order('created_at', { ascending: false });
    if (req.query.folder) q = q.eq('folder', req.query.folder);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('media_library').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('media_library').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('media_library').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
