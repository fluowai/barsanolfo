
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Visual representation of the logo based on the prompt description */}
      <svg 
        viewBox="0 0 200 200" 
        className="w-12 h-12"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="95" stroke="#d4af37" strokeWidth="2" />
        <path d="M70 140V60L100 90L130 60V140" stroke="#d4af37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 100H140" stroke="#d4af37" strokeWidth="2" opacity="0.5" />
        {/* Scale element representation */}
        <path d="M100 50V70M70 70H130" stroke="#d4af37" strokeWidth="3" />
        <circle cx="70" cy="85" r="8" stroke="#d4af37" strokeWidth="2" />
        <circle cx="130" cy="85" r="8" stroke="#d4af37" strokeWidth="2" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="gold-gradient font-serif text-xl font-bold tracking-wider uppercase">Barsanulfo & Martins</span>
        <span className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-light">Advogados Associados</span>
      </div>
    </div>
  );
};

export default Logo;
