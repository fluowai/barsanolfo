
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-32 md:h-64 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/assets/logo.png" 
        alt="Barsanulfo & Martins Logo" 
        className="h-32 md:h-64 w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
