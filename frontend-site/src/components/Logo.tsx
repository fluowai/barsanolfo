
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-20 w-auto" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/assets/logo.png" 
        alt="Barsanulfo & Martins Logo" 
        className="h-20 w-auto object-contain"
      />
      <div className="flex flex-col leading-none">
        <span className="gold-gradient font-serif text-xl font-bold tracking-wider uppercase">Barsanulfo & Martins</span>
        <span className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-light">Advogados Associados</span>
      </div>
    </div>
  );
};

export default Logo;
