
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  // Drastically increased height values to compensate for image padding.
  // Mobile: h-32 (approx 128px)
  // Desktop: h-80 (approx 320px)
  const defaultHeight = className.includes('h-') ? '' : 'h-32 md:h-80';
  
  return (
    <div className={`relative flex items-center justify-center ${defaultHeight} ${className}`}>
      {/* Container for the logo with scaling to zoom in and remove the effect of whitespace padding in the PNG */}
      <img 
        src="/assets/logo-bm.png.png" 
        alt="Barsanulfo & Martins Logo" 
        className="relative h-full w-auto object-contain transition-all duration-300 scale-[1.6] md:scale-[1.8]"
      />
    </div>
  );
};

export default Logo;
