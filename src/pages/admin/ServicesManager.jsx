import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchServices, createService, updateService, deleteService, logActivity } from '../../services/adminApi';

const CATEGORIES = ['Development', 'Design', 'Mobile', 'Cloud', 'Consulting', 'Other'];
const ICON_OPTIONS = ['Code2','Wrench','Palette','Smartphone','Cloud','Globe','Database','Zap','Shield','Cpu'];

const schema = z.object({
  title:         z.string().min(1, 'Title is required'),
  description:   z.string().optional(),
  icon:          z.string().optional(),
  color:         z.string().optional(),
  category:      z.string().optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  status:        z.enum(['published','hidden','draft']),
});

const EMPTY = { title:'', description:'', icon:'Code2', color:'#7c5cff', category:'Development', display_order:0, status:'published' };

export default function ServicesManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null); // null | 'new' | row
  const [deleting, setDeleting] = useState(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset(row); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (values) =>
      editing === 'new'
        ? createService(values)
        : updateService(editing.id, values),
    onSuccess: (_, values) => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success(editing === 'new' ? 'Service created' : 'Service updated');
      logActivity(editing === 'new' ? 'Created service' : 'Updated service', 'service', values.title);
      close();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteService(deleting.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted');
      logActivity('Deleted service', 'service', deleting.title);
      setDeleting(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleStatus = (row) => {
    const next = row.status === 'published' ? 'hidden' : 'published';
    updateService(row.id, { status: next })
      .then(() => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success(`Service ${next}`); })
      .catch((e) => toast.error(e.message));
  };

  return (
    <AdminPage
      eyebrow="SERVICES"
      title="Services"
      subtitle="Manage the services displayed on your portfolio."
      actions={
        <button className="primary-button" onClick={openNew}>
          <Plus size={15} /> Add service
        </button>
      }
    >
      <div className="manager-layout">
        {/* List */}
        <article className="panel content-list">
          <div className="panel-heading">
            <div><p>ALL SERVICES</p><h2>{services.length} service{services.length !== 1 ? 's' : ''}</h2></div>
          </div>
          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8790a9' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <Wrench size={28} /><strong>No services yet</strong>
              <span>Add your first service to display it on the portfolio.</span>
            </div>
          ) : (
            <div className="manage-items">
              <AnimatePresence>
                {services.map((svc, i) => (
                  <motion.div key={svc.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="manage-item">
                    <span className="item-number">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: svc.color ?? '#7c5cff', flexShrink: 0 }} />
                        {svc.title}
                      </strong>
                      <p style={{ display: 'flex', gap: 8, marginTop: 5 }}>
                        <span style={{ color: '#6a748a' }}>{svc.category}</span>
                        <StatusBadge status={svc.status} />
                      </p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => toggleStatus(svc)} title={svc.status === 'published' ? 'Hide' : 'Publish'}>
                        {svc.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(svc)}><Edit3 size={14} /></button>
                      <button className="danger" onClick={() => setDeleting(svc)}><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </article>

        {/* Editor */}
        <article className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <p>{editing ? 'SERVICE EDITOR' : 'GET STARTED'}</p>
              <h2>{editing === 'new' ? 'Add service' : editing ? `Edit service` : 'Select an item'}</h2>
            </div>
            {editing && <button onClick={close} style={{ background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}><X size={18} /></button>}
          </div>

          {editing ? (
            <form className="content-form" style={{ marginTop: 20 }} onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
              <FormField label="Title" error={errors.title?.message} required>
                <input {...register('title')} placeholder="UI/UX Design" />
              </FormField>
              <FormField label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={4} placeholder="What this service covers…" />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Category" error={errors.category?.message}>
                  <select {...register('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Icon name" hint="lucide-react icon name">
                  <select {...register('icon')}>
                    {ICON_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
                <FormField label="Accent color">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" {...register('color')} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: 2 }} />
                    <input {...register('color')} placeholder="#7c5cff" style={{ flex: 1 }} />
                  </div>
                </FormField>
                <FormField label="Display order" error={errors.display_order?.message}>
                  <input type="number" min={0} {...register('display_order')} />
                </FormField>
              </div>
              <FormField label="Status" error={errors.status?.message}>
                <select {...register('status')}>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                  <option value="draft">Draft</option>
                </select>
              </FormField>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                  {editing === 'new' ? 'Create service' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty">
              <Edit3 size={26} />
              <p>Select a service to edit, or create a new one.</p>
              <button className="text-button" onClick={openNew}><Plus size={13} /> New service</button>
            </div>
          )}
        </article>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Delete service"
        message={`"${deleting?.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
