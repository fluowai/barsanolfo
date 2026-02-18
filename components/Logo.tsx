
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  // Further increased height for mobile (h-20) to be clearly visible and maintain prominence for desktop (h-48)
  const defaultHeight = className.includes('h-') ? '' : 'h-20 md:h-48';
  
  return (
    <div className={`relative flex items-center ${defaultHeight} ${className}`}>
      {/* Subtle neutral glow for the white logo */}
      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-125 pointer-events-none"></div>
      
      <img 
        src="/assets/logo-bm.png.png" 
        alt="Barsanulfo & Martins Logo" 
        className="relative h-full w-auto object-contain transition-all duration-300 brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
      />
    </div>
  );
};

export default Logo;
