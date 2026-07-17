import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import { fetchHome, upsertHome, logActivity } from '../../services/adminApi';

const schema = z.object({
  hero_title:       z.string().min(1, 'Required'),
  hero_subtitle:    z.string().optional(),
  hero_description: z.string().optional(),
  cta_label:        z.string().optional(),
  cta_url:          z.string().optional(),
  resume_label:     z.string().optional(),
  resume_url:       z.string().optional(),
  profile_image_url: z.string().optional(),
  hero_bg_url:      z.string().optional(),
  show_animation:   z.boolean().optional(),
  social_github:    z.string().optional(),
  social_linkedin:  z.string().optional(),
  social_twitter:   z.string().optional(),
  social_facebook:  z.string().optional(),
  social_instagram: z.string().optional(),
  social_youtube:   z.string().optional(),
  social_behance:   z.string().optional(),
  social_dribbble:  z.string().optional(),
  social_email:     z.string().optional(),
  social_phone:     z.string().optional(),
});

export default function HomeManager() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn:  fetchHome,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hero_title: '', hero_subtitle: '', hero_description: '',
      cta_label: 'View Projects', cta_url: '/projects',
      resume_label: 'Download Resume', resume_url: '',
      profile_image_url: '', hero_bg_url: '',
      show_animation: true,
      social_github: '', social_linkedin: '', social_twitter: '',
      social_facebook: '', social_instagram: '', social_youtube: '',
      social_behance: '', social_dribbble: '', social_email: '', social_phone: '',
    },
  });

  // Hydrate form once data loads
  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const profileUrl = watch('profile_image_url');

  const mutation = useMutation({
    mutationFn: (values) => upsertHome({ ...values, id: data?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home'] });
      toast.success('Home content saved');
      logActivity('Updated home content', 'home');
    },
    onError: (err) => toast.error(err.message ?? 'Save failed'),
  });

  const onSubmit = (values) => mutation.mutate(values);

  if (isLoading) return (
    <div className="dashboard-content" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
      <Loader2 size={28} style={{ color: '#8790a9', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <AdminPage
      eyebrow="HOME PAGE"
      title="Home Content"
      subtitle="Edit the hero section, call-to-action buttons, and all social links."
      actions={
        <button
          className="primary-button"
          onClick={handleSubmit(onSubmit)}
          disabled={mutation.isPending || !isDirty}
        >
          {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          Save changes
        </button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

          {/* ── Hero section ── */}
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-heading"><div><p>HERO SECTION</p><h2>Main headline & description</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Hero Title" error={errors.hero_title?.message} required>
                  <input className="content-form input" {...register('hero_title')} placeholder="Full Stack Developer" />
                </FormField>
                <FormField label="Hero Subtitle" error={errors.hero_subtitle?.message}>
                  <input className="content-form input" {...register('hero_subtitle')} placeholder="& UI/UX Designer" />
                </FormField>
              </div>
              <FormField label="Hero Description" error={errors.hero_description?.message}>
                <textarea {...register('hero_description')} rows={3} placeholder="I craft polished digital products…" />
              </FormField>
            </div>
          </article>

          {/* ── CTA Buttons ── */}
          <article className="panel">
            <div className="panel-heading"><div><p>BUTTONS</p><h2>Call-to-action</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="CTA Label">
                  <input {...register('cta_label')} placeholder="View Projects" />
                </FormField>
                <FormField label="CTA URL">
                  <input {...register('cta_url')} placeholder="/projects" />
                </FormField>
                <FormField label="Resume Button Label">
                  <input {...register('resume_label')} placeholder="Download Resume" />
                </FormField>
                <FormField label="Resume File URL" hint="Paste a public URL to your PDF">
                  <input {...register('resume_url')} placeholder="https://…" />
                </FormField>
              </div>
              <FormField label="Show Hero Animation">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#aab3c8', fontSize: 12 }}>
                  <input type="checkbox" {...register('show_animation')} style={{ width: 'auto' }} />
                  Enable Three.js / Framer Motion animation on hero
                </label>
              </FormField>
            </div>
          </article>

          {/* ── Profile image ── */}
          <article className="panel">
            <div className="panel-heading"><div><p>MEDIA</p><h2>Profile & hero image</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Profile Image">
                <ImageUpload
                  value={profileUrl}
                  onChange={(url) => setValue('profile_image_url', url, { shouldDirty: true })}
                  bucket="profile-images"
                  folder="profile"
                  label="Profile image"
                />
              </FormField>
              <FormField label="Or paste image URL">
                <input {...register('profile_image_url')} placeholder="https://…" />
              </FormField>
            </div>
          </article>

          {/* ── Social links ── */}
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-heading"><div><p>SOCIAL LINKS</p><h2>External profiles & contact info</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { key: 'social_github',    placeholder: 'https://github.com/…',    label: 'GitHub' },
                  { key: 'social_linkedin',  placeholder: 'https://linkedin.com/…',  label: 'LinkedIn' },
                  { key: 'social_twitter',   placeholder: 'https://x.com/…',         label: 'Twitter / X' },
                  { key: 'social_facebook',  placeholder: 'https://facebook.com/…',  label: 'Facebook' },
                  { key: 'social_instagram', placeholder: 'https://instagram.com/…', label: 'Instagram' },
                  { key: 'social_youtube',   placeholder: 'https://youtube.com/…',   label: 'YouTube' },
                  { key: 'social_behance',   placeholder: 'https://behance.net/…',   label: 'Behance' },
                  { key: 'social_dribbble',  placeholder: 'https://dribbble.com/…',  label: 'Dribbble' },
                  { key: 'social_email',     placeholder: 'hello@example.com',       label: 'Email' },
                  { key: 'social_phone',     placeholder: '+92 300 0000000',          label: 'Phone' },
                ].map(({ key, placeholder, label }) => (
                  <FormField key={key} label={label}>
                    <input {...register(key)} placeholder={placeholder} />
                  </FormField>
                ))}
              </div>
            </div>
          </article>

        </div>

        {/* Sticky save bar */}
        <div style={{
          position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'flex-end',
          gap: 10, marginTop: 20, zIndex: 5,
        }}>
          <button type="button" className="secondary-button" onClick={() => reset(data)}>
            <RefreshCw size={13} /> Discard
          </button>
          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending
              ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              : <Save size={14} />}
            Save all changes
          </button>
        </div>
      </form>
    </AdminPage>
  );
}
