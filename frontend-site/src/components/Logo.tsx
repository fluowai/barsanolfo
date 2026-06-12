
import React from 'react';

const Logo: React.FC<{ className?: string; imgClassName?: string }> = ({ 
  className = "flex items-center", 
  imgClassName = "h-32 md:h-64 w-auto" 
}) => {
  return (
    <div className={className}>
      <img 
        src="/assets/logo.png" 
        alt="Woojuris Logo" 
        className={`${imgClassName} object-contain`}
      />
    </div>
  );
};

export default Logo;
