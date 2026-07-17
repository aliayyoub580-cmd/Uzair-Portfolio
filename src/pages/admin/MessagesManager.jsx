import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Inbox, Star, Archive, Trash2, Search, RefreshCw,
  Reply, Download, MoreHorizontal, Check, CheckCheck,
  Eye, EyeOff, Send, X, Loader2, MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

import AdminPage    from '../../components/admin/AdminPage';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge  from '../../components/admin/StatusBadge';
import { fetchMessages, updateMessage, deleteMessage, addReply, logActivity } from '../../services/adminApi';

const TABS = [
  { key: 'all',      label: 'All',      Icon: Mail },
  { key: 'unread',   label: 'Unread',   Icon: Inbox },
  { key: 'starred',  label: 'Starred',  Icon: Star },
  { key: 'archived', label: 'Archived', Icon: Archive },
  { key: 'trash',    label: 'Trash',    Icon: Trash2 },
];

const PAGE_SIZE = 15;

function MessagePreview({ msg, selected, onSelect }) {
  const isUnread = msg.status === 'unread';
  return (
    <button
      onClick={() => onSelect(msg)}
      className={`message-preview${selected ? ' selected' : ''}${isUnread ? ' unread' : ''}`}
    >
      <div>
        <strong>{msg.name}</strong>
        <time>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</time>
      </div>
      <b>{msg.subject || '(No subject)'}</b>
      <span>{msg.message}</span>
    </button>
  );
}

