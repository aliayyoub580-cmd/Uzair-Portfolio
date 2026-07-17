/**
 * Central service layer — all Supabase queries for the admin panel.
 * Returns plain data; React Query handles caching and error states.
 */
import { supabase } from '../lib/supabase';

// ── Generic helpers ───────────────────────────────────────────
const handle = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

// ── Dashboard stats ────────────────────────────────────────────
export async function fetchDashboardStats() {
  const [services, skills, projects, messages, unread, activity] = await Promise.all([
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);
  return {
    services:  services.count  ?? 0,
    skills:    skills.count    ?? 0,
    projects:  projects.count  ?? 0,
    messages:  messages.count  ?? 0,
    unread:    unread.count     ?? 0,
    activity:  activity.data   ?? [],
  };
}

export async function fetchRecentMessages(limit = 5) {
  return handle(
    await supabase
      .from('messages')
      .select('id,name,email,subject,status,created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
  );
}

// ── Activity logs ──────────────────────────────────────────────
export async function logActivity(action, entity_type = null, entity_id = null, details = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('activity_logs').insert({
    action, entity_type, entity_id, details, user_id: user?.id ?? null,
  });
}

// ── Home content ───────────────────────────────────────────────
export async function fetchHome() {
  const { data } = await supabase.from('home_content').select('*').limit(1).single();
  return data;
}
export async function upsertHome(payload) {
  if (payload.id) {
    return handle(await supabase.from('home_content').update(payload).eq('id', payload.id).select().single());
  }
  return handle(await supabase.from('home_content').insert(payload).select().single());
}

// ── About content ──────────────────────────────────────────────
export async function fetchAbout() {
  const { data } = await supabase.from('about_content').select('*').limit(1).single();
  return data;
}
export async function upsertAbout(payload) {
  if (payload.id) {
    return handle(await supabase.from('about_content').update(payload).eq('id', payload.id).select().single());
  }
  return handle(await supabase.from('about_content').insert(payload).select().single());
}

// ── Services ───────────────────────────────────────────────────
export const fetchServices     = () => handle(supabase.from('services').select('*').order('display_order'));
export const createService     = (d) => handle(supabase.from('services').insert(d).select().single());
export const updateService     = (id, d) => handle(supabase.from('services').update(d).eq('id', id).select().single());
export const deleteService     = (id) => handle(supabase.from('services').delete().eq('id', id));

// ── Skills ─────────────────────────────────────────────────────
export const fetchSkills       = () => handle(supabase.from('skills').select('*').order('display_order'));
export const createSkill       = (d) => handle(supabase.from('skills').insert(d).select().single());
export const updateSkill       = (id, d) => handle(supabase.from('skills').update(d).eq('id', id).select().single());
export const deleteSkill       = (id) => handle(supabase.from('skills').delete().eq('id', id));

// ── Projects ───────────────────────────────────────────────────
export const fetchProjects     = () => handle(supabase.from('projects').select('*').order('display_order'));
export const fetchProject      = (id) => handle(supabase.from('projects').select('*, project_images(*)').eq('id', id).single());
export const createProject     = (d) => handle(supabase.from('projects').insert(d).select().single());
export const updateProject     = (id, d) => handle(supabase.from('projects').update(d).eq('id', id).select().single());
export const deleteProject     = (id) => handle(supabase.from('projects').delete().eq('id', id));
export const addProjectImage   = (d) => handle(supabase.from('project_images').insert(d).select().single());
export const deleteProjectImage = (id) => handle(supabase.from('project_images').delete().eq('id', id));

// ── Experience ─────────────────────────────────────────────────
export const fetchExperience   = () => handle(supabase.from('experience').select('*').order('display_order'));
export const createExperience  = (d) => handle(supabase.from('experience').insert(d).select().single());
export const updateExperience  = (id, d) => handle(supabase.from('experience').update(d).eq('id', id).select().single());
export const deleteExperience  = (id) => handle(supabase.from('experience').delete().eq('id', id));

// ── Education ──────────────────────────────────────────────────
export const fetchEducation    = () => handle(supabase.from('education').select('*').order('display_order'));
export const createEducation   = (d) => handle(supabase.from('education').insert(d).select().single());
export const updateEducation   = (id, d) => handle(supabase.from('education').update(d).eq('id', id).select().single());
export const deleteEducation   = (id) => handle(supabase.from('education').delete().eq('id', id));

// ── Certificates ───────────────────────────────────────────────
export const fetchCertificates  = () => handle(supabase.from('certificates').select('*').order('display_order'));
export const createCertificate  = (d) => handle(supabase.from('certificates').insert(d).select().single());
export const updateCertificate  = (id, d) => handle(supabase.from('certificates').update(d).eq('id', id).select().single());
export const deleteCertificate  = (id) => handle(supabase.from('certificates').delete().eq('id', id));

// ── Testimonials ───────────────────────────────────────────────
export const fetchTestimonials  = () => handle(supabase.from('testimonials').select('*').order('display_order'));
export const createTestimonial  = (d) => handle(supabase.from('testimonials').insert(d).select().single());
export const updateTestimonial  = (id, d) => handle(supabase.from('testimonials').update(d).eq('id', id).select().single());
export const deleteTestimonial  = (id) => handle(supabase.from('testimonials').delete().eq('id', id));

// ── Messages ───────────────────────────────────────────────────
export const fetchMessages      = (filters = {}) => {
  let q = supabase.from('messages').select('*, message_replies(*)').order('created_at', { ascending: false });
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.search) q = q.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
  return handle(q);
};
export const updateMessage     = (id, d) => handle(supabase.from('messages').update(d).eq('id', id).select().single());
export const deleteMessage     = (id) => handle(supabase.from('messages').delete().eq('id', id));
export const addReply          = (d) => handle(supabase.from('message_replies').insert(d).select().single());

// ── Media library ──────────────────────────────────────────────
export const fetchMedia        = (folder = null) => {
  let q = supabase.from('media_library').select('*').order('created_at', { ascending: false });
  if (folder) q = q.eq('folder', folder);
  return handle(q);
};
export const saveMedia         = (d) => handle(supabase.from('media_library').insert(d).select().single());
export const deleteMedia       = (id) => handle(supabase.from('media_library').delete().eq('id', id));
export const updateMedia       = (id, d) => handle(supabase.from('media_library').update(d).eq('id', id).select().single());

export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}
export async function deleteStorageFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

// ── SEO settings ───────────────────────────────────────────────
export const fetchSeo          = (page) => handle(supabase.from('seo_settings').select('*').eq('page', page).single());
export const upsertSeo         = (page, d) => handle(supabase.from('seo_settings').update(d).eq('page', page).select().single());

// ── Website settings ───────────────────────────────────────────
export async function fetchSettings() {
  const { data } = await supabase.from('website_settings').select('*').limit(1).single();
  return data;
}
export async function upsertSettings(payload) {
  if (payload.id) {
    return handle(await supabase.from('website_settings').update(payload).eq('id', payload.id).select().single());
  }
  return handle(await supabase.from('website_settings').insert(payload).select().single());
}
