-- ============================================================
-- Portfolio Admin CMS — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- WEBSITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS website_settings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name     TEXT NOT NULL DEFAULT 'Uzair Ahmad',
  logo_url      TEXT,
  tagline       TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  business_hours TEXT,
  footer_text   TEXT DEFAULT '© 2024 Uzair Ahmad. All rights reserved.',
  primary_color TEXT DEFAULT '#7c5cff',
  secondary_color TEXT DEFAULT '#4cc9f0',
  font_family   TEXT DEFAULT 'Inter',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  show_loader   BOOLEAN DEFAULT TRUE,
  enable_animations BOOLEAN DEFAULT TRUE,
  copyright     TEXT DEFAULT 'Uzair Ahmad',
  social_github TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  social_behance TEXT,
  social_dribbble TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed one settings row
INSERT INTO website_settings (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ============================================================
-- HOME CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS home_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title      TEXT DEFAULT 'Full Stack Developer',
  hero_subtitle   TEXT DEFAULT '& UI/UX Designer',
  hero_description TEXT DEFAULT 'I craft polished digital products that blend technical precision with thoughtful design.',
  cta_label       TEXT DEFAULT 'View Projects',
  cta_url         TEXT DEFAULT '/projects',
  resume_label    TEXT DEFAULT 'Download Resume',
  resume_url      TEXT,
  profile_image_url TEXT,
  hero_bg_url     TEXT,
  show_animation  BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO home_content (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ============================================================
-- ABOUT CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS about_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biography       TEXT DEFAULT 'A developer focused on thoughtful products and memorable interfaces.',
  profile_image_url TEXT,
  location        TEXT DEFAULT 'Pakistan · Available worldwide',
  experience_years INT DEFAULT 3,
  age             INT,
  email           TEXT,
  phone           TEXT,
  languages       TEXT[] DEFAULT ARRAY['English', 'Urdu'],
  availability    TEXT DEFAULT 'Available for freelance',
  resume_url      TEXT,
  achievements    JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO about_content (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  icon          TEXT DEFAULT 'Code2',
  color         TEXT DEFAULT '#7c5cff',
  category      TEXT DEFAULT 'Development',
  display_order INT DEFAULT 0,
  status        TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'draft')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  category      TEXT DEFAULT 'Frontend',
  percentage    INT DEFAULT 80 CHECK (percentage BETWEEN 0 AND 100),
  icon          TEXT,
  color         TEXT DEFAULT '#7c5cff',
  display_order INT DEFAULT 0,
  status        TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT UNIQUE,
  short_description TEXT,
  full_description  TEXT,
  category          TEXT DEFAULT 'Web App',
  client            TEXT,
  tech_stack        TEXT[] DEFAULT ARRAY[]::TEXT[],
  features          TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail_url     TEXT,
  live_url          TEXT,
  github_url        TEXT,
  case_study_url    TEXT,
  completion_date   DATE,
  status            TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  featured          BOOLEAN DEFAULT FALSE,
  seo_title         TEXT,
  seo_description   TEXT,
  seo_keywords      TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order     INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS project_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  is_primary  BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXPERIENCE
-- ============================================================
CREATE TABLE IF NOT EXISTS experience (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company         TEXT NOT NULL,
  position        TEXT NOT NULL,
  start_date      DATE,
  end_date        DATE,
  is_current      BOOLEAN DEFAULT FALSE,
  description     TEXT,
  logo_url        TEXT,
  location        TEXT,
  employment_type TEXT DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time','Part-time','Contract','Freelance','Internship')),
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EDUCATION
-- ============================================================
CREATE TABLE IF NOT EXISTS education (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute     TEXT NOT NULL,
  degree        TEXT NOT NULL,
  field_of_study TEXT,
  start_date    DATE,
  end_date      DATE,
  is_current    BOOLEAN DEFAULT FALSE,
  description   TEXT,
  grade         TEXT,
  certificate_url TEXT,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  organization    TEXT NOT NULL,
  issue_date      DATE,
  expiry_date     DATE,
  credential_url  TEXT,
  image_url       TEXT,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  position    TEXT,
  company     TEXT,
  photo_url   TEXT,
  review      TEXT NOT NULL,
  rating      INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  featured    BOOLEAN DEFAULT FALSE,
  status      TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  display_order INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES (Contact Form)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  ip_address  TEXT,
  country     TEXT,
  status      TEXT DEFAULT 'unread' CHECK (status IN ('unread','read','starred','archived','trash')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGE REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS message_replies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  sent_by    TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
CREATE TABLE IF NOT EXISTS media_library (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename    TEXT NOT NULL,
  original_name TEXT,
  url         TEXT NOT NULL,
  folder      TEXT DEFAULT 'general',
  mime_type   TEXT,
  size_bytes  BIGINT,
  alt_text    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEO SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page                  TEXT UNIQUE NOT NULL DEFAULT 'home',
  meta_title            TEXT,
  meta_description      TEXT,
  meta_keywords         TEXT[] DEFAULT ARRAY[]::TEXT[],
  og_title              TEXT,
  og_description        TEXT,
  og_image_url          TEXT,
  twitter_card          TEXT DEFAULT 'summary_large_image',
  twitter_title         TEXT,
  twitter_description   TEXT,
  twitter_image_url     TEXT,
  robots_txt            TEXT DEFAULT 'index, follow',
  google_analytics_id   TEXT,
  google_search_console TEXT,
  facebook_pixel_id     TEXT,
  schema_org            TEXT,
  sitemap_enabled       BOOLEAN DEFAULT TRUE,
  favicon_url           TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO seo_settings (page) VALUES ('home'),('projects'),('services'),('about'),('skills'),('contact')
ON CONFLICT (page) DO NOTHING;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  details     JSONB DEFAULT '{}',
  user_id     UUID,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured    ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_slug        ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_services_status      ON services(status);
CREATE INDEX IF NOT EXISTS idx_skills_status        ON skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_category      ON skills(category);
CREATE INDEX IF NOT EXISTS idx_messages_status      ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created     ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folder         ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_activity_created     ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_order     ON experience(display_order);
CREATE INDEX IF NOT EXISTS idx_education_order      ON education(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_status  ON testimonials(status);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'website_settings','home_content','about_content','services','skills',
    'projects','experience','education','certificates','testimonials',
    'messages','media_library','seo_settings'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE website_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE education          ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs      ENABLE ROW LEVEL SECURITY;

-- Public read policies (for portfolio pages)
CREATE POLICY "public_read_services"    ON services      FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_skills"      ON skills        FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_projects"    ON projects      FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_experience"  ON experience    FOR SELECT USING (TRUE);
CREATE POLICY "public_read_education"   ON education     FOR SELECT USING (TRUE);
CREATE POLICY "public_read_certificates" ON certificates FOR SELECT USING (TRUE);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_home"        ON home_content  FOR SELECT USING (TRUE);
CREATE POLICY "public_read_about"       ON about_content FOR SELECT USING (TRUE);
CREATE POLICY "public_read_settings"    ON website_settings FOR SELECT USING (TRUE);
CREATE POLICY "public_read_seo"         ON seo_settings  FOR SELECT USING (TRUE);
CREATE POLICY "public_read_proj_images" ON project_images FOR SELECT USING (TRUE);

-- Public insert for messages (contact form)
CREATE POLICY "public_insert_messages"  ON messages FOR INSERT WITH CHECK (TRUE);

-- Authenticated admin can do everything
CREATE POLICY "admin_all_website_settings"  ON website_settings  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_home"             ON home_content       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_about"            ON about_content      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_services"         ON services           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_skills"           ON skills             FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_projects"         ON projects           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_proj_images"      ON project_images     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_experience"       ON experience         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_education"        ON education          FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_certificates"     ON certificates       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_testimonials"     ON testimonials       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_messages"         ON messages           FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_replies"          ON message_replies    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_media"            ON media_library      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_seo"              ON seo_settings       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_logs"             ON activity_logs      FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- NOTE: Create these buckets in your Supabase Storage dashboard:
--   • profile-images  (public)
--   • project-images  (public)
--   • certificates    (public)
--   • resume          (public)
--   • website-assets  (public)
--   • general         (public)
