import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit3, Trash2, Save, X, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage from '../../components/admin/AdminPage';
import FormField from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { fetchSkills, createSkill, updateSkill, deleteSkill, logActivity } from '../../services/adminApi';

const CATEGORIES = ['Frontend','Backend','Database','DevOps','Design','Mobile','Cloud','Tools','Other'];

const schema = z.object({
  name:          z.string().min(1, 'Name is required'),
  category:      z.string().optional(),
  percentage:    z.coerce.number().int().min(0).max(100),
  icon:          z.string().optional(),
  color:         z.string().optional(),
  display_order: z.coerce.number().int().min(0).optional(),
  status:        z.enum(['published','hidden']),
});

const EMPTY = { name:'', category:'Frontend', percentage:80, icon:'', color:'#7c5cff', display_order:0, status:'published' };

// ── Sortable row ───────────────────────────────────────────────
function SortableSkillRow({ skill, index, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

  return (
    <div ref={setNodeRef} style={style} className="manage-item">
      <span className="item-number" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button {...listeners} {...attributes} style={{ background: 'transparent', border: 0, color: '#3a4260', cursor: 'grab', padding: 0, display: 'flex' }} title="Drag to reorder">
          <GripVertical size={14} />
        </button>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div>
        <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: skill.color ?? '#7c5cff', flexShrink: 0 }} />
          {skill.name}
        </strong>
        <p style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
          <span style={{ color: '#6a748a' }}>{skill.category}</span>
          <StatusBadge status={skill.status} />
          <span style={{ fontSize: 10, color: '#9d8eff', fontFamily: 'DM Mono, monospace' }}>{skill.percentage}%</span>
        </p>
        {/* Skill bar */}
        <div style={{ marginTop: 6, height: 3, width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${skill.percentage}%`, background: skill.color ?? '#7c5cff', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>
      <div className="item-actions">
        <button onClick={() => onToggle(skill)} title={skill.status === 'published' ? 'Hide' : 'Publish'}>
          {skill.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button onClick={() => onEdit(skill)}><Edit3 size={14} /></button>
        <button className="danger" onClick={() => onDelete(skill)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default function SkillsManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset(row); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (v) => editing === 'new' ? createSkill(v) : updateSkill(editing.id, v),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      toast.success(editing === 'new' ? 'Skill created' : 'Skill updated');
      logActivity(editing === 'new' ? 'Created skill' : 'Updated skill', 'skill', v.name);
      close();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSkill(deleting.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill deleted');
      setDeleting(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleStatus = (row) => {
    const next = row.status === 'published' ? 'hidden' : 'published';
    updateSkill(row.id, { status: next })
      .then(() => { qc.invalidateQueries({ queryKey: ['skills'] }); toast.success(`Skill ${next}`); })
      .catch((e) => toast.error(e.message));
  };

  // DnD reorder — update display_order in DB
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = skills.findIndex(s => s.id === active.id);
    const newIdx = skills.findIndex(s => s.id === over.id);
    const reordered = arrayMove(skills, oldIdx, newIdx);
    // Optimistic update via queryClient
    qc.setQueryData(['skills'], reordered);
    // Persist new order
    await Promise.all(reordered.map((s, i) => updateSkill(s.id, { display_order: i })));
    toast.success('Order saved');
  };

  return (
    <AdminPage
      eyebrow="SKILLS"
      title="Skills"
      subtitle="Manage skill bars with categories, percentages, and drag-to-reorder."
      actions={
        <button className="primary-button" onClick={openNew}>
          <Plus size={15} /> Add skill
        </button>
      }
    >
      <div className="manager-layout">
        {/* List */}
        <article className="panel content-list">
          <div className="panel-heading">
            <div><p>ALL SKILLS</p><h2>{skills.length} skill{skills.length !== 1 ? 's' : ''}</h2></div>
            <span style={{ fontSize: 10, color: '#5a6580', fontFamily: 'DM Mono, monospace' }}>drag to reorder</span>
          </div>
          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8790a9' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : skills.length === 0 ? (
            <div className="empty-state">
              <strong>No skills yet</strong>
              <span>Add your first skill to show it on the portfolio.</span>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="manage-items">
                  {skills.map((skill, i) => (
                    <SortableSkillRow
                      key={skill.id}
                      skill={skill}
                      index={i}
                      onEdit={openEdit}
                      onDelete={setDeleting}
                      onToggle={toggleStatus}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </article>

        {/* Editor */}
        <article className="panel editor-panel">
          <div className="panel-heading">
            <div>
              <p>{editing ? 'SKILL EDITOR' : 'GET STARTED'}</p>
              <h2>{editing === 'new' ? 'Add skill' : editing ? 'Edit skill' : 'Select an item'}</h2>
            </div>
            {editing && <button onClick={close} style={{ background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}><X size={18} /></button>}
          </div>

          {editing ? (
            <form className="content-form" style={{ marginTop: 20 }} onSubmit={handleSubmit((v) => saveMutation.mutate(v))} noValidate>
              <FormField label="Skill Name" error={errors.name?.message} required>
                <input {...register('name')} placeholder="React.js" />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Category" error={errors.category?.message}>
                  <select {...register('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Proficiency %" error={errors.percentage?.message} required>
                  <input type="number" min={0} max={100} {...register('percentage')} />
                </FormField>
                <FormField label="Accent color">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" {...register('color')} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', padding: 2 }} />
                    <input {...register('color')} placeholder="#7c5cff" style={{ flex: 1 }} />
                  </div>
                </FormField>
                <FormField label="Icon name" hint="lucide-react icon (optional)">
                  <input {...register('icon')} placeholder="Code2" />
                </FormField>
                <FormField label="Display order">
                  <input type="number" min={0} {...register('display_order')} />
                </FormField>
                <FormField label="Status">
                  <select {...register('status')}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </FormField>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                  {editing === 'new' ? 'Create skill' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty">
              <Edit3 size={26} />
              <p>Select a skill to edit, or add a new one.</p>
              <button className="text-button" onClick={openNew}><Plus size={13} /> New skill</button>
            </div>
          )}
        </article>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Delete skill"
        message={`"${deleting?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
