import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, Code2, FolderKanban, Mail, ArrowUpRight, MoreHorizontal,
  Home, UserRound, Inbox, Plus, Activity, RefreshCw,
  CheckCircle2, AlertCircle, Server, Wifi,
} from 'lucide-react';
import { fetchDashboardStats, fetchRecentMessages } from '../../services/adminApi';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

// ── Metric card ────────────────────────────────────────────────
function MetricCard({ label, value, Icon, tint, delay, sub }) {
  return (
    <motion.article
      className="metric-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className={`metric-icon ${tint}`}><Icon size={19} /></div>
      <div className="metric-top"><span>{label}</span><MoreHorizontal size={16} /></div>
      <strong>{value ?? '—'}</strong>
      <p>{sub}</p>
    </motion.article>
  );
}

// ── Skeleton loader for metric cards ──────────────────────────
function MetricSkeleton() {
  return (
    <div className="metric-card" style={{ opacity: 0.45 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ffffff10', marginBottom: 21 }} />
      <div style={{ height: 10, width: '60%', background: '#ffffff0d', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 24, width: '40%', background: '#ffffff0d', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 8,  width: '70%', background: '#ffffff08', borderRadius: 4 }} />
    </div>
  );
}

// ── Activity icon map ──────────────────────────────────────────
const ACTION_ICON = {
  login:   { cls: 'mail',     Icon: CheckCircle2 },
  create:  { cls: 'project',  Icon: Plus },
  update:  { cls: 'download', Icon: RefreshCw },
  delete:  { cls: 'star',     Icon: AlertCircle },
  default: { cls: 'mail',     Icon: Activity },
};

function activityMeta(action = '') {
  const key = Object.keys(ACTION_ICON).find(k => action.toLowerCase().includes(k)) ?? 'default';
  return ACTION_ICON[key];
}

// ── Status indicator ───────────────────────────────────────────
function StatusDot({ ok, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9da7be' }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: ok ? '#5ae0ac' : '#ff8ba1',
        boxShadow: ok ? '0 0 6px #5ae0ac' : '0 0 6px #ff8ba1',
        flexShrink: 0,
      }} />
      {label}
    </div>
  );
}