function ReplyBox({ message, onSent }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      await addReply({ message_id: message.id, body: body.trim(), sent_by: 'admin' });
      toast.success('Reply saved');
      setBody('');
      onSent();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.075)', paddingTop: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9da7be', marginBottom: 8 }}>REPLY</p>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={`Reply to ${message.name}…`}
        rows={4}
        style={{
          width: '100%', background: '#090e1f', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, color: '#eef0fc', padding: '11px 12px',
          font: '12px Manrope,sans-serif', outline: 'none', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button
          onClick={send}
          disabled={sending || !body.trim()}
          className="primary-button"
          style={{ opacity: (!body.trim() || sending) ? 0.5 : 1 }}
        >
          {sending ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
          Send reply
        </button>
      </div>
    </div>
  );
}

export default function MessagesManager() {
  const qc = useQueryClient();
  const [tab, setTab]           = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage]         = useState(1);
  const [deleting, setDeleting] = useState(null);

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['messages', tab, search],
    queryFn:  () => fetchMessages({ status: tab === 'all' ? undefined : tab, search }),
    refetchInterval: 30_000,
  });

  // Counts per tab
  const counts = useMemo(() => ({
    all:      messages.length,
    unread:   messages.filter(m => m.status === 'unread').length,
    starred:  messages.filter(m => m.status === 'starred').length,
    archived: messages.filter(m => m.status === 'archived').length,
    trash:    messages.filter(m => m.status === 'trash').length,
  }), [messages]);

  // Pagination
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return messages.slice(start, start + PAGE_SIZE);
  }, [messages, page]);

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);

  const mutate = useMutation({
    mutationFn: ({ id, patch }) => updateMessage(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
    onError: e => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMessage(deleting.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      if (selected?.id === deleting.id) setSelected(null);
      toast.success('Message deleted');
      logActivity('Deleted message', 'message');
      setDeleting(null);
    },
    onError: e => toast.error(e.message),
  });

  const openMessage = (msg) => {
    setSelected(msg);
    if (msg.status === 'unread') {
      mutate.mutate({ id: msg.id, patch: { status: 'read' } });
    }
  };

  const setStatus = (id, status) => {
    mutate.mutate({ id, patch: { status } });
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    toast.success(`Message marked as ${status}`);
  };

  // Export CSV
  const exportCSV = () => {
    const header = ['Name','Email','Phone','Subject','Message','Status','Date'];
    const rows = messages.map(m => [
      m.name, m.email, m.phone ?? '', m.subject ?? '', m.message.replace(/"/g, '""'),
      m.status, format(new Date(m.created_at), 'yyyy-MM-dd HH:mm'),
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'messages.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <AdminPage
      eyebrow="CONTACT INBOX"
      title="Messages"
      subtitle="Manage incoming contact form submissions."
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-button" onClick={() => refetch()}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      }
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); setSelected(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, border: '1px solid',
              borderColor: tab === key ? '#7c5cff' : 'rgba(255,255,255,0.08)',
              background: tab === key ? 'rgba(124,92,255,0.12)' : 'transparent',
              color: tab === key ? '#c4b8ff' : '#7f89a3',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Icon size={13} />
            {label}
            {counts[key] > 0 && (
              <span style={{ background: tab === key ? '#7c5cff' : '#3a4260', borderRadius: 5, padding: '1px 6px', fontSize: 10, color: '#fff' }}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <article className="panel inbox-panel">
        {/* Sidebar list */}
        <div className="inbox-sidebar">
          <div className="inbox-search">
            <Search size={14} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search messages…"
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#8790a9' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : paged.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#5a6580', fontSize: 12 }}>
              <MessageSquare size={24} style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
              No messages
            </div>
          ) : (
            <div className="message-list">
              {paged.map(msg => (
                <MessagePreview key={msg.id} msg={msg} selected={selected?.id === msg.id} onSelect={openMessage} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6, padding: '12px 15px', borderTop: '1px solid rgba(255,255,255,0.075)', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid',
                    borderColor: page === i + 1 ? '#7c5cff' : 'rgba(255,255,255,0.08)',
                    background: page === i + 1 ? 'rgba(124,92,255,0.2)' : 'transparent',
                    color: page === i + 1 ? '#c4b8ff' : '#7f89a3',
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        {selected ? (
          <article className="message-detail">
            <div className="message-detail-head">
              <div className="sender-avatar">
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong>{selected.name}</strong>
                <span>{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</span>
              </div>
              <time>{format(new Date(selected.created_at), 'MMM d, yyyy · h:mm a')}</time>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
              <StatusBadge status={selected.status} />
              {selected.ip_address && (
                <span style={{ fontSize: 10, color: '#5a6580', fontFamily: 'DM Mono, monospace' }}>
                  IP: {selected.ip_address}
                </span>
              )}
            </div>

            <h2>{selected.subject || '(No subject)'}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p>

            {/* Existing replies */}
            {selected.message_replies?.length > 0 && (
              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.075)', paddingTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9da7be', marginBottom: 12 }}>REPLIES</p>
                {selected.message_replies.map(r => (
                  <div key={r.id} style={{ background: 'rgba(124,92,255,0.08)', border: '1px solid rgba(124,92,255,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#c4b8ff', lineHeight: 1.7 }}>{r.body}</p>
                    <time style={{ fontSize: 10, color: '#5a6580', fontFamily: 'DM Mono, monospace', display: 'block', marginTop: 6 }}>
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </time>
                  </div>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="message-controls" style={{ flexWrap: 'wrap' }}>
              <button className="secondary-button" onClick={() => setStatus(selected.id, selected.status === 'read' ? 'unread' : 'read')}>
                {selected.status === 'read' ? <EyeOff size={13} /> : <Eye size={13} />}
                Mark {selected.status === 'read' ? 'unread' : 'read'}
              </button>
              <button className="secondary-button" onClick={() => setStatus(selected.id, 'starred')}>
                <Star size={13} /> Star
              </button>
              <button className="secondary-button" onClick={() => setStatus(selected.id, 'archived')}>
                <Archive size={13} /> Archive
              </button>
              <button className="danger-button" onClick={() => setDeleting(selected)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>

            {/* Reply box */}
            <ReplyBox message={selected} onSent={() => qc.invalidateQueries({ queryKey: ['messages'] })} />
          </article>
        ) : (
          <div className="editor-empty">
            <Mail size={28} />
            <p>Select a message to read it.</p>
          </div>
        )}
      </article>

      <ConfirmModal
        open={!!deleting}
        title="Delete message"
        message={`Message from "${deleting?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleting(null)}
      />
    </AdminPage>
  );
}
