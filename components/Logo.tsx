
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const defaultHeight = className.includes('h-') ? '' : 'h-16 md:h-24';
  
  return (
    <div className={`relative flex items-center justify-center ${defaultHeight} ${className}`}>
      {/* Container for the logo with scaling to zoom in and remove the effect of whitespace padding in the PNG */}
      <img 
        src="/assets/logo-bm-novo.png" 
        alt="Barsanulfo & Martins Logo" 
        className="relative h-full w-auto object-contain transition-all duration-300"
      />
    </div>
  );
};

export default Logo;
