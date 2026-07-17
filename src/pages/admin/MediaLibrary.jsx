import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Copy, Search, Folder, Image as ImageIcon,
  Loader2, X, Check, FolderOpen, RefreshCw, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { fetchMedia, saveMedia, deleteMedia, updateMedia, uploadFile, deleteStorageFile } from '../../services/adminApi';

const FOLDERS = [
  { key: null,             label: 'All Files',      Icon: FolderOpen },
  { key: 'profile',        label: 'Profile Images', Icon: Folder },
  { key: 'project-images', label: 'Projects',       Icon: Folder },
  { key: 'certificates',   label: 'Certificates',   Icon: Folder },
  { key: 'logos',          label: 'Logos',          Icon: Folder },
  { key: 'general',        label: 'General',        Icon: Folder },
];

const BUCKET = 'website-assets';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const qc = useQueryClient();
  const [folder, setFolder]     = useState(null);
  const [search, setSearch]     = useState('');
  const [preview, setPreview]   = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['media', folder],
    queryFn:  () => fetchMedia(folder),
  });

  const filtered = items.filter(m =>
    !search || m.filename.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Extract storage path from URL
      const url = deleting.url;
      const path = url.split('/storage/v1/object/public/')[1]?.split('/').slice(1).join('/');
      if (path) await deleteStorageFile(BUCKET, path).catch(() => {});
      await deleteMedia(deleting.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] });
      toast.success('File deleted');
      if (preview?.id === deleting.id) setPreview(null);
      setDeleting(null);
    },
    onError: e => toast.error(e.message),
  });

  const renameMutation = useMutation({
    mutationFn: () => updateMedia(renaming.id, { filename: renameVal.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] });
      toast.success('File renamed');
      setRenaming(null);
    },
    onError: e => toast.error(e.message),
  });

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of accepted) {
      try {
        const ext  = file.name.split('.').pop();
        const dest = folder ?? 'general';
        const path = `${dest}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const url  = await uploadFile(BUCKET, path, file);
        await saveMedia({
          filename:      file.name,
          original_name: file.name,
          url,
          folder:        dest,
          mime_type:     file.type,
          size_bytes:    file.size,
        });
        uploaded++;
      } catch (e) {
        toast.error(`Failed: ${file.name}`);
      }
    }
    setUploading(false);
    if (uploaded) {
      qc.invalidateQueries({ queryKey: ['media'] });
      toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`);
    }
  }, [folder, qc]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, disabled: uploading,
  });

  return (
    <AdminPage
      eyebrow="MEDIA LIBRARY"
      title="Media Library"
      subtitle="Upload and manage all portfolio assets stored in Supabase Storage."
      actions={
        <button className="secondary-button" onClick={() => refetch()}>
          <RefreshCw size={13} /> Refresh
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18 }}>
        {/* Folder sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FOLDERS.map(({ key, label, Icon }) => (
            <button
              key={String(key)}
              onClick={() => { setFolder(key); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', borderRadius: 8, border: '1px solid',
                borderColor: folder === key ? '#7c5cff' : 'rgba(255,255,255,0.06)',
                background: folder === key ? 'rgba(124,92,255,0.12)' : 'transparent',
                color: folder === key ? '#c4b8ff' : '#7f89a3',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#8879ef' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, padding: '24px 20px', textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: isDragActive ? 'rgba(136,121,239,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'border-color 0.2s',
            }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9d8eff' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Uploading files…
              </div>
            ) : (
              <div style={{ color: '#5a6580', fontSize: 12 }}>
                <Upload size={20} style={{ margin: '0 auto 8px', display: 'block', color: '#7c5cff' }} />
                {isDragActive ? 'Drop files here' : 'Drag & drop images here, or click to browse'}
                <p style={{ margin: '4px 0 0', fontSize: 10, color: '#3a4260' }}>
                  Uploads to: <code style={{ color: '#9d8eff' }}>{folder ?? 'general'}</code> folder
                </p>
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 14px' }}>
            <Search size={14} style={{ color: '#5a6580', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files…"
              style={{ background: 'transparent', border: 0, color: '#eef0fc', font: '12px Manrope,sans-serif', outline: 'none', flex: 1 }}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}><X size={13} /></button>}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#8790a9' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#5a6580', fontSize: 12 }}>
              <ImageIcon size={28} style={{ display: 'block', margin: '0 auto 12px', color: '#3a4260' }} />
              No files {search ? 'matching your search' : 'in this folder'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              <AnimatePresence>
                {filtered.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, overflow: 'hidden', position: 'relative', cursor: 'pointer',
                    }}
                    onClick={() => setPreview(item)}
                  >
                    {/* Thumbnail */}
                    <div style={{ height: 100, background: '#0d1025', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.mime_type?.startsWith('image/') ? (
                        <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      ) : (
                        <ImageIcon size={28} style={{ color: '#3a4260' }} />
                      )}
                    </div>
                    {/* Meta */}
                    <div style={{ padding: '8px 10px' }}>
                      {renaming?.id === item.id ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4 }}>
                          <input
                            autoFocus
                            value={renameVal}
                            onChange={e => setRenameVal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') renameMutation.mutate(); if (e.key === 'Escape') setRenaming(null); }}
                            style={{ flex: 1, fontSize: 10, background: '#090e1f', border: '1px solid #8879ef', borderRadius: 4, color: '#eef0fc', padding: '3px 6px', outline: 'none' }}
                          />
                          <button onClick={() => renameMutation.mutate()} style={{ background: '#7c5cff', border: 0, borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '3px 6px' }}><Check size={10} /></button>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: 10, color: '#9da7be', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.filename}>
                          {item.filename}
                        </p>
                      )}
                      <p style={{ margin: '2px 0 0', fontSize: 9, color: '#5a6580', fontFamily: 'DM Mono, monospace' }}>
                        {formatBytes(item.size_bytes)}
                      </p>
                    </div>
                    {/* Hover actions */}
                    <div
                      className="media-hover-actions"
                      onClick={e => e.stopPropagation()}
                      style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}
                    >
                      <button onClick={() => copyUrl(item.url)} title="Copy URL" style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(13,18,37,0.85)', border: 0, color: '#c4b8ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <Copy size={11} />
                      </button>
                      <button onClick={() => { setRenaming(item); setRenameVal(item.filename); }} title="Rename" style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(13,18,37,0.85)', border: 0, color: '#c4b8ff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <FolderOpen size={11} />
                      </button>
                      <button onClick={() => setDeleting(item)} title="Delete" style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,100,128,0.2)', border: 0, color: '#ff8ba1', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,22,0.88)', zIndex: 50, backdropFilter: 'blur(6px)' }}
              onClick={() => setPreview(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 51, maxWidth: '90vw', maxHeight: '90vh', background: 'rgba(13,18,37,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
            >
              <div style={{ position: 'relative' }}>
                <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(13,18,37,0.8)', border: 0, color: '#fff', cursor: 'pointer', borderRadius: 8, width: 30, height: 30, display: 'grid', placeItems: 'center', zIndex: 1 }}>
                  <X size={16} />
                </button>
                {preview.mime_type?.startsWith('image/') && (
                  <img src={preview.url} alt={preview.filename} style={{ maxWidth: '80vw', maxHeight: '70vh', display: 'block', objectFit: 'contain' }} />
                )}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#f4f5ff' }}>{preview.filename}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#5a6580', fontFamily: 'DM Mono, monospace' }}>
                    {preview.folder} · {formatBytes(preview.size_bytes)}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="secondary-button" onClick={() => copyUrl(preview.url)}>
                      <Copy size={13} /> Copy URL
                    </button>
                    <button className="danger-button" onClick={() => { setDeleting(preview); setPreview(null); }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleting}
        title="Delete file"
        message={`"${deleting?.filename}" will be permanently removed from storage.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
