/**
 * Drag-and-drop image uploader backed by Supabase Storage.
 * Shows current image preview + replace button.
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../../services/adminApi';
import toast from 'react-hot-toast';

export default function ImageUpload({
  value,          // current public URL
  onChange,       // (url: string) => void
  bucket = 'website-assets',
  folder = 'general',
  label = 'Image',
  accept = { 'image/*': [] },
  maxSizeMB = 5,
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File must be under ${maxSizeMB} MB`);
      return;
    }
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}.${ext}`;
      const url  = await uploadFile(bucket, path, file);
      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [bucket, folder, maxSizeMB, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {/* Current preview */}
      {value && (
        <div style={{ position: 'relative', display: 'inline-block', width: 120 }}>
          <img
            src={value}
            alt={label}
            style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: -6, right: -6,
              width: 20, height: 20, borderRadius: '50%',
              background: '#ff6480', border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center', color: '#fff',
            }}
            aria-label="Remove image"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#8879ef' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: isDragActive ? 'rgba(136,121,239,0.08)' : 'transparent',
          transition: 'border-color 0.2s, background 0.2s',
          color: '#5a6580',
          fontSize: 12,
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Uploading…
          </div>
        ) : isDragActive ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#a897ff' }}>
            <Upload size={16} /> Drop to upload
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ImageIcon size={15} /> {value ? 'Replace image' : 'Drop or click to upload'}
          </div>
        )}
      </div>
    </div>
  );
}
