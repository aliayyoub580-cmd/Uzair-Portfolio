import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X, Loader2, Award, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import FormField    from '../../components/admin/FormField';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUpload  from '../../components/admin/ImageUpload';
import {
  fetchCertificates, createCertificate, updateCertificate, deleteCertificate, logActivity,
} from '../../services/adminApi';

const schema = z.object({
  title:          z.string().min(1, 'Title is required'),
  organization:   z.string().min(1, 'Organization is required'),
  issue_date:     z.string().optional(),
  expiry_date:    z.string().optional(),
  credential_url: z.string().optional(),
  image_url:      z.string().optional(),
  display_order:  z.coerce.number().int().min(0).optional(),
});

const EMPTY = { title:'', organization:'', issue_date:'', expiry_date:'', credential_url:'', image_url:'', display_order:0 };

export default function CertificatesManager() {
  const qc = useQueryClient();
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: items = [], isLoading } = useQuery({ queryKey:['certificates'], queryFn:fetchCertificates });

  const { register, handleSubmit, reset, setValue, watch, formState:{ errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: EMPTY,
  });

  const imageUrl = watch('image_url');
  const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US',{ month:'short', year:'numeric' }) : '—';

  const openNew  = () => { reset(EMPTY); setEditing('new'); };
  const openEdit = (row) => { reset({ ...row, issue_date:row.issue_date?.slice(0,10)??'', expiry_date:row.expiry_date?.slice(0,10)??'' }); setEditing(row); };
  const close    = () => setEditing(null);

  const saveMutation = useMutation({
    mutationFn: (v) => editing==='new' ? createCertificate(v) : updateCertificate(editing.id, v),
    onSuccess: (_, v) => { qc.invalidateQueries({queryKey:['certificates']}); toast.success(editing==='new'?'Certificate added':'Certificate updated'); logActivity('Updated certificate','certificate',v.title); close(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCertificate(deleting.id),
    onSuccess: () => { qc.invalidateQueries({queryKey:['certificates']}); toast.success('Certificate deleted'); setDeleting(null); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AdminPage eyebrow="CERTIFICATES" title="Certificates" subtitle="Manage your certifications and credentials." actions={<button className="primary-button" onClick={openNew}><Plus size={15}/> Add certificate</button>}>
      <div className="manager-layout">
        <article className="panel content-list">
          <div className="panel-heading"><div><p>ALL CERTIFICATES</p><h2>{items.length} certificate{items.length!==1?'s':''}</h2></div></div>
          {isLoading ? <div style={{padding:'40px 0',textAlign:'center',color:'#8790a9'}}><Loader2 size={22} style={{animation:'spin 1s linear infinite'}}/></div>
          : items.length===0 ? <div className="empty-state"><Award size={28}/><strong>No certificates yet</strong></div>
          : (
            <div className="manage-items">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="manage-item">
                    <span className="item-number">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.title} style={{width:32,height:32,borderRadius:6,objectFit:'cover'}}/>
                        : String(i+1).padStart(2,'0')
                      }
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p style={{margin:'4px 0 0',fontSize:11,color:'#8490a8'}}>{item.organization}</p>
                      <p style={{margin:'2px 0 0',fontSize:10,color:'#5a6580',fontFamily:'DM Mono,monospace'}}>
                        Issued: {fmtDate(item.issue_date)}
                        {item.expiry_date ? ` · Expires: ${fmtDate(item.expiry_date)}` : ' · No expiry'}
                      </p>
                    </div>
                    <div className="item-actions">
                      {item.credential_url && (
                        <a href={item.credential_url} target="_blank" rel="noopener noreferrer" style={{width:31,height:31,borderRadius:7,border:'1px solid rgba(255,255,255,0.075)',background:'rgba(255,255,255,0.04)',color:'#aab3c8',display:'grid',placeItems:'center',textDecoration:'none'}}>
                          <ExternalLink size={13}/>
                        </a>
                      )}
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
            <div><p>{editing?'EDITOR':'GET STARTED'}</p><h2>{editing==='new'?'Add certificate':editing?'Edit certificate':'Select an item'}</h2></div>
            {editing && <button onClick={close} style={{background:'transparent',border:0,color:'#5a6580',cursor:'pointer'}}><X size={18}/></button>}
          </div>
          {editing ? (
            <form className="content-form" style={{marginTop:20}} onSubmit={handleSubmit((v)=>saveMutation.mutate(v))} noValidate>
              <FormField label="Certificate Title" error={errors.title?.message} required>
                <input {...register('title')} placeholder="AWS Certified Developer"/>
              </FormField>
              <FormField label="Issuing Organization" error={errors.organization?.message} required>
                <input {...register('organization')} placeholder="Amazon Web Services"/>
              </FormField>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <FormField label="Issue Date"><input type="date" {...register('issue_date')}/></FormField>
                <FormField label="Expiry Date" hint="Leave blank if no expiry"><input type="date" {...register('expiry_date')}/></FormField>
                <FormField label="Display Order"><input type="number" min={0} {...register('display_order')}/></FormField>
              </div>
              <FormField label="Credential URL" hint="Link to verify the certificate">
                <input {...register('credential_url')} placeholder="https://…"/>
              </FormField>
              <FormField label="Certificate Image">
                <ImageUpload value={imageUrl} onChange={(url)=>setValue('image_url',url,{shouldDirty:true})} bucket="certificates" folder="images"/>
              </FormField>
              <FormField label="Or paste image URL">
                <input {...register('image_url')} placeholder="https://…"/>
              </FormField>
              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={close}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/> : <Save size={13}/>}
                  {editing==='new'?'Add certificate':'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="editor-empty"><Edit3 size={26}/><p>Select or add a certificate.</p><button className="text-button" onClick={openNew}><Plus size={13}/> New certificate</button></div>
          )}
        </article>
      </div>
      <ConfirmModal open={!!deleting} title="Delete certificate" message={`"${deleting?.title}" will be permanently removed.`} confirmLabel="Delete" onConfirm={()=>deleteMutation.mutate()} onCancel={()=>setDeleting(null)}/>
    </AdminPage>
  );
}
