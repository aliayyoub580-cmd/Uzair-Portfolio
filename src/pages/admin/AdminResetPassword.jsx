import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function AdminResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw]     = useState(false);
  const [showCp, setShowCp]     = useState(false);
  const [done,   setDone]       = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase sends the recovery token in the URL fragment — let the client handle it
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    const { error } = await updatePassword(password);
    if (error) {
      toast.error(error.message ?? 'Could not update password.');
      return;
    }
    setDone(true);
    toast.success('Password updated successfully!');
    setTimeout(() => navigate('/admin/login', { replace: true }), 2500);
  };

  return (
    <>
      <style>{`
        .rp-shell {
          min-height:100vh; background:#090d1c;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:24px; font-family:Manrope,ui-sans-serif,system-ui; position:relative; overflow:hidden;
        }
        .rp-blob { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
        .rp-blob--1 { width:380px;height:380px;background:rgba(117,89,255,0.18);top:-100px;left:-80px; }
        .rp-blob--2 { width:280px;height:280px;background:rgba(76,201,240,0.12);bottom:-60px;right:-40px; }
        .rp-card {
          width:100%; max-width:420px;
          background:rgba(13,18,37,0.92); border:1px solid rgba(255,255,255,0.08);
          border-radius:20px; padding:40px 36px; backdrop-filter:blur(24px);
          box-shadow:0 32px 80px rgba(0,0,0,0.4); position:relative; z-index:1;
        }
        .rp-head { text-align:center; margin-bottom:28px; }
        .rp-brand {
          width:48px;height:48px; background:linear-gradient(135deg,#7559ff,#2cbaff);
          border-radius:14px; display:inline-grid; place-items:center; color:#fff;
          margin-bottom:18px; box-shadow:0 8px 24px rgba(117,89,255,0.4);
        }
        .rp-head h1 { margin:0 0 6px;font-size:22px;font-weight:800;color:#f4f5ff;letter-spacing:-0.6px; }
        .rp-head p  { margin:0;font-size:13px;color:#8790a9; }
        .rp-form    { display:grid; gap:16px; }
        .rp-field   { display:grid; gap:6px; }
        .rp-label   { font-size:11px;font-weight:700;color:#9da7be;letter-spacing:0.03em; }
        .rp-error   { display:flex;align-items:center;gap:4px;font-size:11px;color:#ff8ba1; }
        .rp-wrap    { position:relative; display:flex; align-items:center; }
        .rp-icon    { position:absolute;left:12px;color:#5a6580;pointer-events:none; }
        .rp-toggle  { position:absolute;right:10px;background:transparent;border:0;color:#5a6580;cursor:pointer;padding:4px;display:grid;place-items:center; }
        .rp-input {
          width:100%; background:#0b1020; border:1px solid rgba(255,255,255,0.09);
          border-radius:9px; color:#eef0fc; font:13px Manrope,sans-serif;
          padding:11px 38px; outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .rp-input:focus  { border-color:#8879ef;box-shadow:0 0 0 3px rgba(136,121,239,0.15); }
        .rp-input.error  { border-color:rgba(255,100,128,0.5); }
        .rp-input::placeholder { color:#454f68; }
        .rp-btn {
          height:44px; background:linear-gradient(105deg,#7961ec,#4f8dfb);
          border:none; border-radius:9px; color:#fff; font:700 14px Manrope,sans-serif;
          cursor:pointer; display:grid; place-items:center;
          box-shadow:0 8px 20px rgba(78,104,217,0.35);
          transition:opacity 0.2s,transform 0.15s;
        }
        .rp-btn:hover:not(:disabled) { opacity:0.9;transform:translateY(-1px); }
        .rp-btn:disabled { opacity:0.55;cursor:not-allowed; }
        .rp-spinner {
          width:18px;height:18px; border:2px solid rgba(255,255,255,0.25);
          border-top-color:#fff; border-radius:50%;
          animation:rp-spin 0.7s linear infinite; display:inline-block;
        }
        @keyframes rp-spin { to { transform:rotate(360deg); } }
        .rp-success {
          text-align:center; padding:24px 0;
          display:flex; flex-direction:column; align-items:center; gap:12px;
          color:#5ae0ac; font-size:14px; font-weight:600;
        }
        .rp-success p { color:#8790a9;font-size:12px;font-weight:400;margin:0; }
        .rp-alert {
          display:flex; align-items:center; gap:8px; padding:12px 14px;
          border-radius:10px; font-size:12px; font-weight:600; margin-bottom:18px;
          background:rgba(255,165,0,0.1); border:1px solid rgba(255,165,0,0.25); color:#ffb347;
        }
        .rp-back { text-align:center;margin:22px 0 0;font-size:12px;color:#626d88; }
        .rp-link { color:#9d8eff;text-decoration:none;font-size:12px; }
        .rp-link:hover { text-decoration:underline; }
      `}</style>

      <div className="rp-shell">
        <div className="rp-blob rp-blob--1" />
        <div className="rp-blob rp-blob--2" />

        <motion.div
          className="rp-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rp-head">
            <div className="rp-brand"><Sparkles size={18} /></div>
            <h1>Set new password</h1>
            <p>Choose a strong password for your account</p>
          </div>

          {!sessionReady && (
            <div className="rp-alert">
              <AlertCircle size={15} />
              Waiting for the reset link to be verified…
            </div>
          )}

          {done ? (
            <div className="rp-success">
              <CheckCircle2 size={40} />
              Password updated!
              <p>Redirecting you to the login page…</p>
            </div>
          ) : (
            <form className="rp-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="rp-field">
                <label className="rp-label">New password</label>
                <div className="rp-wrap">
                  <Lock size={16} className="rp-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={`rp-input ${errors.password ? 'error' : ''}`}
                    {...register('password')}
                  />
                  <button type="button" className="rp-toggle" onClick={() => setShowPw(v => !v)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="rp-error"><AlertCircle size={12} /> {errors.password.message}</p>
                )}
              </div>

              <div className="rp-field">
                <label className="rp-label">Confirm password</label>
                <div className="rp-wrap">
                  <Lock size={16} className="rp-icon" />
                  <input
                    type={showCp ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={`rp-input ${errors.confirmPassword ? 'error' : ''}`}
                    {...register('confirmPassword')}
                  />
                  <button type="button" className="rp-toggle" onClick={() => setShowCp(v => !v)}>
                    {showCp ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="rp-error"><AlertCircle size={12} /> {errors.confirmPassword.message}</p>
                )}
              </div>

              <button type="submit" className="rp-btn" disabled={isSubmitting || !sessionReady}>
                {isSubmitting ? <span className="rp-spinner" /> : 'Update password'}
              </button>
            </form>
          )}

          <p className="rp-back">
            <Link to="/admin/login" className="rp-link">← Back to login</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
