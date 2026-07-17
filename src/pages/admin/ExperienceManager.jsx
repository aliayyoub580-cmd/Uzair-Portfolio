import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import FormField    from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload  from '../../components/admin/ImageUpload';
import {
  fetchExperience, createExperience, updateExperience, deleteExperience, logActivity,
} from '../../services/adminApi';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

const schema = z.object({
  company:         z.string().min(1, 'Company is required'),
  position:        z.string().min(1, 'Position is required'),
  start_date:      z.string().optional(),
  end_date:        z.string().optional(),
  is_current:      z.boolean().optional(),
  description:     z.string().optional(),
  logo_url:        z.string().optional(),
  location:        z.string().optional(),
  employment_type: z.string().optional(),
  display_order:   z.coerce.number().int().min(0).optional(),
});

const EMPTY = {
  company: '', position: '', start_date: '', end_date: '', is_current: false,
  description: '', logo_url: '', location: '', employment_type: 'Full-time', display_order: 0,
};

export default function ExperienceManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: fetchExperience,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const logoUrl   = watch('logo_url');
  const isCurrent = watch('is_current');

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset({ ...row, start_date: row.start_date?.slice(0,10) ?? '', end_date: row.end_date?.slice(0,10) ?? '' }); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (v) => editing === 'new' ? createExperience(v) : updateExperience(editing.id, v),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['experience'] });
      toast.success(editing === 'new' ? 'Experience added' : 'Experience updated');
      logActivity(editing === 'new' ? 'Created experience' : 'Updated experience', 'experience', v.company);
      close();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExperience(deleting.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['experience'] });
      toast.success('Experience deleted');
      setDeleting(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

  return (
    <AdminPage
      eyebrow="EXPERIENCE"
      title="Experience"
      subtitle="Manage your work history displayed on the portfolio."
      actions={<button className="primary-button" onClick={openNew}><Plus size={15} /> Add experience</button>}
    >
      <div className="manager-layout">
        {/* List */}
        <article className="panel content-list">
          <div className="panel-heading">
            <div><p>WORK HISTORY</p><h2>{items.length} position{items.length !== 1 ? 's' : ''}</h2></div>
          </div>
          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8790a9' }}><Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : items.length === 0 ? (
            <div className="empty-state"><Briefcase size={28} /><strong>No experience yet</strong><span>Add your work history.</span></div>
          ) : (
            <div className="manage-items">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="manage-item">
                    <span className="item-number">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{item.position}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#8490a8' }}>
                        {item.company}
                        {item.location ? ` · ${item.location}` : ''}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: '#5a6580', fontFamily: 'DM Mono, monospace' }}>
                        {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
                        {item.employment_type ? ` · ${item.employment_type}` : ''}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => openEdit(item)}><Edit3 size={14} /></button>
                      <button className="danger" onClick={() => setDeleting(item)}><Trash2 size={14} /></button>
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
            <div><p>{editing ? 'EDITOR' : 'GET STARTED'}</p><h2>{editing === 'new' ? 'Add experience' : editing ? 'Edit experience' : 'Select an item'}</h2></div>
            {editing && <button onClick={close} style={{ background:'transparent',border:0,color:'#5a6580',cursor:'pointer' }}><X size={18}/></button>}
          </div>
          {editing ? (
            <form className="content-form" style={{ marginTop: 20 }} onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormField label="Company" error={errors.company?.message} required>
                  <input {...register('company')} placeholder="Acme Corp" />
                </FormField>
                <FormField label="Position" error={errors.position?.message} required>
                  <input {...register('position')} placeholder="Senior Developer" />
                </FormField>
                <FormField label="Start Date">
                  <input type="date" {...register('start_date')} />
                </FormField>
                <FormField label="End Date">
                  <input type="date" {...register('end_date')} disabled={isCurrent} />
                </FormField>
                <FormField label="Location">
                  <input {...register('location')} placeholder="Lahore, Pakistan" />
                </FormField>
                <FormField label="Employment Type">
                  <select {...register('employment_type')}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </FormField>
              </div>
              <FormField label="Currently working here">
                <label style={{ display:'flex', alignItems:'center', gap:8, color:'#aab3c8', fontSize:12, cursor:'pointer' }}>
                  <input type="checkbox" {...register('is_current')} style={{ width:'auto' }} />
                  I currently work here
                </label>
              </FormField>
              <FormField label="Description">
                <textarea {...register('description')} rows={4} placeholder="Key responsibilities and achievements…" />
              </FormField>
              <FormField label="Company Logo">
                <ImageUpload value={logoUrl} onChange={(url) => setValue('logo_url', url, { shouldDirty:true })} bucket="website-assets" folder="logos" />
              </FormField>
              <FormField label="Display Order">
                <input type="number" min={0} {...register('display_order')} />
              </FormField>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={13} />}
                  {editing === 'new' ? 'Add experience' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty"><Edit3 size={26}/><p>Select an entry to edit, or add new.</p><button className="text-button" onClick={openNew}><Plus size={13}/> New entry</button></div>
          )}
        </article>
      </div>

      <ConfirmModal open={!!deleting} title="Delete experience" message={`"${deleting?.position} at ${deleting?.company}" will be permanently removed.`} confirmLabel="Delete" onConfirm={() => deleteMutation.mutate()} onCancel={() => setDeleting(null)} />
    </AdminPage>
  );
}
