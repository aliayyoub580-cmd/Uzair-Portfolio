import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch, SearchCheck, Boxes, BarChart3, ShoppingCart, Truck, TrendingUp, Compass, Loader2 } from 'lucide-react';
import { getServices } from '../services/publicApi';

const ICON_MAP = {
  PackageSearch, SearchCheck, Boxes, BarChart3, ShoppingCart, Truck, TrendingUp, Compass,
  Code2: Compass, Wrench: SearchCheck, Globe: Compass, Cpu: BarChart3,
};

const STATIC = [
  { id:'s1', title:'eBay Management',     description:'Store oversight, account health, and day-to-day optimization for consistent performance.',                    icon:'PackageSearch' },
  { id:'s2', title:'SEO Listings',        description:'Keyword-rich, conversion-focused listings designed to improve visibility and traffic.',                         icon:'SearchCheck' },
  { id:'s3', title:'Product Research',    description:'Opportunity discovery, demand analysis, and competitive positioning built around market data.',                 icon:'Boxes' },
  { id:'s4', title:'Inventory Management',description:'Smart stock planning and replenishment to reduce dead inventory and maintain fulfillment clarity.',              icon:'BarChart3' },
  { id:'s5', title:'Store Optimization',  description:'Listing structure, pricing strategy, and merchandising that elevate perceived value.',                          icon:'ShoppingCart' },
  { id:'s6', title:'Order Fulfillment',   description:'Reliable operational execution to keep dispatch speed and customer confidence high.',                           icon:'Truck' },
  { id:'s7', title:'Sales Growth',        description:'Growth-focused tactics that improve conversion, volume, and momentum across key categories.',                   icon:'TrendingUp' },
  { id:'s8', title:'Marketplace Strategy',description:'Multi-layered plans for scale, positioning, and long-term marketplace advantage.',                              icon:'Compass' },
];

export default function Services() {
  const { data, isLoading } = useQuery({ queryKey:['public-services'], queryFn: getServices, retry: 1 });
  const services = (data && data.length > 0) ? data : STATIC;

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <Helmet>
        <title>Services | Uzair Ahmad</title>
        <meta name="description" content="Premium marketplace and e-commerce growth services by Uzair Ahmad." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-700">Services</p>
        <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Premium growth systems for modern marketplaces.</h2>
        <p className="mt-6 text-lg text-neutral-700">Each service is designed to create measurable momentum while preserving premium presentation and operational discipline.</p>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 size={28} className="animate-spin text-amber-700" /></div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = ICON_MAP[service.icon] ?? Compass;
            const accentColor = service.color ?? '#b45309'; // amber-700 equivalent
            return (
              <div key={service.id} className="glass-card p-7 transition hover:-translate-y-2 hover:scale-[1.01]">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor }}
                >
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-500">{service.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
