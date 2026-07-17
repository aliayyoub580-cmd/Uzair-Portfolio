/**
 * Public-facing Supabase queries — no auth required.
 * These use the anon key with RLS enforcing `status = 'published'` where appropriate.
 */
import { supabase } from '../lib/supabase';

const handle = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

export const getHomeContent    = () => handle(supabase.from('home_content').select('*').limit(1).single());
export const getAboutContent   = () => handle(supabase.from('about_content').select('*').limit(1).single());
export const getWebsiteSettings = () => handle(supabase.from('website_settings').select('*').limit(1).single());

export const getServices   = () => handle(
  supabase.from('services').select('*').eq('status','published').order('display_order')
);
export const getSkills     = () => handle(
  supabase.from('skills').select('*').eq('status','published').order('display_order')
);
export const getProjects   = (opts = {}) => {
  let q = supabase.from('projects').select('*, project_images(*)').eq('status','published').order('display_order');
  if (opts.featured) q = q.eq('featured', true);
  return handle(q);
};
export const getProject    = (slug) => handle(
  supabase.from('projects').select('*, project_images(*)').eq('slug', slug).eq('status','published').single()
);
export const getExperience = () => handle(
  supabase.from('experience').select('*').order('display_order')
);
export const getEducation  = () => handle(
  supabase.from('education').select('*').order('display_order')
);
export const getCertificates = () => handle(
  supabase.from('certificates').select('*').order('display_order')
);
export const getTestimonials = () => handle(
  supabase.from('testimonials').select('*').eq('status','published').order('display_order')
);
export const getSeo = (page) => handle(
  supabase.from('seo_settings').select('*').eq('page', page).single()
);
