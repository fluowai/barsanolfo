import React from 'react';

interface LogoProps {
  className?: string;
  imgClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center", 
  imgClassName = "h-12 w-auto" 
}) => {
  return (
    <div className={className}>
      <img 
        src="/assets/logo.png" 
        alt="Barsanulfo & Martins Logo" 
        className={`${imgClassName} object-contain`}
      />
    </div>
  );
};

export default Logo;
