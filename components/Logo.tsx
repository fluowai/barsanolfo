
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const defaultHeight = className.includes('h-') ? '' : 'h-24 md:h-40';
  
  return (
    <div className={`relative flex items-center justify-center ${defaultHeight} ${className}`}>
      {/* Local logo image from public/assets folder */}
      <img 
        src="/assets/logo.png" 
        alt="Barsanulfo & Martins Logo" 
        className="relative h-full w-auto object-contain transition-all duration-300"
      />
    </div>
  );
};

export default Logo;
