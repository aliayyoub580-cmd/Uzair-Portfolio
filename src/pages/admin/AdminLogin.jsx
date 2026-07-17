import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Zod schemas ────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

// ── Reusable field ─────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="al-field">
      <label className="al-label">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="al-error"
          >
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Login form ─────────────────────────────────────────────────
function LoginForm({ onForgot }) {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname ?? '/admin';

  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    const { error } = await signIn({ email, password });
    if (error) {
      setServerError(error.message ?? 'Invalid email or password.');
      return;
    }
    toast.success('Welcome back!');
    navigate(from, { replace: true });
  };

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="al-head">
        <div className="al-brand">
          <Sparkles size={18} />
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to your admin dashboard</p>
      </div>

      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="al-alert al-alert--error"
          >
            <AlertCircle size={15} />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="al-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email address" error={errors.email?.message}>
          <div className="al-input-wrap">
            <Mail size={16} className="al-input-icon" />
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              className={`al-input ${errors.email ? 'is-error' : ''}`}
              {...register('email')}
            />
          </div>
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <div className="al-input-wrap">
            <Lock size={16} className="al-input-icon" />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`al-input ${errors.password ? 'is-error' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              className="al-toggle-pw"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <div className="al-row">
          <button type="button" className="al-link" onClick={onForgot}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className="al-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="al-spinner" />
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="al-back">
        <Link to="/" className="al-link">
          <ArrowLeft size={13} /> Back to portfolio
        </Link>
      </p>
    </motion.div>
  );
}

// ── Forgot password form ───────────────────────────────────────
function ForgotForm({ onBack }) {
  const { sendPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async ({ email }) => {
    const { error } = await sendPasswordReset(email);
    if (error) {
      toast.error(error.message ?? 'Something went wrong.');
      return;
    }
    setSent(true);
  };

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="al-head">
        <div className="al-brand">
          <Lock size={18} />
        </div>
        <h1>Reset password</h1>
        <p>We'll email you a reset link</p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="al-alert al-alert--success"
        >
          <CheckCircle2 size={15} />
          Check your inbox — a reset link is on its way.
        </motion.div>
      ) : (
        <form className="al-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Email address" error={errors.email?.message}>
            <div className="al-input-wrap">
              <Mail size={16} className="al-input-icon" />
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className={`al-input ${errors.email ? 'is-error' : ''}`}
                {...register('email')}
              />
            </div>
          </Field>

          <button type="submit" className="al-submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="al-spinner" /> : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="al-back">
        <button type="button" className="al-link" onClick={onBack}>
          <ArrowLeft size={13} /> Back to login
        </button>
      </p>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function AdminLogin() {
  const [view, setView] = useState('login'); // 'login' | 'forgot'

  return (
    <>
      <style>{loginStyles}</style>
      <div className="al-shell">
        {/* Background blobs */}
        <div className="al-blob al-blob--1" />
        <div className="al-blob al-blob--2" />
        <div className="al-blob al-blob--3" />

        <motion.div
          className="al-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <AnimatePresence mode="wait">
            {view === 'login' ? (
              <LoginForm key="login" onForgot={() => setView('forgot')} />
            ) : (
              <ForgotForm key="forgot" onBack={() => setView('login')} />
            )}
          </AnimatePresence>
        </motion.div>

        <p className="al-footer">
          Portfolio Admin · {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}

// ── Scoped styles ──────────────────────────────────────────────
const loginStyles = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

.al-shell {
  min-height: 100vh;
  background: #090d1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: Manrope, ui-sans-serif, system-ui;
  position: relative;
  overflow: hidden;
}

.al-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.al-blob--1 { width: 420px; height: 420px; background: rgba(117,89,255,0.18); top: -120px; left: -100px; }
.al-blob--2 { width: 320px; height: 320px; background: rgba(76,201,240,0.12); bottom: -80px; right: -60px; }
.al-blob--3 { width: 250px; height: 250px; background: rgba(79,141,251,0.1); top: 40%; left: 60%; }

.al-card {
  width: 100%;
  max-width: 420px;
  background: rgba(13,18,37,0.92);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 40px 36px;
  backdrop-filter: blur(24px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04);
  position: relative;
  z-index: 1;
}

.al-head { text-align: center; margin-bottom: 28px; }
.al-brand {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #7559ff, #2cbaff);
  border-radius: 14px;
  display: inline-grid;
  place-items: center;
  color: #fff;
  margin-bottom: 18px;
  box-shadow: 0 8px 24px rgba(117,89,255,0.4);
}
.al-head h1 { margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #f4f5ff; letter-spacing: -0.6px; }
.al-head p  { margin: 0; font-size: 13px; color: #8790a9; }

.al-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 18px;
}
.al-alert--error   { background: rgba(255,100,128,0.1); border: 1px solid rgba(255,100,128,0.25); color: #ff8ba1; }
.al-alert--success { background: rgba(83,223,166,0.1);  border: 1px solid rgba(83,223,166,0.25);  color: #5ae0ac; }

.al-form { display: grid; gap: 16px; }

.al-field  { display: grid; gap: 6px; }
.al-label  { font-size: 11px; font-weight: 700; color: #9da7be; letter-spacing: 0.03em; }
.al-error  { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #ff8ba1; }

.al-input-wrap { position: relative; display: flex; align-items: center; }
.al-input-icon { position: absolute; left: 12px; color: #5a6580; pointer-events: none; }
.al-toggle-pw  { position: absolute; right: 10px; background: transparent; border: 0; color: #5a6580; cursor: pointer; padding: 4px; display: grid; place-items: center; }
.al-toggle-pw:hover { color: #a0a9c4; }

.al-input {
  width: 100%;
  background: #0b1020;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 9px;
  color: #eef0fc;
  font: 13px Manrope, sans-serif;
  padding: 11px 38px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.al-input:focus { border-color: #8879ef; box-shadow: 0 0 0 3px rgba(136,121,239,0.15); }
.al-input.is-error { border-color: rgba(255,100,128,0.5); }
.al-input::placeholder { color: #454f68; }

.al-row { display: flex; justify-content: flex-end; }
.al-link {
  background: transparent; border: 0;
  color: #9d8eff; font: 12px Manrope, sans-serif;
  cursor: pointer; text-decoration: none;
  display: inline-flex; align-items: center; gap: 4px;
}
.al-link:hover { color: #c4b8ff; text-decoration: underline; }

.al-submit {
  height: 44px;
  background: linear-gradient(105deg, #7961ec, #4f8dfb);
  border: none;
  border-radius: 9px;
  color: #fff;
  font: 700 14px Manrope, sans-serif;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(78,104,217,0.35);
  transition: opacity 0.2s, transform 0.15s;
}
.al-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.al-submit:disabled { opacity: 0.55; cursor: not-allowed; }

.al-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: al-spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes al-spin { to { transform: rotate(360deg); } }

.al-back { text-align: center; margin: 22px 0 0; font-size: 12px; color: #626d88; }

.al-footer { color: #3a4260; font-size: 11px; margin-top: 28px; position: relative; z-index: 1; }
`;
