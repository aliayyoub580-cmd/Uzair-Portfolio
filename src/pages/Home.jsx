import { ArrowRight, Download, Flame, PackageCheck, SearchCheck, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getHomeContent, getServices, getWebsiteSettings } from '../services/publicApi';

// ── Fallback static content (shown while loading or if DB is empty) ──────────
const STATIC_SERVICES = [
  { id:'s1', title:'eBay Store Management', description:'Complete marketplace operations, account health, product uploads, pricing, and day-to-day store growth.', number:'01' },
  { id:'s2', title:'SEO Product Listings',  description:'Keyword-led titles, conversion copy, item specifics, and listing structure that improves visibility.', number:'02' },
  { id:'s3', title:'Product Research',       description:'Demand analysis, competitor research, profitable product discovery, and category opportunity mapping.', number:'03' },
  { id:'s4', title:'Inventory & Growth',     description:'Inventory discipline, fulfillment coordination, sales reporting, and data-backed marketplace strategy.', number:'04' },
];

const projectCards = [
  { title:'Store Optimization', tag:'SEO + Conversion', Icon: SearchCheck },
  { title:'Catalog Management', tag:'Inventory + Listings', Icon: PackageCheck },
  { title:'Marketplace Growth',  tag:'Strategy + Reporting', Icon: TrendingUp },
];

export default function Home() {
  const { data: home }     = useQuery({ queryKey:['public-home'],     queryFn: getHomeContent,     retry: 1 });
  const { data: services } = useQuery({ queryKey:['public-services'], queryFn: getServices,        retry: 1 });
  const { data: settings } = useQuery({ queryKey:['public-settings'], queryFn: getWebsiteSettings, retry: 1 });

  // Merge DB data over static defaults
  const heroTitle       = home?.hero_title       ?? 'Hey, there';
  const heroSubtitle    = home?.hero_subtitle     ?? 'E-commerce Specialist';
  const heroDescription = home?.hero_description ?? 'Specialized in eBay management, SEO listings, product research, inventory systems, and marketplace growth.';
  const ctaLabel        = home?.cta_label        ?? 'Hire Me';
  const ctaUrl          = home?.cta_url          ?? '/contact';
  const resumeLabel     = home?.resume_label     ?? 'Resume';
  const resumeUrl       = home?.resume_url       ?? '/Uzair-Resume.pdf';
  const profileImg      = home?.profile_image_url ?? 'https://i.postimg.cc/fbp9rpsx/Chat-GPT-Image-Jul-17-2026-07-35-00-PM.png';
  const siteEmail       = home?.social_email     ?? settings?.email ?? 'uzairahmad@example.com';

  const displayServices = (services && services.length > 0)
    ? services.slice(0, 4).map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') }))
    : STATIC_SERVICES;

  const metaTitle = settings?.site_name ? `${settings.site_name} | E-commerce Specialist` : 'Uzair Ahmad | E-commerce Specialist';
  const metaDesc  = heroDescription;

  return (
    <div className="relative overflow-hidden bg-[#fbfaf6]">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-12 lg:pb-28">
        <div className="pointer-events-none absolute inset-x-8 top-28 h-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,204,128,0.38),transparent_62%)] blur-3xl" />
        <div className="relative min-h-[720px] overflow-hidden rounded-[2rem] border border-black/5 bg-gradient-to-b from-white via-[#fff9e8] to-[#fbfaf6] px-5 pb-10 pt-10 shadow-[0_35px_100px_rgba(119,93,43,0.12)] sm:px-10 lg:px-12">
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black shadow-[0_14px_34px_rgba(0,0,0,0.08)]">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
              </span>
              Available for new opportunities
            </div>
            <p className="max-w-xs text-sm font-semibold leading-6 text-neutral-700">{heroDescription}</p>
          </div>

          <h1 className="relative z-20 mt-14 text-center font-serif text-[clamp(4.8rem,14vw,13rem)] italic leading-none tracking-[-0.08em] text-black/95">
            {heroTitle}
          </h1>

          <div className="pointer-events-none absolute inset-x-0 top-[380px] z-0 mx-auto flex justify-center lg:top-[350px]">
            <img
              src={profileImg}
              alt={settings?.site_name ?? 'Uzair Ahmad'}
              className="h-[560px] w-[min(82vw,520px)] object-cover object-[50%_35%] drop-shadow-[0_32px_42px_rgba(80,62,33,0.22)] [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)]"
            />
          </div>

          <div className="relative z-20 mt-[330px] grid items-end gap-8 lg:mt-[300px] lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[clamp(4.5rem,11vw,9.5rem)] font-black uppercase leading-[0.78] tracking-[-0.09em] text-black">
                I Am<br />{settings?.site_name?.split(' ')[0] ?? 'Uzair'}
              </p>
            </div>
            <div className="max-w-sm lg:text-right">
              <p className="text-[clamp(2.8rem,5vw,5rem)] font-black uppercase leading-[0.86] tracking-[-0.08em] text-black">
                {heroSubtitle || 'E-commerce\nSpecialist'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 lg:justify-end">
                <Link to={ctaUrl} className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800">
                  {ctaLabel} <ArrowRight size={16} />
                </Link>
                <a href={resumeUrl} download className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:border-black/25">
                  {resumeLabel} <Download size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services grid ─────────────────────────────────────── */}
      <section className="border-y border-black/10 bg-white/70 px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-500">I can help you with</p>
            <h2 className="mt-4 text-5xl font-black uppercase leading-none tracking-[-0.08em] text-black sm:text-6xl">
              Marketplace systems that sell.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {displayServices.map((service) => (
              <article key={service.id ?? service.title} className="group border-l border-black/15 bg-[#fbfaf6] p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
                <span className="text-4xl font-black text-black/10">{service.number}</span>
                <h3 className="mt-10 text-xl font-black text-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── About teaser ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-5xl font-black uppercase leading-none tracking-[-0.08em] text-black sm:text-6xl">
              Turning listings into growth.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-neutral-600">
              I build clean marketplace operations: better product pages, sharper SEO, stronger inventory control, and reporting that makes decisions easier.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {projectCards.map(({ title, tag, Icon }) => (
              <article key={title} className="rounded-[2rem] bg-black p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.2)] transition hover:-translate-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"><Icon size={22} /></div>
                <h3 className="mt-20 text-2xl font-black leading-none tracking-[-0.05em]">{title}</h3>
                <p className="mt-3 text-sm text-white/60">{tag}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] bg-[#111] p-8 text-white sm:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-200">
                <Flame size={16} /> Ready to grow your store
              </div>
              <h2 className="mt-6 max-w-2xl text-5xl font-black uppercase leading-none tracking-[-0.08em] sm:text-6xl">
                Let's build your next marketplace win.
              </h2>
            </div>
            <Link to={ctaUrl} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-black transition hover:-translate-y-0.5">
              Start a project <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
