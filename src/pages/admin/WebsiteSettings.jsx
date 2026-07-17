import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import { fetchSettings, upsertSettings, logActivity } from '../../services/adminApi';

export default function WebsiteSettings() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['website-settings'],
    queryFn: fetchSettings,
  });

  const { register, handleSubmit, reset, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      site_name: '', tagline: '', email: '', phone: '', address: '', business_hours: '',
      footer_text: '', copyright: '', primary_color: '#7c5cff', secondary_color: '#4cc9f0',
      font_family: 'Inter', maintenance_mode: false, show_loader: true, enable_animations: true,
      social_github: '', social_linkedin: '', social_twitter: '', social_facebook: '',
      social_instagram: '', social_youtube: '', social_behance: '', social_dribbble: '',
      logo_url: '',
    },
  });

  useEffect(() => { if (data) reset(data); }, [data, reset]);

  const maintenanceMode = watch('maintenance_mode');

  const mutation = useMutation({
    mutationFn: (values) => upsertSettings({ ...values, id: data?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-settings'] });
      toast.success('Website settings saved');
      logActivity('Updated website settings', 'settings');
    },
    onError: e => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="dashboard-content" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
      <Loader2 size={28} style={{ color: '#8790a9', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <AdminPage
      eyebrow="SETTINGS"
      title="Website Settings"
      subtitle="Control global site configuration, branding, and contact information."
      actions={
        <button className="primary-button" onClick={handleSubmit((v) => mutation.mutate(v))} disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          Save settings
        </button>
      }
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

          {/* Branding */}
          <article className="panel">
            <div className="panel-heading"><div><p>BRANDING</p><h2>Identity & appearance</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Site Name"><input {...register('site_name')} placeholder="Uzair Ahmad" /></FormField>
              <FormField label="Tagline"><input {...register('tagline')} placeholder="Full Stack Developer & UI/UX Designer" /></FormField>
              <FormField label="Logo URL" hint="Paste a public URL or upload via Media Library"><input {...register('logo_url')} placeholder="https://…" /></FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Primary Color">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" {...register('primary_color')} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: 2 }} />
                    <input {...register('primary_color')} placeholder="#7c5cff" style={{ flex: 1 }} />
                  </div>
                </FormField>
                <FormField label="Secondary Color">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" {...register('secondary_color')} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: 2 }} />
                    <input {...register('secondary_color')} placeholder="#4cc9f0" style={{ flex: 1 }} />
                  </div>
                </FormField>
              </div>
              <FormField label="Font Family">
                <select {...register('font_family')}>
                  {['Inter','Manrope','Poppins','DM Sans','Space Grotesk','Outfit'].map(f => <option key={f}>{f}</option>)}
                </select>
              </FormField>
            </div>
          </article>

          {/* Contact */}
          <article className="panel">
            <div className="panel-heading"><div><p>CONTACT INFO</p><h2>Business details</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Email"><input type="email" {...register('email')} placeholder="hello@uzairahmad.dev" /></FormField>
              <FormField label="Phone"><input {...register('phone')} placeholder="+92 300 0000000" /></FormField>
              <FormField label="Address"><input {...register('address')} placeholder="Lahore, Pakistan" /></FormField>
              <FormField label="Business Hours"><input {...register('business_hours')} placeholder="Mon–Fri, 9 AM – 6 PM PKT" /></FormField>
            </div>
          </article>

          {/* Footer */}
          <article className="panel">
            <div className="panel-heading"><div><p>FOOTER</p><h2>Footer text & copyright</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Footer Text"><textarea {...register('footer_text')} rows={3} placeholder="Thanks for visiting my portfolio!" /></FormField>
              <FormField label="Copyright"><input {...register('copyright')} placeholder="© 2024 Uzair Ahmad. All rights reserved." /></FormField>
            </div>
          </article>

          {/* Behaviour */}
          <article className="panel">
            <div className="panel-heading"><div><p>BEHAVIOUR</p><h2>Features & toggles</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              {[
                { key: 'show_loader',        label: 'Show loading screen on page load' },
                { key: 'enable_animations',  label: 'Enable Framer Motion / Three.js animations' },
              ].map(({ key, label }) => (
                <FormField key={key} label={label}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aab3c8', fontSize: 12, cursor: 'pointer' }}>
                    <input type="checkbox" {...register(key)} style={{ width: 'auto' }} />
                    Enabled
                  </label>
                </FormField>
              ))}

              {/* Maintenance mode — highlighted warning */}
              <div style={{
                background: maintenanceMode ? 'rgba(255,165,0,0.08)' : 'transparent',
                border: `1px solid ${maintenanceMode ? 'rgba(255,165,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 10, padding: 14, transition: 'all 0.3s',
              }}>
                <FormField label="Maintenance Mode">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: maintenanceMode ? '#ffb347' : '#aab3c8', fontSize: 12, cursor: 'pointer', fontWeight: maintenanceMode ? 700 : 400 }}>
                    <input type="checkbox" {...register('maintenance_mode')} style={{ width: 'auto' }} />
                    Enable maintenance mode (hides public site)
                  </label>
                </FormField>
                {maintenanceMode && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, fontSize: 11, color: '#ffb347' }}>
                    <AlertTriangle size={13} />
                    The public portfolio will show a maintenance page when this is on.
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Social links */}
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-heading"><div><p>SOCIAL MEDIA</p><h2>Global social links</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { key: 'social_github',    label: 'GitHub',    placeholder: 'https://github.com/…' },
                  { key: 'social_linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/…' },
                  { key: 'social_twitter',   label: 'Twitter/X', placeholder: 'https://x.com/…' },
                  { key: 'social_facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/…' },
                  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
                  { key: 'social_youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/…' },
                  { key: 'social_behance',   label: 'Behance',   placeholder: 'https://behance.net/…' },
                  { key: 'social_dribbble',  label: 'Dribbble',  placeholder: 'https://dribbble.com/…' },
                ].map(({ key, label, placeholder }) => (
                  <FormField key={key} label={label}>
                    <input {...register(key)} placeholder={placeholder} />
                  </FormField>
                ))}
              </div>
            </div>
          </article>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, position: 'sticky', bottom: 24 }}>
          <button type="button" className="secondary-button" onClick={() => reset(data)}><RefreshCw size={13} /> Discard</button>
          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            Save all settings
          </button>
        </div>
      </form>
    </AdminPage>
  );
}
