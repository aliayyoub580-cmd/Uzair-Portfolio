import { Suspense, lazy, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Home, UserRound, Wrench, Code2, FolderKanban,
  Briefcase, GraduationCap, Award, Star, Mail, Image, Search as SearchIcon,
  Settings, Shield, LogOut, PanelLeftClose, Menu, X, Bell, ChevronDown,
  ArrowLeft, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdminStore } from '../store/adminStore';
import toast from 'react-hot-toast';
import '../../src/styles/admin.css';

// ── Lazy-load all admin page panels ───────────────────────────
const Dashboard       = lazy(() => import('../pages/admin/Dashboard'));
const HomeManager     = lazy(() => import('../pages/admin/HomeManager'));
const AboutManager    = lazy(() => import('../pages/admin/AboutManager'));
const ServicesManager = lazy(() => import('../pages/admin/ServicesManager'));
const SkillsManager   = lazy(() => import('../pages/admin/SkillsManager'));
const ProjectsManager = lazy(() => import('../pages/admin/ProjectsManager'));
const ExperienceManager    = lazy(() => import('../pages/admin/ExperienceManager'));
const EducationManager     = lazy(() => import('../pages/admin/EducationManager'));
const CertificatesManager  = lazy(() => import('../pages/admin/CertificatesManager'));
const TestimonialsManager  = lazy(() => import('../pages/admin/TestimonialsManager'));
const MessagesManager      = lazy(() => import('../pages/admin/MessagesManager'));
const MediaLibrary         = lazy(() => import('../pages/admin/MediaLibrary'));
const SeoSettings          = lazy(() => import('../pages/admin/SeoSettings'));
const WebsiteSettings      = lazy(() => import('../pages/admin/WebsiteSettings'));
const ProfileSettings      = lazy(() => import('../pages/admin/ProfileSettings'));

// ── Navigation config ─────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Content',
    items: [
      { to: '/admin',             icon: LayoutDashboard, label: 'Dashboard',   end: true },
      { to: '/admin/home',        icon: Home,            label: 'Home'         },
      { to: '/admin/about',       icon: UserRound,       label: 'About'        },
      { to: '/admin/services',    icon: Wrench,          label: 'Services'     },
      { to: '/admin/skills',      icon: Code2,           label: 'Skills'       },
      { to: '/admin/projects',    icon: FolderKanban,    label: 'Projects'     },
      { to: '/admin/experience',  icon: Briefcase,       label: 'Experience'   },
      { to: '/admin/education',   icon: GraduationCap,   label: 'Education'    },
      { to: '/admin/certificates',icon: Award,           label: 'Certificates' },
      { to: '/admin/testimonials',icon: Star,            label: 'Testimonials' },
    ],
  },
  {
    label: 'Inbox & Media',
    items: [
      { to: '/admin/messages',    icon: Mail,            label: 'Messages',    badge: 'messages' },
      { to: '/admin/media',       icon: Image,           label: 'Media Library'},
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/seo',         icon: SearchIcon,      label: 'SEO Settings' },
      { to: '/admin/settings',    icon: Settings,        label: 'Website Settings' },
      { to: '/admin/profile',     icon: Shield,          label: 'Profile Settings' },
    ],
  },
];

// ── Sidebar component ─────────────────────────────────────────
function Sidebar({ collapsed, onClose, unreadCount }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out');
    navigate('/admin/login', { replace: true });
  };

  const avatarLetters = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'UA';

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Admin';

  return (
    <aside className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      {/* Brand */}
      <div className="brand-row">
        <div className="brand-mark" aria-hidden="true">
          <Shield size={16} />
        </div>
        <span className="brand-name">Portfolio <span>CMS</span></span>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="side-nav" aria-label="Admin navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map(({ to, icon: Icon, label, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={17} />
                <span>{label}</span>
                {badge === 'messages' && unreadCount > 0 && (
                  <b>{unreadCount > 99 ? '99+' : unreadCount}</b>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-foot">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="back-site"
          title="View live portfolio"
        >
          <ExternalLink size={14} />
          <span>View portfolio</span>
        </a>
        <div className="profile-mini">
          <span className="avatar">{avatarLetters}</span>
          <span>
            <strong>{displayName}</strong>
            <small>Administrator</small>
          </span>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            style={{ background: 'transparent', border: 0, color: '#ff8ba1', cursor: 'pointer', padding: 4 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Topbar component ──────────────────────────────────────────
function Topbar({ onMenuOpen, onToggleCollapse, collapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Derive page title from pathname
  const pageTitle = (() => {
    const p = window.location.pathname.replace('/admin', '').replace('/', '') || 'Dashboard';
    return p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ');
  })();

  return (
    <header className="topbar">
      {/* Mobile menu button */}
      <button className="menu-button" onClick={onMenuOpen} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Desktop collapse button */}
      <button
        className="icon-button collapse-desktop"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{ display: 'none' }}
        id="desktop-collapse-btn"
      >
        <PanelLeftClose size={17} style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Breadcrumb */}
      <div className="crumb">
        <span>Admin</span>
        <ChevronDown size={13} />
        <strong>{pageTitle}</strong>
      </div>

      {/* Actions */}
      <div className="top-actions">
        <a href="/" target="_blank" rel="noopener noreferrer" className="icon-button" title="View live site" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ArrowLeft size={17} style={{ transform: 'rotate(135deg)' }} />
        </a>
        <button
          className="icon-button"
          onClick={() => navigate('/admin/messages')}
          aria-label="Messages"
          title="Messages"
        >
          <Bell size={17} />
        </button>
      </div>
    </header>
  );
}

// ── Page-level loading fallback ───────────────────────────────
function PageLoader() {
  return (
    <div className="dashboard-content" style={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
      <div style={{ textAlign: 'center', color: '#8790a9' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#7559ff,#2cbaff)',
          margin: '0 auto 12px',
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
        <p style={{ fontSize: 12, margin: 0, fontFamily: 'Manrope, sans-serif' }}>Loading…</p>
      </div>
    </div>
  );
}

// ── Root AdminLayout ──────────────────────────────────────────
export default function AdminLayout() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on outside click
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <div className={`admin-sidebar-wrap ${mobileOpen ? 'is-open' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onClose={closeMobile}
          unreadCount={0}
        />
      </div>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-backdrop visible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          onMenuOpen={() => setMobileOpen(true)}
          onToggleCollapse={toggleSidebar}
          collapsed={sidebarCollapsed}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index                    element={<Dashboard />} />
            <Route path="home"              element={<HomeManager />} />
            <Route path="about"             element={<AboutManager />} />
            <Route path="services"          element={<ServicesManager />} />
            <Route path="skills"            element={<SkillsManager />} />
            <Route path="projects"          element={<ProjectsManager />} />
            <Route path="experience"        element={<ExperienceManager />} />
            <Route path="education"         element={<EducationManager />} />
            <Route path="certificates"      element={<CertificatesManager />} />
            <Route path="testimonials"      element={<TestimonialsManager />} />
            <Route path="messages"          element={<MessagesManager />} />
            <Route path="media"             element={<MediaLibrary />} />
            <Route path="seo"               element={<SeoSettings />} />
            <Route path="settings"          element={<WebsiteSettings />} />
            <Route path="profile"           element={<ProfileSettings />} />
            <Route path="*"                 element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
