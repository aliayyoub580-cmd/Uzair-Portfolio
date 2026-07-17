import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Show max 7 page buttons with ellipsis
  const visible = totalPages <= 7
    ? pages
    : page <= 4
      ? [...pages.slice(0, 5), '…', totalPages]
      : page >= totalPages - 3
        ? [1, '…', ...pages.slice(totalPages - 5)]
        : [1, '…', page - 1, page, page + 1, '…', totalPages];

  const btn = (content, active = false, disabled = false, onClick) => (
    <button
      key={String(content)}
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 32, height: 32, borderRadius: 7,
        border: '1px solid',
        borderColor: active ? '#7c5cff' : 'rgba(255,255,255,0.08)',
        background: active ? 'rgba(124,92,255,0.2)' : 'transparent',
        color: active ? '#c4b8ff' : disabled ? '#3a4260' : '#7f89a3',
        fontSize: 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Mono, monospace',
      }}
    >
      {content}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
      {btn(<ChevronLeft size={14} />, false, page === 1, () => onPageChange(page - 1))}
      {visible.map((p) =>
        p === '…'
          ? <span key={`ellipsis-${Math.random()}`} style={{ color: '#3a4260', fontSize: 11, padding: '0 4px' }}>…</span>
          : btn(p, p === page, false, () => onPageChange(p))
      )}
      {btn(<ChevronRight size={14} />, false, page === totalPages, () => onPageChange(page + 1))}
    </div>
  );
}
