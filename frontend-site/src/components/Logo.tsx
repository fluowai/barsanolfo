
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-48 md:h-[400px] w-auto" }) => {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <img 
        src="/assets/logo.png" 
        alt="Barsanulfo & Martins Logo" 
        className="h-48 md:h-[500px] w-auto object-contain"
      />
      <div className="flex flex-col leading-none">
        <span className="gold-gradient font-serif text-3xl md:text-5xl font-bold tracking-wider uppercase">Barsanulfo & Martins</span>
        <span className="text-sm md:text-xl text-white/70 uppercase tracking-[0.2em] font-light">Advogados Associados</span>
      </div>
    </div>
  );
};

export default Logo;
