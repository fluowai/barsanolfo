import React from 'react';

const Logo: React.FC<{ className?: string; light?: boolean }> = ({ className = '', light = false }) => (
  <a href="#home" className={`inline-flex items-center gap-3 ${className}`} aria-label="Lume e Prado - inicio">
    <span className={`grid h-10 w-10 place-items-center border text-sm font-semibold ${light ? 'border-white/45 text-white' : 'border-[#183f35] text-[#183f35]'}`}>
      LP
    </span>
    <span className="flex flex-col leading-none">
      <strong className={`text-[15px] uppercase tracking-[0.18em] ${light ? 'text-white' : 'text-[#17211e]'}`}>Lume & Prado</strong>
      <span className={`mt-1 text-[9px] uppercase tracking-[0.28em] ${light ? 'text-white/60' : 'text-[#66716d]'}`}>Advocacia estratégica</span>
    </span>
  </a>
);

export default Logo;
