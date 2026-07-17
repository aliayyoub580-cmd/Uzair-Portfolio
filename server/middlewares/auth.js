import { supabaseAdmin } from '../config/supabase.js';

/**
 * Verifies the Supabase JWT sent as `Authorization: Bearer <token>`.
 * Attaches `req.user` on success.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = header.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.user = user;
  next();
}
