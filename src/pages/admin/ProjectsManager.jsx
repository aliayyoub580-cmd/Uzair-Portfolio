import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, Star, Eye, EyeOff, Copy, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge from '../../components/admin/StatusBadge';
import ImageUpload from '../../components/admin/ImageUpload';
import { fetchProjects, createProject, updateProject, deleteProject, logActivity } from '../../services/adminApi';

const CATEGORIES = ['Web App','Mobile App','UI/UX','E-Commerce','SaaS','Portfolio','API','Other'];
const STATUSES   = ['published','draft','archived'];

const schema = z.object({
  title:             z.string().min(1, 'Title is required'),
  slug:              z.string().optional(),
  short_description: z.string().optional(),
  full_description:  z.string().optional(),
  category:          z.string().optional(),
  client:            z.string().optional(),
  tech_stack:        z.string().optional(), // comma-separated → parsed to array on submit
  features:          z.string().optional(), // newline-separated → parsed to array on submit
  thumbnail_url:     z.string().optional(),
  live_url:          z.string().optional(),
  github_url:        z.string().optional(),
  case_study_url:    z.string().optional(),
  completion_date:   z.string().optional(),
  status:            z.enum(['published','draft','archived']),
  featured:          z.boolean().optional(),
  seo_title:         z.string().optional(),
  seo_description:   z.string().optional(),
  seo_keywords:      z.string().optional(),
  display_order:     z.coerce.number().int().min(0).optional(),
});

const EMPTY = {
  title:'', slug:'', short_description:'', full_description:'', category:'Web App',
  client:'', tech_stack:'', features:'', thumbnail_url:'',
  live_url:'', github_url:'', case_study_url:'', completion_date:'',
  status:'draft', featured: false,
  seo_title:'', seo_description:'', seo_keywords:'', display_order:0,
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Project row card ──────────────────────────────────────────
function ProjectCard({ project, onEdit, onDelete, onDuplicate, onToggleFeatured }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{
        display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'start', gap: 12,
        padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.075)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg,#1c72c5,#312e81)',
        display: 'grid', placeItems: 'center', fontSize: 18,
        overflow: 'hidden',
      }}>
        {project.thumbnail_url
          ? <img src={project.thumbnail_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '🖼'}
      </div>
      <div>
        <strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {project.title}
          {project.featured && <Star size={11} style={{ color: '#ffd06d', fill: '#ffd06d' }} />}
        </strong>
        <p style={{ fontSize: 11, color: '#7f89a3', margin: '5px 0 0', display: 'flex', gap: 8 }}>
          <span>{project.category}</span>
          <StatusBadge status={project.status} />
        </p>
        {project.short_description && (
          <p style={{ fontSize: 10, color: '#5a6580', margin: '4px 0 0', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.short_description}
          </p>
        )}
      </div>
      <div className="item-actions">
        <button onClick={() => onToggleFeatured(project)} title={project.featured ? 'Unfeature' : 'Feature'} style={{ color: project.featured ? '#ffd06d' : undefined }}>
          <Star size={14} />
        </button>
        <button onClick={() => onDuplicate(project)} title="Duplicate"><Copy size={14} /></button>
        <button onClick={() => onEdit(project)}><Edit3 size={14} /></button>
        <button className="danger" onClick={() => onDelete(project)}><Trash2 size={14} /></button>
      </div>
    </motion.div>
  );
}

