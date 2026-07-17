import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Github, Loader2, Star } from 'lucide-react';
import { getProjects } from '../services/publicApi';

const STATIC = [
  { id:'p1', title:'eBay Store Optimization', short_description:'Revamped store merchandising and product architecture to improve discoverability and conversion.', tech_stack:['eBay','SEO','Growth'],         live_url:'/contact', github_url:'https://github.com', thumbnail_url:'' },
  { id:'p2', title:'Product Research',         short_description:'Built a data-led product selection framework that surfaced profitable, scalable opportunities.',    tech_stack:['Research','Analytics','Strategy'], live_url:'/contact', github_url:'https://github.com', thumbnail_url:'' },
  { id:'p3', title:'Complete Store Management',short_description:'Orchestrated catalog health, inventory flow, pricing, and buybox readiness at scale.',              tech_stack:['Operations','Inventory','Management'], live_url:'/contact', github_url:'https://github.com', thumbnail_url:'' },
];

export default function Projects() {
  const { data, isLoading } = useQuery({ queryKey:['public-projects'], queryFn: getProjects, retry: 1 });
  const projects = (data && data.length > 0) ? data : STATIC;

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Helmet>
        <title>Projects | Uzair Ahmad</title>
        <meta name="description" content="Portfolio projects and case studies by Uzair Ahmad." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-700">Selected Work</p>
        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Case studies built around outcomes, not noise.</h2>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 size={28} className="animate-spin text-amber-700" /></div>
      ) : (
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {projects.map((project) => {
            const tags = Array.isArray(project.tech_stack) ? project.tech_stack : [];
            return (
              <article key={project.id} className="glass-card overflow-hidden transition hover:-translate-y-2">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20">
                  {project.thumbnail_url && (
                    <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  {project.featured && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      <Star size={11} fill="currentColor" /> Featured
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold">{project.title}</h3>
                  <p className="mt-4 text-neutral-500">{project.short_description}</p>
                  {tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-neutral-700">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-8 flex gap-3 flex-wrap">
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-100 px-4 py-2 text-sm text-black hover:bg-amber-200 transition">
                        Live Demo <ExternalLink size={15} />
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition">
                        GitHub <Github size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
