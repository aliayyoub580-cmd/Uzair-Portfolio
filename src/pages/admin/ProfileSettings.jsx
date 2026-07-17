import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Eye, EyeOff, CheckCircle2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import AdminPage   from '../../components/admin/AdminPage';
import FormField   from '../../components/admin/FormField';
import ImageUpload from '../../components/admin/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../services/adminApi';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email:     z.string().email('Invalid email'),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password:     z.string().min(8, 'Must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine(d => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export default function ProfileSettings() {
  const { user, updateProfile, updatePassword, signIn } = useAuth();
  const [photoUrl, setPhotoUrl] = useState(user?.user_metadata?.avatar_url ?? '');
  const [showCurr, setShowCurr] = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwDone,   setPwDone]   = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name ?? '',
      email:     user?.email ?? '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  const saveProfile = async (values) => {
    const { error } = await updateProfile({
      full_name: values.full_name,
      avatar_url: photoUrl,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Profile updated');
    logActivity('Updated profile', 'profile');
  };

  const savePassword = async (values) => {
    // Re-authenticate first to validate current password
    const { error: authErr } = await signIn({ email: user?.email, password: values.current_password });
    if (authErr) { passwordForm.setError('current_password', { message: 'Incorrect current password' }); return; }
    const { error } = await updatePassword(values.new_password);
    if (error) { toast.error(error.message); return; }
    toast.success('Password changed successfully');
    logActivity('Changed password', 'profile');
    passwordForm.reset();
    setPwDone(true);
    setTimeout(() => setPwDone(false), 4000);
  };

  const avatarLetters = (user?.user_metadata?.full_name ?? user?.email ?? 'UA')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AdminPage
      eyebrow="PROFILE"
      title="Profile Settings"
      subtitle="Update your account details and password."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        {/* Profile info */}
        <article className="panel">
          <div className="panel-heading"><div><p>ACCOUNT</p><h2>Your profile</h2></div></div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 24px' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(145deg,#f0aa70,#814cca)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>
                {avatarLetters}
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#f4f5ff' }}>
                {user?.user_metadata?.full_name ?? 'Admin'}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#8790a9' }}>{user?.email}</p>
            </div>
          </div>

          <form className="content-form" onSubmit={profileForm.handleSubmit(saveProfile)} noValidate>
            <FormField label="Full Name" error={profileForm.formState.errors.full_name?.message} required>
              <input {...profileForm.register('full_name')} placeholder="Uzair Ahmad" />
            </FormField>
            <FormField label="Email Address" error={profileForm.formState.errors.email?.message} hint="Changing email requires re-verification" required>
              <input type="email" {...profileForm.register('email')} />
            </FormField>
            <FormField label="Profile Photo">
              <ImageUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                bucket="profile-images"
                folder="profile"
                label="Profile photo"
              />
            </FormField>
            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting
                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Save size={14} />}
                Save profile
              </button>
            </div>
          </form>
        </article>

        {/* Change password */}
        <article className="panel">
          <div className="panel-heading">
            <div><p>SECURITY</p><h2>Change password</h2></div>
            <Shield size={16} style={{ color: '#5a6580' }} />
          </div>

          <AnimatePresence mode="wait">
            {pwDone ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12, color: '#5ae0ac', textAlign: 'center' }}
              >
                <CheckCircle2 size={44} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Password updated!</p>
                <p style={{ margin: 0, fontSize: 12, color: '#8790a9' }}>Your account is secure.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="content-form"
                style={{ marginTop: 20 }}
                onSubmit={passwordForm.handleSubmit(savePassword)}
                noValidate
              >
                <FormField label="Current Password" error={passwordForm.formState.errors.current_password?.message} required>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurr ? 'text' : 'password'}
                      {...passwordForm.register('current_password')}
                      placeholder="••••••••"
                      style={{ paddingRight: 38 }}
                    />
                    <button type="button" onClick={() => setShowCurr(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}>
                      {showCurr ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormField>

                <FormField label="New Password" error={passwordForm.formState.errors.new_password?.message} hint="Minimum 8 characters" required>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      {...passwordForm.register('new_password')}
                      placeholder="Min. 8 characters"
                      style={{ paddingRight: 38 }}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm New Password" error={passwordForm.formState.errors.confirm_password?.message} required>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConf ? 'text' : 'password'}
                      {...passwordForm.register('confirm_password')}
                      placeholder="Repeat new password"
                      style={{ paddingRight: 38 }}
                    />
                    <button type="button" onClick={() => setShowConf(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: '#5a6580', cursor: 'pointer' }}>
                      {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormField>

                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting
                      ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Shield size={14} />}
                    Update password
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </article>

        {/* Account info */}
        <article className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-heading"><div><p>ACCOUNT INFO</p><h2>Session details</h2></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
            {[
              { label: 'User ID',        value: user?.id?.slice(0, 8) + '…' },
              { label: 'Email',          value: user?.email },
              { label: 'Role',           value: user?.role ?? 'authenticated' },
              { label: 'Last sign in',   value: user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—' },
              { label: 'Account created',value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
              { label: 'Provider',       value: user?.app_metadata?.provider ?? 'email' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, color: '#5a6580', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#c4cbe0', fontWeight: 600 }}>{value}</p>
              </div>
            ))}
          </div>
        </article>

      </div>
    </AdminPage>
  );
}
