const STYLES = {
  published: { bg: 'rgba(83,223,166,0.12)', border: 'rgba(83,223,166,0.3)', color: '#5ae0ac' },
  hidden:    { bg: 'rgba(255,165,80,0.12)', border: 'rgba(255,165,80,0.3)',  color: '#ffb347' },
  draft:     { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)',color: '#94a3b8' },
  archived:  { bg: 'rgba(100,100,120,0.12)',border: 'rgba(100,100,120,0.3)', color: '#9090a8' },
  unread:    { bg: 'rgba(124,92,255,0.15)', border: 'rgba(124,92,255,0.35)', color: '#a897ff' },
  read:      { bg: 'rgba(83,223,166,0.1)',  border: 'rgba(83,223,166,0.25)', color: '#5ae0ac' },
  starred:   { bg: 'rgba(255,188,80,0.12)', border: 'rgba(255,188,80,0.3)',  color: '#ffd06d' },
  trash:     { bg: 'rgba(255,100,128,0.1)', border: 'rgba(255,100,128,0.25)',color: '#ff8ba1' },
  featured:  { bg: 'rgba(255,188,80,0.12)', border: 'rgba(255,188,80,0.3)',  color: '#ffd06d' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] ?? STYLES.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 6, fontSize: 10, fontWeight: 700,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      textTransform: 'capitalize', letterSpacing: '0.04em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {status}
    </span>
  );
}
