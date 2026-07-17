/**
 * Generic sortable data table for admin panels.
 * columns: [{ key, label, render?: (row) => ReactNode, sortable?: bool, width?: string }]
 */
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data yet',
  keyField = 'id',
  onRowClick,
}) {
  const [sortKey, setSortKey]  = useState(null);
  const [sortDir, setSortDir]  = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Manrope, sans-serif' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left', padding: '10px 12px',
                  fontSize: 10, fontWeight: 700, color: '#5a6580',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  width: col.width,
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc'
                      ? <ChevronUp size={11} style={{ color: '#9d8eff' }} />
                      : <ChevronDown size={11} style={{ color: '#9d8eff' }} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px 12px' }}>
                <SkeletonLoader type="row" count={5} />
              </td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '48px 12px', textAlign: 'center', color: '#5a6580', fontSize: 12 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map(row => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 12px', fontSize: 12, color: '#c4cbe0', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
