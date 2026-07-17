import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { getWebsiteSettings } from '../services/publicApi';

const schema = z.object({
  name:    z.string().min(1, 'Name is required'),
  email:   z.string().min(1, 'Email is required').email('Invalid email'),
  phone:   z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function Contact() {
  const { data: settings } = useQuery({ queryKey:['public-settings'], queryFn: getWebsiteSettings, retry: 1 });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await axios.post('/api/contact', data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err.response?.data?.error ?? 'Failed to send message. Please try again.');
    }
  };

  const email   = settings?.email   ?? 'uzairahmad@example.com';
  const phone   = settings?.phone   ?? '';
  const address = settings?.address ?? 'Pakistan';

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Helmet>
        <title>Contact | Uzair Ahmad</title>
        <meta name="description" content="Contact Uzair Ahmad for marketplace growth, listing optimization, and e-commerce strategy support." />
      </Helmet>
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Info panel */}
        <div className="glass-card p-8">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-700">Contact</p>
          <h2 className="mt-3 text-4xl font-semibold">Let's build the next growth chapter.</h2>
          <p className="mt-6 text-lg leading-8 text-neutral-700">Whether you need a store overhaul, SEO upgrades, or an operational growth system, I'd love to help.</p>
          <div className="mt-8 space-y-4 text-neutral-700">
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
              <Mail className="text-amber-700 shrink-0" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </div>
            {phone && (
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                <Phone className="text-amber-700 shrink-0" />
                <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                <MapPin className="text-amber-700 shrink-0" />
                <span>{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 transition hover:-translate-y-1" noValidate>
          {submitted && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700">
              <CheckCircle2 className="shrink-0" />
              Message sent successfully. I'll reply shortly.
            </div>
          )}
          {serverError && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-rose-600 text-sm">
              {serverError}
            </div>
          )}
          <div className="grid gap-5">
            {/* Row: Name + Email */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-neutral-500">Full Name *</label>
                <input {...register('name')} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="Your name" />
                {errors.name && <p className="mt-2 text-sm text-rose-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm text-neutral-500">Email Address *</label>
                <input type="email" {...register('email')} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="you@example.com" />
                {errors.email && <p className="mt-2 text-sm text-rose-500">{errors.email.message}</p>}
              </div>
            </div>

            {/* Row: Phone + Subject */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-neutral-500">Phone <span className="text-neutral-400">(optional)</span></label>
                <input {...register('phone')} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="+92 300 0000000" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-neutral-500">Subject <span className="text-neutral-400">(optional)</span></label>
                <input {...register('subject')} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" placeholder="Project inquiry" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-500">Message *</label>
              <textarea {...register('message')} rows={5} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none" placeholder="Tell me about your business, goals, and timeline." />
              {errors.message && <p className="mt-2 text-sm text-rose-500">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                : <><Send size={16} /> Send Message</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
