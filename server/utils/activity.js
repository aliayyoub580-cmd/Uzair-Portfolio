import { supabaseAdmin } from '../config/supabase.js';

/**
 * Write an activity log entry from the server side.
 */
export async function logActivity(action, entity_type = null, entity_id = null, details = {}, user_id = null) {
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action, entity_type, entity_id, details, user_id,
    });
  } catch (err) {
    // Non-fatal — just log to console
    console.error('[activity] Failed to log:', err.message);
  }
}
