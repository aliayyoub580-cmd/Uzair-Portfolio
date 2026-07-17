import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, Star, Eye, EyeOff, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import FormField    from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge  from '../../components/admin/StatusBadge';
import ImageUpload  from '../../components/admin/ImageUpload';
import {
  fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, logActivity,
} from '../../services/adminApi';

const schema = z.object({
  client_name:   z.string().min(1, 'Name is required'),
  position:      z.string().optional(),
  company:       z.string().optional(),
  photo_url:     z.string().optional(),
  review:        z.string().min(1, 'Review is required'),
  rating:        z.coerce.number().int().min(1).max(5),
  featured:      z.boolean().optional(),
  status:        z.enum(['published','hidden']),
  display_order: z.coerce.number().int().min(0).optional(),
});

const EMPTY = { client_name:'', position:'', company:'', photo_url:'', review:'', rating:5, featured:false, status:'published', display_order:0 };

// ── Star rating picker ─────────────────────────────────────────
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ background:'transparent', border:0, cursor:'pointer', color: n<=value ? '#ffd06d' : '#3a4260', padding:2 }}>
          <Star size={18} fill={n<=value ? '#ffd06d' : 'transparent'} />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: items = [], isLoading } = useQuery({ queryKey:['testimonials'], queryFn:fetchTestimonials });

  const { register, handleSubmit, reset, setValue, watch, formState:{ errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: EMPTY,
  });

  const photoUrl = watch('photo_url');
  const rating   = watch('rating');

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset(row); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (v) => editing==='new' ? createTestimonial(v) : updateTestimonial(editing.id, v),
    onSuccess: (_, v) => { qc.invalidateQueries({queryKey:['testimonials']}); toast.success(editing==='new'?'Testimonial added':'Testimonial updated'); logActivity('Updated testimonial','testimonial',v.client_name); close(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTestimonial(deleting.id),
    onSuccess: () => { qc.invalidateQueries({queryKey:['testimonials']}); toast.success('Testimonial deleted'); setDeleting(null); },
    onError: (e) => toast.error(e.message),
  });

  const toggleStatus = (row) => {
    const next = row.status==='published'?'hidden':'published';
    updateTestimonial(row.id,{status:next}).then(()=>{ qc.invalidateQueries({queryKey:['testimonials']}); toast.success(`Testimonial ${next}`); }).catch(e=>toast.error(e.message));
  };

  const renderStars = (n) => Array.from({length:5}).map((_,i)=>(
    <Star key={i} size={11} fill={i<n?'#ffd06d':'transparent'} color={i<n?'#ffd06d':'#3a4260'}/>
  ));

  return (
    <AdminPage eyebrow="TESTIMONIALS" title="Testimonials" subtitle="Manage client reviews and social proof." actions={<button className="primary-button" onClick={openNew}><Plus size={15}/> Add testimonial</button>}>
      <div className="manager-layout">
        <article className="panel content-list">
          <div className="panel-heading"><div><p>ALL REVIEWS</p><h2>{items.length} testimonial{items.length!==1?'s':''}</h2></div></div>
          {isLoading ? <div style={{padding:'40px 0',textAlign:'center',color:'#8790a9'}}><Loader2 size={22} style={{animation:'spin 1s linear infinite'}}/></div>
          : items.length===0 ? <div className="empty-state"><MessageSquare size={28}/><strong>No testimonials yet</strong></div>
          : (
            <div className="manage-items">
              <AnimatePresence>
                {items.map((item,i) => (
                  <motion.div key={item.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="manage-item">
                    <span className="item-number">
                      {item.photo_url
                        ? <img src={item.photo_url} alt={item.client_name} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}}/>
                        : <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7b5fed,#2ca5dd)',display:'grid',placeItems:'center',fontSize:11,fontWeight:800,color:'#fff'}}>{item.client_name.slice(0,2).toUpperCase()}</div>
                      }
                    </span>
                    <div>
                      <strong style={{display:'flex',alignItems:'center',gap:6}}>
                        {item.client_name}
                        {item.featured && <Star size={11} fill="#ffd06d" color="#ffd06d"/>}
                      </strong>
                      <p style={{margin:'3px 0 0',fontSize:11,color:'#8490a8'}}>{item.position}{item.company?` · ${item.company}`:''}</p>
                      <div style={{display:'flex',gap:2,marginTop:4}}>{renderStars(item.rating)}</div>
                      <p style={{margin:'4px 0 0',fontSize:10,color:'#5a6580',maxWidth:320,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>"{item.review}"</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={()=>toggleStatus(item)} title={item.status==='published'?'Hide':'Publish'}>
                        {item.status==='published'?<EyeOff size={14}/>:<Eye size={14}/>}
                      </button>
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
            <div><p>{editing?'EDITOR':'GET STARTED'}</p><h2>{editing==='new'?'Add testimonial':editing?'Edit testimonial':'Select an item'}</h2></div>
            {editing && <button onClick={close} style={{background:'transparent',border:0,color:'#5a6580',cursor:'pointer'}}><X size={18}/></button>}
          </div>
          {editing ? (
            <form className="content-form" style={{marginTop:20}} onSubmit={handleSubmit((v)=>saveMutation.mutate(v))} noValidate>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <FormField label="Client Name" error={errors.client_name?.message} required>
                  <input {...register('client_name')} placeholder="Sarah Miller"/>
                </FormField>
                <FormField label="Position">
                  <input {...register('position')} placeholder="Product Manager"/>
                </FormField>
                <FormField label="Company">
                  <input {...register('company')} placeholder="Acme Corp"/>
                </FormField>
                <FormField label="Display Order">
                  <input type="number" min={0} {...register('display_order')}/>
                </FormField>
              </div>
              <FormField label="Review" error={errors.review?.message} required>
                <textarea {...register('review')} rows={4} placeholder="The work was exceptional…"/>
              </FormField>
              <FormField label="Rating" error={errors.rating?.message}>
                <StarPicker value={Number(rating)} onChange={(n)=>setValue('rating',n,{shouldDirty:true})}/>
              </FormField>
              <FormField label="Profile Photo">
                <ImageUpload value={photoUrl} onChange={(url)=>setValue('photo_url',url,{shouldDirty:true})} bucket="website-assets" folder="testimonials"/>
              </FormField>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <FormField label="Status">
                  <select {...register('status')}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </FormField>
                <FormField label="Featured">
                  <label style={{display:'flex',alignItems:'center',gap:8,color:'#aab3c8',fontSize:12,cursor:'pointer',paddingTop:10}}>
                    <input type="checkbox" {...register('featured')} style={{width:'auto'}}/>
                    Show in featured section
                  </label>
                </FormField>
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/> : <Save size={13}/>}
                  {editing==='new'?'Add testimonial':'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty"><Edit3 size={26}/><p>Select or add a testimonial.</p><button className="text-button" onClick={openNew}><Plus size={13}/> New testimonial</button></div>
          )}
        </article>
      </div>
      <ConfirmModal open={!!deleting} title="Delete testimonial" message={`Review from "${deleting?.client_name}" will be permanently removed.`} confirmLabel="Delete" onConfirm={()=>deleteMutation.mutate()} onCancel={()=>setDeleting(null)}/>
    </AdminPage>
  );
}
