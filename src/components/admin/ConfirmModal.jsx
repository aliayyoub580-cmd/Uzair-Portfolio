import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,22,0.75)', zIndex: 50, backdropFilter: 'blur(4px)' }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              zIndex: 51, width: '90%', maxWidth: 420,
              background: 'rgba(13,18,37,0.98)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '28px 28px 24px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              fontFamily: 'Manrope, sans-serif',
            }}
          >
            <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: danger ? 'rgba(255,100,128,0.12)' : 'rgba(117,89,255,0.12)', display: 'grid', placeItems: 'center', color: danger ? '#ff8ba1' : '#a897ff', flexShrink: 0 }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#f4f5ff' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: 12, color: '#8790a9', lineHeight: 1.6 }}>{message}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="secondary-button" onClick={onCancel}>Cancel</button>
              <button
                onClick={onConfirm}
                style={{ background: danger ? 'rgba(255,100,128,0.15)' : 'linear-gradient(105deg,#7961ec,#4f8dfb)', border: danger ? '1px solid rgba(255,120,147,0.4)' : 'none', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: danger ? '#ff9caf' : '#fff', cursor: 'pointer' }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
