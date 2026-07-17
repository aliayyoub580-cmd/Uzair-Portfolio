/**
 * Reusable labelled form field with error display.
 * Wraps input / textarea / select passed as children.
 */
import { AlertCircle } from 'lucide-react';

export default function FormField({ label, error, hint, required, children, className = '' }) {
  return (
    <div className={`content-form-field ${className}`} style={{ display: 'grid', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#9da7be', letterSpacing: '0.03em' }}>
        {label}
        {required && <span style={{ color: '#ff8ba1', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: 10, color: '#5a6580', margin: 0 }}>{hint}</p>
      )}
      {error && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ff8ba1', margin: 0 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}
