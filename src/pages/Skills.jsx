import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Code2, ServerCog, ShoppingBag, Search, Boxes, BarChart3, Loader2 } from 'lucide-react';
import { getSkills } from '../services/publicApi';

const ICON_MAP = { Code2, ServerCog, ShoppingBag, Search, Boxes, BarChart3 };

const STATIC = [
  { id:'sk1', name:'React',     percentage:92, icon:'Code2',     color:'#7c3aed', category:'Frontend' },
  { id:'sk2', name:'Node',      percentage:88, icon:'ServerCog', color:'#059669', category:'Backend' },
  { id:'sk3', name:'eBay',      percentage:95, icon:'ShoppingBag',color:'#b45309', category:'Marketplace' },
  { id:'sk4', name:'SEO',       percentage:94, icon:'Search',    color:'#0891b2', category:'Marketing' },
  { id:'sk5', name:'Inventory', percentage:90, icon:'Boxes',     color:'#9333ea', category:'Operations' },
  { id:'sk6', name:'Analytics', percentage:91, icon:'BarChart3', color:'#dc2626', category:'Analytics' },
];

// Group by category
function groupByCategory(skills) {
  return skills.reduce((acc, s) => {
    const cat = s.category ?? 'Other';
    acc[cat] = acc[cat] ? [...acc[cat], s] : [s];
    return acc;
  }, {});
}

export default function Skills() {
  const { data, isLoading } = useQuery({ queryKey:['public-skills'], queryFn: getSkills, retry: 1 });
  const skills = (data && data.length > 0) ? data : STATIC;

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Helmet>
        <title>Skills | Uzair Ahmad</title>
        <meta name="description" content="Skills and technical capabilities of Uzair Ahmad." />
      </Helmet>
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="glass-card p-8">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-700">Capabilities</p>
          <h2 className="mt-3 text-4xl font-semibold">A blend of growth strategy, operations, and technical execution.</h2>
          <p className="mt-6 text-lg leading-8 text-neutral-700">The stack behind the work combines marketplace expertise with modern tools that keep the engine moving smoothly.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[...new Set(skills.map(s => s.category).filter(Boolean))].slice(0, 6).map(cat => (
              <span key={cat} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-700">{cat}</span>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center"><Loader2 size={28} className="animate-spin text-amber-700" /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => {
              const Icon  = ICON_MAP[skill.icon] ?? BarChart3;
              const color = skill.color ?? '#b45309';
              return (
                <div key={skill.id} className="glass-card p-6 transition hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${color}18`, color }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{skill.name}</h3>
                        <p className="text-sm text-neutral-500">{skill.category ?? 'Skill'}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-semibold" style={{ color }}>{skill.percentage}%</div>
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${skill.percentage}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
