import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Skills', to: '/skills' },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] px-3 py-3 text-neutral-950 sm:px-5 sm:py-6 lg:px-10">
      <div className="mx-auto min-h-screen max-w-[1500px] overflow-hidden rounded-[2rem] bg-[#fbfaf6] shadow-[0_40px_120px_rgba(0,0,0,0.38)] ring-1 ring-white/40">
        <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fbfaf6]/82 backdrop-blur-2xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            <Link to="/" className="font-serif text-3xl italic tracking-[-0.08em] text-black">
              Uzair.
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              {links.map((item) => {
                const active = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative text-sm font-semibold transition ${active ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
                  >
                    {item.label}
                    {active && <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black" />}
                  </Link>
                );
              })}
            </div>

            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-neutral-800">
              Contact <ArrowUpRight size={16} />
            </Link>
          </nav>

          <div className="flex gap-2 overflow-x-auto px-5 pb-5 md:hidden">
            {links.map((item) => {
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-neutral-600'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}