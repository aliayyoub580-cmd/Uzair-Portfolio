import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps admin routes — redirects to /admin/login if no session.
 * Shows nothing while the session is being hydrated (loading === true).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Still checking session — render nothing to avoid flash
  if (loading) {
    return (
      <div className="admin-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#8790a9', fontFamily: 'Manrope, sans-serif' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#7559ff,#2cbaff)',
            margin: '0 auto 16px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <p style={{ fontSize: 13, margin: 0 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