export default function ProjectsManager() {
  const qc = useQueryClient();
  const [view, setView]         = useState('list'); // 'list' | 'form'
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'links' | 'seo'

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const thumbnailUrl = watch('thumbnail_url');
  const titleVal     = watch('title');

  const openNew = () => {
    reset(EMPTY); setEditing('new'); setView('form'); setActiveTab('basic');
  };
  const openEdit = (row) => {
    reset({
      ...row,
      tech_stack: Array.isArray(row.tech_stack) ? row.tech_stack.join(', ') : (row.tech_stack ?? ''),
      features:   Array.isArray(row.features)   ? row.features.join('\n')   : (row.features   ?? ''),
      seo_keywords: Array.isArray(row.seo_keywords) ? row.seo_keywords.join(', ') : (row.seo_keywords ?? ''),
      completion_date: row.completion_date ? row.completion_date.slice(0, 10) : '',
    });
    setEditing(row); setView('form'); setActiveTab('basic');
  };
  const closeForm = () => { setEditing(null); setView('list'); };

  const saveMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        ...values,
        slug:         values.slug || slugify(values.title),
        tech_stack:   values.tech_stack ? values.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : [],
        features:     values.features   ? values.features.split('\n').map(s => s.trim()).filter(Boolean)  : [],
        seo_keywords: values.seo_keywords ? values.seo_keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
        completion_date: values.completion_date || null,
      };
      return editing === 'new' ? createProject(payload) : updateProject(editing.id, payload);
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success(editing === 'new' ? 'Project created' : 'Project updated');
      logActivity(editing === 'new' ? 'Created project' : 'Updated project', 'project', v.title);
      closeForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(deleting.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setDeleting(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleDuplicate = async (row) => {
    const { id, created_at, updated_at, slug, ...rest } = row;
    await createProject({ ...rest, title: `${row.title} (copy)`, slug: slugify(`${row.title}-copy`), status: 'draft' });
    qc.invalidateQueries({ queryKey: ['projects'] });
    toast.success('Project duplicated');
  };

  const toggleFeatured = (row) => {
    updateProject(row.id, { featured: !row.featured })
      .then(() => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success(row.featured ? 'Removed from featured' : 'Marked as featured'); })
      .catch((e) => toast.error(e.message));
  };

  const TABS = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'links', label: 'Links & Tech' },
    { key: 'seo',   label: 'SEO & Status' },
  ];

  return (
    <AdminPage
      eyebrow="PROJECTS"
      title={view === 'form' ? (editing === 'new' ? 'Add Project' : 'Edit Project') : 'Projects'}
      subtitle={view === 'form' ? 'Fill in all project details below.' : 'Create, edit, publish, and manage portfolio projects.'}
      actions={
        view === 'list' ? (
          <button className="primary-button" onClick={openNew}><Plus size={15} /> New project</button>
        ) : (
          <button className="secondary-button" onClick={closeForm}><ArrowLeft size={14} /> Back to list</button>
        )
      }
    >
      {/* ── List view ── */}
      {view === 'list' && (
        <article className="panel">
          <div className="panel-heading">
            <div><p>ALL PROJECTS</p><h2>{projects.length} project{projects.length !== 1 ? 's' : ''}</h2></div>
          </div>
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8790a9' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <strong>No projects yet</strong>
              <span>Add your first project.</span>
              <button className="primary-button" onClick={openNew} style={{ marginTop: 8 }}><Plus size={14} /> New project</button>
            </div>
          ) : (
            <AnimatePresence>
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={openEdit}
                  onDelete={setDeleting}
                  onDuplicate={handleDuplicate}
                  onToggleFeatured={toggleFeatured}
                />
              ))}
            </AnimatePresence>
          )}
        </article>
      )}

      {/* ── Form view ── */}
      {view === 'form' && (
        <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid',
                  borderColor: activeTab === t.key ? '#7c5cff' : 'rgba(255,255,255,0.08)',
                  background: activeTab === t.key ? 'rgba(124,92,255,0.12)' : 'transparent',
                  color: activeTab === t.key ? '#c4b8ff' : '#7f89a3',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
            {/* Main tab content */}
            <article className="panel">
              {/* Basic info tab */}
              {activeTab === 'basic' && (
                <div className="content-form" style={{ marginTop: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Project Title" error={errors.title?.message} required>
                      <input {...register('title')} placeholder="Kinetic Finance" onBlur={() => { if (!watch('slug')) setValue('slug', slugify(titleVal)); }} />
                    </FormField>
                    <FormField label="URL Slug" hint="Auto-filled from title">
                      <input {...register('slug')} placeholder="kinetic-finance" />
                    </FormField>
                    <FormField label="Category">
                      <select {...register('category')}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Client / Company">
                      <input {...register('client')} placeholder="Acme Corp" />
                    </FormField>
                  </div>
                  <FormField label="Short Description" hint="Shown in project cards">
                    <textarea {...register('short_description')} rows={2} placeholder="A brief one-liner…" />
                  </FormField>
                  <FormField label="Full Description" hint="Detailed case study text">
                    <textarea {...register('full_description')} rows={6} placeholder="Full project description…" />
                  </FormField>
                  <FormField label="Features" hint="One feature per line">
                    <textarea {...register('features')} rows={4} placeholder="Responsive design&#10;Dark mode&#10;REST API integration" />
                  </FormField>
                </div>
              )}

              {/* Links & tech tab */}
              {activeTab === 'links' && (
                <div className="content-form" style={{ marginTop: 4 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Live URL">
                      <input {...register('live_url')} placeholder="https://…" />
                    </FormField>
                    <FormField label="GitHub URL">
                      <input {...register('github_url')} placeholder="https://github.com/…" />
                    </FormField>
                    <FormField label="Case Study URL">
                      <input {...register('case_study_url')} placeholder="https://…" />
                    </FormField>
                    <FormField label="Completion Date">
                      <input type="date" {...register('completion_date')} />
                    </FormField>
                  </div>
                  <FormField label="Tech Stack" hint="Comma-separated: React, Node.js, Supabase">
                    <textarea {...register('tech_stack')} rows={3} placeholder="React, TypeScript, Supabase, Tailwind CSS" />
                  </FormField>
                  <FormField label="Display Order">
                    <input type="number" min={0} {...register('display_order')} />
                  </FormField>
                </div>
              )}

              {/* SEO tab */}
              {activeTab === 'seo' && (
                <div className="content-form" style={{ marginTop: 4 }}>
                  <FormField label="SEO Title" hint="Defaults to project title if empty">
                    <input {...register('seo_title')} placeholder="Kinetic Finance — Full Stack App" />
                  </FormField>
                  <FormField label="SEO Description" hint="140–160 characters recommended">
                    <textarea {...register('seo_description')} rows={3} placeholder="A modern finance platform built with React and Supabase…" />
                  </FormField>
                  <FormField label="SEO Keywords" hint="Comma-separated">
                    <input {...register('seo_keywords')} placeholder="finance app, react, supabase" />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Status">
                      <select {...register('status')}>
                        {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </FormField>
                    <FormField label="Featured project">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aab3c8', fontSize: 12, cursor: 'pointer' }}>
                        <input type="checkbox" {...register('featured')} style={{ width: 'auto' }} />
                        Show in featured section
                      </label>
                    </FormField>
                  </div>
                </div>
              )}
            </article>

            {/* Thumbnail sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <article className="panel">
                <div className="panel-heading"><div><p>THUMBNAIL</p><h2>Project image</h2></div></div>
                <div className="content-form" style={{ marginTop: 16 }}>
                  <ImageUpload
                    value={thumbnailUrl}
                    onChange={(url) => setValue('thumbnail_url', url, { shouldDirty: true })}
                    bucket="project-images"
                    folder="thumbnails"
                    label="Project thumbnail"
                  />
                  <FormField label="Or paste URL">
                    <input {...register('thumbnail_url')} placeholder="https://…" />
                  </FormField>
                </div>
              </article>

              <article className="panel">
                <div className="panel-heading"><div><p>QUICK STATUS</p><h2>Visibility</h2></div></div>
                <div style={{ padding: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STATUSES.map(s => {
                    const active = watch('status') === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setValue('status', s, { shouldDirty: true })}
                        style={{
                          padding: '10px 14px', borderRadius: 8, border: '1px solid',
                          borderColor: active ? '#7c5cff' : 'rgba(255,255,255,0.08)',
                          background: active ? 'rgba(124,92,255,0.12)' : 'transparent',
                          color: active ? '#c4b8ff' : '#7f89a3',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <StatusBadge status={s} />
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>

          {/* Save bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, position: 'sticky', bottom: 24 }}>
            <button type="button" className="secondary-button" onClick={closeForm}>Cancel</button>
            <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              {editing === 'new' ? 'Create project' : 'Save project'}
            </button>
          </div>
        </form>
      )}

      <ConfirmModal
        open={!!deleting}
        title="Delete project"
        message={`"${deleting?.title}" and all its data will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
