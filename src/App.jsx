import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { queryClient } from './lib/queryClient';
import Layout from './layouts/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// ── Public pages ──────────────────────────────────────────────
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Services  = lazy(() => import('./pages/Services'));
const Skills    = lazy(() => import('./pages/Skills'));
const Projects  = lazy(() => import('./pages/Projects'));
const Contact   = lazy(() => import('./pages/Contact'));

// ── Admin pages ───────────────────────────────────────────────
const AdminLogin         = lazy(() => import('./pages/admin/AdminLogin'));
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword'));
const AdminLayout        = lazy(() => import('./layouts/AdminLayout'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1d2847',
              color: '#f4f5ff',
              border: '1px solid rgba(119,129,214,0.35)',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'Manrope, sans-serif',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#5ae0ac', secondary: '#1d2847' } },
            error:   { iconTheme: { primary: '#ff8ba1', secondary: '#1d2847' } },
          }}
        />

        <LoadingScreen />

        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            {/* ── Auth routes (no layout) ── */}
            <Route path="/admin/login"          element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />

            {/* ── Admin panel (protected) ── */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            {/* ── Public portfolio routes ── */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/"         element={<Home />} />
                    <Route path="/about"    element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/skills"   element={<Skills />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contact"  element={<Contact />} />
                    <Route path="*"         element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Suspense>

        {/* Show React Query DevTools only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
