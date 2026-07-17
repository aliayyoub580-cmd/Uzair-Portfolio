import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import { fetchSeo, upsertSeo, logActivity } from '../../services/adminApi';

const PAGES = ['home','about','projects','services','skills','contact'];

export default function SeoSettings() {
  const qc = useQueryClient();
  const [activePage, setActivePage] = useState('home');

  const { data, isLoading } = useQuery({
    queryKey: ['seo', activePage],
    queryFn:  () => fetchSeo(activePage),
  });

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      meta_title:'', meta_description:'', meta_keywords:'',
      og_title:'', og_description:'', og_image_url:'',
      twitter_card:'summary_large_image', twitter_title:'', twitter_description:'', twitter_image_url:'',
      robots_txt:'index, follow',
      google_analytics_id:'', google_search_console:'', facebook_pixel_id:'',
      schema_org:'', favicon_url:'', sitemap_enabled: true,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        meta_keywords: Array.isArray(data.meta_keywords) ? data.meta_keywords.join(', ') : (data.meta_keywords ?? ''),
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values) => upsertSeo(activePage, {
      ...values,
      meta_keywords: values.meta_keywords ? values.meta_keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo', activePage] });
      toast.success(`SEO settings saved for ${activePage}`);
      logActivity('Updated SEO settings', 'seo', activePage);
    },
    onError: e => toast.error(e.message),
  });

  return (
    <AdminPage
      eyebrow="SEO SETTINGS"
      title="SEO Settings"
      subtitle="Configure meta tags, Open Graph, and analytics for each page."
      actions={
        <button className="primary-button" onClick={handleSubmit((v) => mutation.mutate(v))} disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          Save SEO
        </button>
      }
    >
      {/* Page selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, flexWrap: 'wrap' }}>
        {PAGES.map(p => (
          <button key={p} onClick={() => setActivePage(p)}
            style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
              borderColor: activePage === p ? '#7c5cff' : 'rgba(255,255,255,0.08)',
              background: activePage === p ? 'rgba(124,92,255,0.12)' : 'transparent',
              color: activePage === p ? '#c4b8ff' : '#7f89a3',
            }}>
            {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#8790a9' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

            {/* Meta */}
            <article className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-heading"><div><p>META TAGS</p><h2>Basic SEO</h2></div></div>
              <div className="content-form" style={{ marginTop: 20 }}>
                <FormField label="Meta Title" hint="50–60 characters ideal">
                  <input {...register('meta_title')} placeholder={`${activePage.charAt(0).toUpperCase() + activePage.slice(1)} — Uzair Ahmad`} />
                </FormField>
                <FormField label="Meta Description" hint="140–160 characters ideal">
                  <textarea {...register('meta_description')} rows={3} placeholder="A brief description of this page…" />
                </FormField>
                <FormField label="Meta Keywords" hint="Comma-separated keywords">
                  <input {...register('meta_keywords')} placeholder="portfolio, developer, react" />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Robots" hint="e.g. index, follow">
                    <input {...register('robots_txt')} placeholder="index, follow" />
                  </FormField>
                  <FormField label="Favicon URL">
                    <input {...register('favicon_url')} placeholder="https://…/favicon.ico" />
                  </FormField>
                </div>
                <FormField label="Sitemap">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aab3c8', fontSize: 12, cursor: 'pointer' }}>
                    <input type="checkbox" {...register('sitemap_enabled')} style={{ width: 'auto' }} />
                    Include this page in sitemap.xml
                  </label>
                </FormField>
              </div>
            </article>

            {/* Open Graph */}
            <article className="panel">
              <div className="panel-heading"><div><p>OPEN GRAPH</p><h2>Social sharing (Facebook, LinkedIn)</h2></div></div>
              <div className="content-form" style={{ marginTop: 20 }}>
                <FormField label="OG Title"><input {...register('og_title')} placeholder="Defaults to meta title" /></FormField>
                <FormField label="OG Description"><textarea {...register('og_description')} rows={3} placeholder="Defaults to meta description" /></FormField>
                <FormField label="OG Image URL" hint="1200×630px recommended"><input {...register('og_image_url')} placeholder="https://…" /></FormField>
              </div>
            </article>

            {/* Twitter Card */}
            <article className="panel">
              <div className="panel-heading"><div><p>TWITTER CARD</p><h2>Twitter / X sharing</h2></div></div>
              <div className="content-form" style={{ marginTop: 20 }}>
                <FormField label="Card Type">
                  <select {...register('twitter_card')}>
                    <option value="summary_large_image">summary_large_image</option>
                    <option value="summary">summary</option>
                  </select>
                </FormField>
                <FormField label="Twitter Title"><input {...register('twitter_title')} placeholder="Defaults to meta title" /></FormField>
                <FormField label="Twitter Description"><textarea {...register('twitter_description')} rows={2} placeholder="Defaults to meta description" /></FormField>
                <FormField label="Twitter Image URL"><input {...register('twitter_image_url')} placeholder="https://…" /></FormField>
              </div>
            </article>

            {/* Analytics */}
            <article className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-heading"><div><p>ANALYTICS & TRACKING</p><h2>Third-party integrations</h2></div></div>
              <div className="content-form" style={{ marginTop: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <FormField label="Google Analytics ID" hint="G-XXXXXXXXXX">
                    <input {...register('google_analytics_id')} placeholder="G-XXXXXXXXXX" />
                  </FormField>
                  <FormField label="Google Search Console" hint="Verification meta content">
                    <input {...register('google_search_console')} placeholder="verification-code" />
                  </FormField>
                  <FormField label="Facebook Pixel ID">
                    <input {...register('facebook_pixel_id')} placeholder="1234567890" />
                  </FormField>
                </div>
                <FormField label="Schema.org JSON-LD" hint="Paste raw JSON-LD for structured data">
                  <textarea {...register('schema_org')} rows={5} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Person"\n}'} style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }} />
                </FormField>
              </div>
            </article>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, position: 'sticky', bottom: 24 }}>
            <button type="button" className="secondary-button" onClick={() => reset(data)}>
              <RefreshCw size={13} /> Discard
            </button>
            <button type="submit" className="primary-button" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              Save changes
            </button>
          </div>
        </form>
      )}
    </AdminPage>
  );
}