// ── Mini chart (sparkline SVG) ─────────────────────────────────
function SparkChart() {
  return (
    <div className="chart-area">
      <div className="chart-y">
        <span>2k</span><span>1.5k</span><span>1k</span><span>500</span><span>0</span>
      </div>
      <svg viewBox="0 0 780 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#7c5cff" stopOpacity=".35" />
            <stop offset="1" stopColor="#7c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="area" d="M0 190 C35 175 50 180 75 152 S120 145 145 163 S190 123 215 139 S258 130 282 104 S329 130 355 111 S400 73 427 91 S469 105 492 68 S535 71 561 86 S605 34 630 54 S677 84 704 38 S748 34 780 18 L780 220 L0 220 Z" />
        <path className="line" d="M0 190 C35 175 50 180 75 152 S120 145 145 163 S190 123 215 139 S258 130 282 104 S329 130 355 111 S400 73 427 91 S469 105 492 68 S535 71 561 86 S605 34 630 54 S677 84 704 38 S748 34 780 18" />
      </svg>
      <div className="chart-x">
        {['Jun 18','Jun 24','Jun 30','Jul 06','Jul 12','Jul 17'].map(d => <span key={d}>{d}</span>)}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const { data: recentMsgs, isLoading: msgsLoading } = useQuery({
    queryKey: ['recent-messages'],
    queryFn: () => fetchRecentMessages(5),
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ')[0]
    : 'Admin';

  return (
    <div className="dashboard-content">
      {/* ── Welcome row ── */}
      <section className="welcome-row">
        <div>
          <p className="eyebrow"><span /> LIVE PORTFOLIO</p>
          <h1>{greeting}, {displayName} <span>✦</span></h1>
          <p className="subtitle">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="date-actions">
          <button
            className="secondary-button"
            onClick={() => refetch()}
            style={{ fontSize: 11 }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="primary-button" onClick={() => navigate('/admin/projects')}>
            <Plus size={16} /> New project
          </button>
        </div>
      </section>

      {/* ── Metric cards ── */}
      <section className="metrics-grid">
        {statsLoading ? (
          [0,1,2,3].map(i => <MetricSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Services"         value={stats?.services} Icon={Wrench}      tint="blue"   delay={0}    sub="Published on portfolio" />
            <MetricCard label="Skills"            value={stats?.skills}   Icon={Code2}       tint="purple" delay={0.05} sub="Active skill entries" />
            <MetricCard label="Projects"          value={stats?.projects} Icon={FolderKanban} tint="cyan"  delay={0.1}  sub="Total in database" />
            <MetricCard label="Unread messages"   value={stats?.unread}   Icon={Mail}        tint="pink"   delay={0.15} sub={`${stats?.messages ?? 0} total messages`} />
          </>
        )}
      </section>

      {/* ── Analytics + Quick actions ── */}
      <section className="analytics-grid">
        {/* Analytics chart */}
        <article className="panel traffic-panel">
          <div className="panel-heading">
            <div>
              <p>ANALYTICS</p>
              <h2>Portfolio visitors</h2>
            </div>
            <button className="range-button">Last 30 days <ArrowUpRight size={12} /></button>
          </div>
          <div className="audience-stats">
            <div><span>Total visitors</span><strong>48,294</strong><em><ArrowUpRight size={12} /> 18.2%</em></div>
            <div><span>Unread messages</span><strong>{stats?.unread ?? 0}</strong><em style={{ color: stats?.unread > 0 ? '#fa92c8' : '#5fe4ae' }}>{stats?.unread > 0 ? '● New' : '✓ All read'}</em></div>
          </div>
          <SparkChart />
        </article>

        {/* Quick actions */}
        <article className="panel performance-panel">
          <div className="panel-heading">
            <div><p>QUICK ACTIONS</p><h2>Manage content</h2></div>
          </div>
          <div className="quick-grid">
            {[
              { label: 'Edit home',     Icon: Home,          path: '/admin/home' },
              { label: 'Edit about',    Icon: UserRound,      path: '/admin/about' },
              { label: 'View inbox',    Icon: Inbox,          path: '/admin/messages' },
              { label: 'Add project',   Icon: Plus,           path: '/admin/projects' },
              { label: 'Add service',   Icon: Wrench,         path: '/admin/services' },
              { label: 'Add skill',     Icon: Code2,          path: '/admin/skills' },
            ].map(({ label, Icon, path }) => (
              <button key={label} onClick={() => navigate(path)}>
                <Icon size={17} /><span>{label}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      {/* ── Recent messages + System status ── */}
      <section className="bottom-grid">
        {/* Recent messages */}
        <article className="panel">
          <div className="panel-heading">
            <div><p>INBOX</p><h2>Recent messages</h2></div>
            <button className="text-button" onClick={() => navigate('/admin/messages')}>
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="activity-list">
            {msgsLoading ? (
              [0,1,2,3,4].map(i => (
                <div key={i} className="activity" style={{ opacity: 0.4 }}>
                  <div className="activity-icon mail" style={{ background: '#ffffff08' }} />
                  <div>
                    <div style={{ height: 10, width: '55%', background: '#ffffff0d', borderRadius: 4, marginBottom: 7 }} />
                    <div style={{ height: 8,  width: '75%', background: '#ffffff08', borderRadius: 4 }} />
                  </div>
                  <div style={{ height: 8, width: 40, background: '#ffffff08', borderRadius: 4 }} />
                </div>
              ))
            ) : recentMsgs?.length > 0 ? (
              recentMsgs.map((m) => {
                const isUnread = m.status === 'unread';
                return (
                  <div
                    key={m.id}
                    className="activity"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/admin/messages')}
                  >
                    <div className="activity-icon mail">
                      <Mail size={14} />
                    </div>
                    <div>
                      <strong style={{ color: isUnread ? '#f4f5ff' : undefined }}>
                        {m.name}
                        {isUnread && <span style={{ marginLeft: 6, fontSize: 9, background: '#7c5cff', color: '#fff', padding: '1px 5px', borderRadius: 4 }}>NEW</span>}
                      </strong>
                      <p>{m.subject || m.email}</p>
                    </div>
                    <time>{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</time>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#68738f', fontSize: 12 }}>
                No messages yet
              </div>
            )}
          </div>
        </article>

        {/* System status + Activity log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* System status */}
          <article className="panel">
            <div className="panel-heading">
              <div><p>SYSTEM</p><h2>Status</h2></div>
              <Server size={16} style={{ color: '#5a6580' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
              <StatusDot ok label="Supabase Database · Connected" />
              <StatusDot ok label="Supabase Auth · Active" />
              <StatusDot ok label="Supabase Storage · Ready" />
              <StatusDot ok={!!import.meta.env.VITE_SUPABASE_URL} label={`API · ${import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing .env keys'}`} />
            </div>
            <div className="storage" style={{ marginTop: 18 }}>
              <div>
                <span>Content rows</span>
                <strong>
                  {statsLoading ? '…' : (stats?.services + stats?.skills + stats?.projects)} entries
                  <small style={{ marginLeft: 6 }}>across tables</small>
                </strong>
              </div>
              <div className="storage-track">
                <i style={{ width: `${Math.min(((stats?.projects ?? 0) / 50) * 100, 100)}%` }} />
              </div>
            </div>
          </article>

          {/* Activity log */}
          <article className="panel">
            <div className="panel-heading">
              <div><p>RECENT ACTIVITY</p><h2>Audit log</h2></div>
              <Activity size={16} style={{ color: '#5a6580' }} />
            </div>
            <div className="activity-list">
              {statsLoading ? (
                [0,1,2].map(i => (
                  <div key={i} className="activity" style={{ opacity: 0.4 }}>
                    <div className="activity-icon" style={{ background: '#ffffff08', borderRadius: 8, width: 29, height: 29 }} />
                    <div>
                      <div style={{ height: 9, width: '60%', background: '#ffffff0d', borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ height: 7, width: '80%', background: '#ffffff08', borderRadius: 4 }} />
                    </div>
                    <div style={{ height: 7, width: 36, background: '#ffffff08', borderRadius: 4 }} />
                  </div>
                ))
              ) : stats?.activity?.length > 0 ? (
                stats.activity.map((log) => {
                  const { cls, Icon } = activityMeta(log.action);
                  return (
                    <div key={log.id} className="activity">
                      <div className={`activity-icon ${cls}`}><Icon size={13} /></div>
                      <div>
                        <strong>{log.action}</strong>
                        <p>{log.entity_type ?? 'System'}{log.entity_id ? ` · ${log.entity_id}` : ''}</p>
                      </div>
                      <time>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</time>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#68738f', fontSize: 12 }}>
                  No activity yet
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
