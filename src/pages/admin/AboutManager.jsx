import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import { fetchAbout, upsertAbout, logActivity } from '../../services/adminApi';

const schema = z.object({
  biography:         z.string().optional(),
  profile_image_url: z.string().optional(),
  location:          z.string().optional(),
  experience_years:  z.coerce.number().int().min(0).optional(),
  age:               z.coerce.number().int().min(0).optional().nullable(),
  email:             z.string().email('Invalid email').optional().or(z.literal('')),
  phone:             z.string().optional(),
  availability:      z.string().optional(),
  resume_url:        z.string().optional(),
});

export default function AboutManager() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn:  fetchAbout,
  });

  const [languages, setLanguages]       = useState(['English', 'Urdu']);
  const [langInput,  setLangInput]      = useState('');
  const [achievements, setAchievements] = useState([]);
  const [achInput,  setAchInput]        = useState({ title: '', value: '' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      biography: '', profile_image_url: '', location: '',
      experience_years: 3, age: null, email: '', phone: '',
      availability: 'Available for freelance', resume_url: '',
    },
  });

  const profileUrl = watch('profile_image_url');

  useEffect(() => {
    if (data) {
      reset(data);
      if (Array.isArray(data.languages))    setLanguages(data.languages);
      if (Array.isArray(data.achievements)) setAchievements(data.achievements);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values) => upsertAbout({
      ...values, id: data?.id,
      languages,
      achievements,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['about'] });
      toast.success('About content saved');
      logActivity('Updated about content', 'about');
    },
    onError: (err) => toast.error(err.message ?? 'Save failed'),
  });

  const addLanguage = () => {
    const v = langInput.trim();
    if (v && !languages.includes(v)) setLanguages([...languages, v]);
    setLangInput('');
  };
  const removeLanguage = (l) => setLanguages(languages.filter(x => x !== l));

  const addAchievement = () => {
    if (!achInput.title.trim() || !achInput.value.trim()) return;
    setAchievements([...achievements, { ...achInput, id: Date.now() }]);
    setAchInput({ title: '', value: '' });
  };
  const removeAchievement = (id) => setAchievements(achievements.filter(a => a.id !== id));

  if (isLoading) return (
    <div className="dashboard-content" style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}>
      <Loader2 size={28} style={{ color: '#8790a9', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <AdminPage
      eyebrow="ABOUT PAGE"
      title="About Content"
      subtitle="Update your biography, personal details, languages, and achievements."
      actions={
        <button className="primary-button" onClick={handleSubmit((v) => mutation.mutate(v))} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          Save changes
        </button>
      }
    >
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

          {/* Biography */}
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-heading"><div><p>BIOGRAPHY</p><h2>About yourself</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Biography" error={errors.biography?.message} hint="Shown on the About page. Supports plain text.">
                <textarea {...register('biography')} rows={5} placeholder="A developer focused on thoughtful products…" />
              </FormField>
            </div>
          </article>

          {/* Profile image */}
          <article className="panel">
            <div className="panel-heading"><div><p>PROFILE PHOTO</p><h2>Your picture</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <FormField label="Profile Image">
                <ImageUpload
                  value={profileUrl}
                  onChange={(url) => setValue('profile_image_url', url, { shouldDirty: true })}
                  bucket="profile-images"
                  folder="profile"
                />
              </FormField>
              <FormField label="Or paste image URL">
                <input {...register('profile_image_url')} placeholder="https://…" />
              </FormField>
            </div>
          </article>

          {/* Personal details */}
          <article className="panel">
            <div className="panel-heading"><div><p>DETAILS</p><h2>Personal info</h2></div></div>
            <div className="content-form" style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Location" error={errors.location?.message}>
                  <input {...register('location')} placeholder="Lahore, Pakistan" />
                </FormField>
                <FormField label="Availability" error={errors.availability?.message}>
                  <input {...register('availability')} placeholder="Available for freelance" />
                </FormField>
                <FormField label="Years of Experience" error={errors.experience_years?.message}>
                  <input type="number" min={0} {...register('experience_years')} />
                </FormField>
                <FormField label="Age" error={errors.age?.message}>
                  <input type="number" min={0} {...register('age')} placeholder="Optional" />
                </FormField>
                <FormField label="Contact Email" error={errors.email?.message}>
                  <input type="email" {...register('email')} placeholder="hello@example.com" />
                </FormField>
                <FormField label="Phone" error={errors.phone?.message}>
                  <input {...register('phone')} placeholder="+92 300 0000000" />
                </FormField>
              </div>
              <FormField label="Resume URL" hint="Direct link to your resume PDF">
                <input {...register('resume_url')} placeholder="https://…" />
              </FormField>
            </div>
          </article>

          {/* Languages */}
          <article className="panel">
            <div className="panel-heading"><div><p>LANGUAGES</p><h2>Spoken languages</h2></div></div>
            <div style={{ padding: '16px 0 0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {languages.map(l => (
                  <span key={l} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#7c5cff22', border: '1px solid #7c5cff44',
                    borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#c4b8ff',
                  }}>
                    {l}
                    <button type="button" onClick={() => removeLanguage(l)} style={{ background: 'transparent', border: 0, color: '#ff8ba1', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={langInput}
                  onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  placeholder="Add language…"
                  style={{ flex: 1, background: '#090e1f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#eef0fc', padding: '9px 12px', font: '12px Manrope,sans-serif', outline: 'none' }}
                />
                <button type="button" className="secondary-button" onClick={addLanguage}>
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </article>

          {/* Achievements */}
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            <div className="panel-heading"><div><p>ACHIEVEMENTS</p><h2>Key stats & milestones</h2></div></div>
            <div style={{ marginTop: 16 }}>
              {achievements.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
                  {achievements.map(a => (
                    <div key={a.id} style={{
                      background: '#ffffff06', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <strong style={{ fontSize: 18, color: '#9d8eff', letterSpacing: '-0.5px' }}>{a.value}</strong>
                        <p style={{ fontSize: 11, color: '#8790a9', margin: '3px 0 0' }}>{a.title}</p>
                      </div>
                      <button type="button" onClick={() => removeAchievement(a.id)} style={{ background: 'transparent', border: 0, color: '#ff8ba1', cursor: 'pointer' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                <FormField label="Title (e.g. Projects Completed)">
                  <input
                    value={achInput.title}
                    onChange={e => setAchInput(a => ({ ...a, title: e.target.value }))}
                    placeholder="Projects Completed"
                    style={{ background: '#090e1f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#eef0fc', padding: '9px 12px', font: '12px Manrope,sans-serif', outline: 'none', width: '100%' }}
                  />
                </FormField>
                <FormField label="Value (e.g. 50+)">
                  <input
                    value={achInput.value}
                    onChange={e => setAchInput(a => ({ ...a, value: e.target.value }))}
                    placeholder="50+"
                    style={{ background: '#090e1f', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#eef0fc', padding: '9px 12px', font: '12px Manrope,sans-serif', outline: 'none', width: '100%' }}
                  />
                </FormField>
                <button type="button" className="primary-button" onClick={addAchievement} style={{ alignSelf: 'flex-end' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </article>

        </div>

        {/* Sticky save bar */}
        <div style={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="secondary-button" onClick={() => { reset(data); if (data?.languages) setLanguages(data.languages); if (data?.achievements) setAchievements(data.achievements); }}>
            <RefreshCw size={13} /> Discard
          </button>
          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            Save all changes
          </button>
        </div>
      </form>
    </AdminPage>
  );
}
