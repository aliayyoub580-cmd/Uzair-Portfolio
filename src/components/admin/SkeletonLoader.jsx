/**
 * Generic skeleton loader. Use `count` to repeat rows.
 * Pass `type` to get pre-shaped skeletons for common layouts.
 */
export function SkeletonLine({ width = '100%', height = 12, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: 5,
      background: 'rgba(255,255,255,0.06)',
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(28,35,62,0.72)', border: '1px solid rgba(255,255,255,0.075)', borderRadius: 12, padding: 18 }}>
      <SkeletonLine width={36} height={36} style={{ borderRadius: 10, marginBottom: 20 }} />
      <SkeletonLine width="60%" height={10} style={{ marginBottom: 12 }} />
      <SkeletonLine width="35%" height={24} style={{ marginBottom: 8 }} />
      <SkeletonLine width="70%" height={8} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr auto', gap: 12, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
      <SkeletonLine width={38} height={38} style={{ borderRadius: 9 }} />
      <div style={{ display: 'grid', gap: 7 }}>
        <SkeletonLine width="55%" height={11} />
        <SkeletonLine width="75%" height={9} />
      </div>
      <SkeletonLine width={60} height={28} style={{ borderRadius: 7 }} />
    </div>
  );
}

export default function SkeletonLoader({ type = 'row', count = 4 }) {
  const Component = type === 'card' ? SkeletonCard : SkeletonRow;
  const wrapper   = type === 'card'
    ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 15 }
    : {};
  return (
    <div style={wrapper}>
      {Array.from({ length: count }, (_, i) => <Component key={i} />)}
    </div>
  );
}
