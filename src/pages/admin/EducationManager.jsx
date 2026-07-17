import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import FormField    from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import {
  fetchEducation, createEducation, updateEducation, deleteEducation, logActivity,
} from '../../services/adminApi';

const schema = z.object({
  institute:      z.string().min(1, 'Institute is required'),
  degree:         z.string().min(1, 'Degree is required'),
  field_of_study: z.string().optional(),
  start_date:     z.string().optional(),
  end_date:       z.string().optional(),
  is_current:     z.boolean().optional(),
  description:    z.string().optional(),
  grade:          z.string().optional(),
  certificate_url:z.string().optional(),
  display_order:  z.coerce.number().int().min(0).optional(),
});

const EMPTY = {
  institute:'', degree:'', field_of_study:'', start_date:'', end_date:'',
  is_current:false, description:'', grade:'', certificate_url:'', display_order:0,
};

export default function EducationManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: items = [], isLoading } = useQuery({ queryKey: ['education'], queryFn: fetchEducation });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: EMPTY,
  });

  const isCurrent = watch('is_current');

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset({ ...row, start_date: row.start_date?.slice(0,10)??'', end_date: row.end_date?.slice(0,10)??'' }); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (v) => editing === 'new' ? createEducation(v) : updateEducation(editing.id, v),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey:['education'] }); toast.success(editing==='new'?'Education added':'Education updated'); logActivity('Updated education','education',v.institute); close(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEducation(deleting.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['education'] }); toast.success('Education deleted'); setDeleting(null); },
    onError: (e) => toast.error(e.message),
  });

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{ month:'short', year:'numeric' }) : '';

  return (
    <AdminPage eyebrow="EDUCATION" title="Education" subtitle="Manage your academic background." actions={<button className="primary-button" onClick={openNew}><Plus size={15}/> Add education</button>}>
      <div className="manager-layout">
        <article className="panel content-list">
          <div className="panel-heading"><div><p>ACADEMIC HISTORY</p><h2>{items.length} entr{items.length!==1?'ies':'y'}</h2></div></div>
          {isLoading ? <div style={{padding:'40px 0',textAlign:'center',color:'#8790a9'}}><Loader2 size={22} style={{animation:'spin 1s linear infinite'}}/></div>
          : items.length===0 ? <div className="empty-state"><GraduationCap size={28}/><strong>No education yet</strong></div>
          : (
            <div className="manage-items">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="manage-item">
                    <span className="item-number">{String(i+1).padStart(2,'0')}</span>
                    <div>
                      <strong>{item.degree}{item.field_of_study ? ` in ${item.field_of_study}` : ''}</strong>
                      <p style={{margin:'4px 0 0',fontSize:11,color:'#8490a8'}}>{item.institute}</p>
                      <p style={{margin:'2px 0 0',fontSize:10,color:'#5a6580',fontFamily:'DM Mono,monospace'}}>
                        {fmtDate(item.start_date)} — {item.is_current?'Present':fmtDate(item.end_date)}
                        {item.grade ? ` · ${item.grade}` : ''}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button onClick={()=>openEdit(item)}><Edit3 size={14}/></button>
                      <button className="danger" onClick={()=>setDeleting(item)}><Trash2 size={14}/></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </article>

        <article className="panel editor-panel">
          <div className="panel-heading">
            <div><p>{editing?'EDITOR':'GET STARTED'}</p><h2>{editing==='new'?'Add education':editing?'Edit education':'Select an item'}</h2></div>
            {editing && <button onClick={close} style={{background:'transparent',border:0,color:'#5a6580',cursor:'pointer'}}><X size={18}/></button>}
          </div>
          {editing ? (
            <form className="content-form" style={{marginTop:20}} onSubmit={handleSubmit((v)=>saveMutation.mutate(v))} noValidate>
              <FormField label="Institute" error={errors.institute?.message} required>
                <input {...register('institute')} placeholder="University of Punjab"/>
              </FormField>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <FormField label="Degree" error={errors.degree?.message} required>
                  <input {...register('degree')} placeholder="Bachelor of Science"/>
                </FormField>
                <FormField label="Field of Study">
                  <input {...register('field_of_study')} placeholder="Computer Science"/>
                </FormField>
                <FormField label="Start Date"><input type="date" {...register('start_date')}/></FormField>
                <FormField label="End Date"><input type="date" {...register('end_date')} disabled={isCurrent}/></FormField>
                <FormField label="Grade / CGPA"><input {...register('grade')} placeholder="3.8 / 4.0"/></FormField>
                <FormField label="Display Order"><input type="number" min={0} {...register('display_order')}/></FormField>
              </div>
              <FormField label="Currently studying here">
                <label style={{display:'flex',alignItems:'center',gap:8,color:'#aab3c8',fontSize:12,cursor:'pointer'}}>
                  <input type="checkbox" {...register('is_current')} style={{width:'auto'}}/>
                  Currently enrolled
                </label>
              </FormField>
              <FormField label="Description">
                <textarea {...register('description')} rows={3} placeholder="Relevant coursework, achievements…"/>
              </FormField>
              <FormField label="Certificate URL" hint="Link to digital certificate">
                <input {...register('certificate_url')} placeholder="https://…"/>
              </FormField>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/> : <Save size={13}/>}
                  {editing==='new'?'Add education':'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty"><Edit3 size={26}/><p>Select or add education entry.</p><button className="text-button" onClick={openNew}><Plus size={13}/> New entry</button></div>
          )}
        </article>
      </div>
      <ConfirmModal open={!!deleting} title="Delete education" message={`"${deleting?.degree} at ${deleting?.institute}" will be removed.`} confirmLabel="Delete" onConfirm={()=>deleteMutation.mutate()} onCancel={()=>setDeleting(null)}/>
    </AdminPage>
  );
}
