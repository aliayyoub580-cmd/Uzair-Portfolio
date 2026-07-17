import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, GraduationCap, BriefcaseBusiness, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import { getAboutContent, getExperience, getEducation } from '../services/publicApi';

const STATIC_TIMELINE = [
  { id:'e1', position:'Senior E-commerce Specialist', company:'Premium Retail Brand', start_date:'2022-01-01', is_current:true,  description:'Leading marketplace growth, SEO enhancements, and store performance for premium retail brands.' },
  { id:'e2', position:'E-commerce Operations Lead',   company:'Digital Commerce Co',  start_date:'2020-01-01', end_date:'2021-12-31', description:'Scaled inventory workflows and optimized daily operations across multi-channel product catalogs.' },
  { id:'e3', position:'Digital Commerce Analyst',     company:'Marketplace Agency',   start_date:'2018-01-01', end_date:'2019-12-31', description:'Focused on marketplace strategy, listing quality, and data-backed buybox growth.' },
];

function fmtDateRange(start, end, isCurrent) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  return `${fmt(start)} – ${isCurrent ? 'Present' : fmt(end)}`;
}

export default function About() {
  const { data: about,      isLoading: loadAbout } = useQuery({ queryKey:['public-about'],      queryFn: getAboutContent, retry: 1 });
  const { data: experience, isLoading: loadExp   } = useQuery({ queryKey:['public-experience'], queryFn: getExperience,  retry: 1 });
  const { data: education,  isLoading: loadEdu   } = useQuery({ queryKey:['public-education'],  queryFn: getEducation,   retry: 1 });

  const bio         = about?.biography ?? 'I transform online stores into high-performing growth machines by combining listing strategy, SEO, inventory discipline, and customer-centric operations.';
  const profileImg  = about?.profile_image_url ?? 'https://i.postimg.cc/fbp9rpsx/Chat-GPT-Image-Jul-17-2026-07-35-00-PM.png';
  const location    = about?.location ?? 'Pakistan';
  const contactEmail = about?.email ?? '';
  const contactPhone = about?.phone ?? '';
  const timeline    = (experience && experience.length > 0) ? experience : STATIC_TIMELINE;
  const achievements = Array.isArray(about?.achievements) ? about.achievements : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Helmet>
        <title>About | Uzair Ahmad</title>
        <meta name="description" content={bio.slice(0, 160)} />
      </Helmet>

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Profile card */}
        <div className="glass-card overflow-hidden p-6 transition hover:-translate-y-2">
          <div className="aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-neutral-200">
            <img src={profileImg} alt="Uzair Ahmad" className="h-full w-full object-cover" />
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-semibold">Uzair Ahmad</h2>
            <p className="mt-2 text-neutral-500">Marketplace strategist with a passion for performance-driven growth and premium digital storytelling.</p>

            {/* Details */}
            <div className="mt-4 space-y-2">
              {location && (
                <div className="flex items-center gap-2 text-sm text-neutral-600"><MapPin size={14} className="text-amber-700" />{location}</div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-2 text-sm text-neutral-600"><Mail size={14} className="text-amber-700" />{contactEmail}</div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-2 text-sm text-neutral-600"><Phone size={14} className="text-amber-700" />{contactPhone}</div>
              )}
              {about?.availability && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {about.availability}
                </div>
              )}
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {achievements.map((a, i) => (
                  <div key={i} className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                    <p className="text-xl font-black text-amber-700">{a.value}</p>
                    <p className="text-xs text-neutral-500 mt-1">{a.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Bio */}
          <section className="glass-card p-8">
            <h3 className="text-3xl font-semibold">Biography</h3>
            <p className="mt-4 text-lg leading-8 text-neutral-700 whitespace-pre-line">{bio}</p>
          </section>

          {/* Experience & Education cards */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="glass-card p-8">
              <div className="mb-4 flex items-center gap-3 text-amber-700">
                <BriefcaseBusiness /><h4 className="text-xl font-semibold">Experience</h4>
              </div>
              {loadAbout ? <Loader2 size={18} className="animate-spin text-amber-700" /> : (
                <ul className="space-y-3 text-neutral-700">
                  {timeline.slice(0, 3).map(e => (
                    <li key={e.id}>• {e.position} at {e.company}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="glass-card p-8">
              <div className="mb-4 flex items-center gap-3 text-amber-800">
                <GraduationCap /><h4 className="text-xl font-semibold">Education</h4>
              </div>
              {loadEdu ? <Loader2 size={18} className="animate-spin text-amber-700" /> : (
                <ul className="space-y-3 text-neutral-700">
                  {(education && education.length > 0)
                    ? education.slice(0, 3).map(e => (
                        <li key={e.id}>• {e.degree}{e.institute ? ` — ${e.institute}` : ''}</li>
                      ))
                    : [
                        '• Business and digital commerce foundation',
                        '• Advanced learning in SEO, optimization and growth systems',
                        '• Continuous craft development in digital products',
                      ].map(t => <li key={t}>{t}</li>)
                  }
                </ul>
              )}
            </div>
          </section>

          {/* Work timeline */}
          <section className="glass-card p-8">
            <div className="mb-6 flex items-center gap-3 text-amber-700">
              <CalendarDays /><h4 className="text-xl font-semibold">Journey</h4>
            </div>
            {loadExp ? (
              <Loader2 size={18} className="animate-spin text-amber-700" />
            ) : (
              <div className="space-y-5">
                {timeline.map((item) => (
                  <div key={item.id} className="border-l border-black/10 pl-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
                      {fmtDateRange(item.start_date, item.end_date, item.is_current)}
                    </p>
                    <h5 className="mt-1 text-lg font-semibold text-black">{item.position}</h5>
                    {item.company && <p className="text-sm text-amber-700 font-medium">{item.company}{item.location ? ` · ${item.location}` : ''}</p>}
                    {item.description && <p className="mt-2 text-neutral-700">{item.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
