
import React, { useEffect, useRef, useState } from 'react';
import { TEAM } from '../constants';

const Team: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger staggered animation for cards
            TEAM.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index]);
              }, index * 200);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="equipe" 
      className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#d4af37]/3 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[2px] bg-gradient-to-r from-[#d4af37] to-transparent" />
              <h4 className="text-[#d4af37] font-bold uppercase tracking-[0.3em] text-xs">
                Nossa Equipe
              </h4>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Corpo Jurídico de{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#d4af37] via-[#f4e4a3] to-[#d4af37] bg-clip-text text-transparent">
                  Elite
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-[#d4af37] via-[#f4e4a3] to-[#d4af37] rounded-full" />
              </span>
            </h2>
          </div>
          <p className="text-white/50 max-w-sm text-base leading-relaxed md:text-right">
            Combinamos <span className="text-white/80 font-medium">inteligência jurídica</span> com um 
            olhar humanizado sobre as relações de trabalho.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {TEAM.map((member, index) => (
            <div 
              key={index} 
              className={`
                group relative flex flex-col lg:flex-row rounded-2xl overflow-hidden
                bg-gradient-to-br from-[#1a1a1a] to-[#141414]
                border border-white/[0.06] hover:border-[#d4af37]/30
                shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                hover:shadow-[0_16px_48px_rgba(212,175,55,0.15)]
                transition-all duration-500 ease-out
                transform ${visibleCards.includes(index) ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>

              {/* Image Container */}
              <div className="lg:w-[45%] relative overflow-hidden">
                <div className="aspect-[3/4] lg:aspect-auto lg:h-full relative">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 
                      transition-all duration-700 ease-out group-hover:scale-105" 
                  />
                  {/* Image overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#1a1a1a]" />
                </div>
              </div>

              {/* Content Container */}
              <div className="lg:w-[55%] p-6 lg:p-8 flex flex-col justify-center space-y-5 relative z-10">
                {/* Name & Role */}
                <div className="space-y-2">
                  <h3 className="text-xl lg:text-2xl font-bold font-serif text-white group-hover:text-white transition-colors">
                    {member.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold
                      bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                      {member.role.split(' | ')[0]}
                    </span>
                    {member.role.includes('|') && (
                      <span className="text-white/40 text-xs font-mono">
                        {member.role.split(' | ')[1]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/60 transition-colors">
                  {member.bio}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <a 
                    href="#" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                      bg-white/[0.03] hover:bg-[#d4af37]/10
                      border border-white/[0.06] hover:border-[#d4af37]/30
                      text-white/50 hover:text-[#d4af37]
                      transition-all duration-300 group/btn"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest font-bold">Currículo</span>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                      bg-white/[0.03] hover:bg-[#0077B5]/10
                      border border-white/[0.06] hover:border-[#0077B5]/30
                      text-white/50 hover:text-[#0077B5]
                      transition-all duration-300 group/btn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest font-bold">LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[200%] h-[200%] 
                  bg-gradient-to-bl from-[#d4af37]/10 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  transform rotate-45 translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom decorative line */}
        <div className="flex justify-center mt-16">
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Team;
