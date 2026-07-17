import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050816]">
      <div className="text-center">
        <div className="mx-auto mb-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-cyan-300" />
        </div>
        <h1 className="text-2xl font-semibold tracking-[0.4em] text-slate-200">UZAIR</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.6em] text-slate-400">Initializing experience</p>
      </div>
    </div>
  );
}
