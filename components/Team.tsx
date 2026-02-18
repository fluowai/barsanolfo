
import React from 'react';
import { TEAM } from '../constants';

const Team: React.FC = () => {
  return (
    <section id="equipe" className="py-24 bg-[#0d0d0d] overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header Section com animação */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl space-y-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="w-12 h-[2px] bg-gradient-to-r from-[#d4af37] to-transparent"></span>
              <h4 className="text-[#d4af37] font-bold uppercase tracking-[0.3em] text-xs">Os Profissionais</h4>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white">
              Barsanulfo & Martins <br /><span className="text-[#d4af37]">Advogados Associados</span>
            </h2>
          </div>
          <p className="text-white/50 max-w-sm text-sm leading-relaxed animate-fade-in-up animation-delay-200 border-l-2 border-[#d4af37]/30 pl-4">
            Combinamos inteligência jurídica com um olhar humanizado sobre as relações de trabalho.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {TEAM.map((member, index) => (
            <div 
              key={index} 
              className="team-card group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Glowing border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/60 group-hover:via-[#f1c40f]/40 group-hover:to-[#d4af37]/60 rounded-lg transition-all duration-500 opacity-0 group-hover:opacity-100 blur-[1px]"></div>
              
              {/* Card Content */}
              <div className="relative flex flex-col md:flex-row bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 group-hover:border-[#d4af37]/30 rounded-lg overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#d4af37]/10 group-hover:-translate-y-1">
                
                {/* Image Section */}
                <div className="md:w-1/2 relative overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-96 md:h-full object-cover object-top transition-all duration-700 group-hover:scale-105" 
                  />
                  {/* Overlay with social icons on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
                    <div className="flex gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#d4af37] transition-all duration-300 hover:scale-110">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#d4af37] transition-all duration-300 hover:scale-110">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="md:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-[#d4af37]/20 to-[#f1c40f]/10 text-[#d4af37] rounded-full border border-[#d4af37]/30">
                      {member.role.split('|')[0]?.trim()}
                    </span>
                  </div>
                  
                  {/* Name & Role */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-xl lg:text-2xl font-bold font-serif leading-tight group-hover:text-[#f8f8f8] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[#d4af37]/80 text-xs uppercase tracking-widest font-medium flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {member.role.split('|')[1]?.trim() || member.role}
                    </p>
                  </div>
                  
                  {/* Bio with quote styling */}
                  <div className="relative mb-6">
                    <span className="absolute -left-2 -top-2 text-4xl text-[#d4af37]/20 font-serif">"</span>
                    <p className="text-white/50 text-sm leading-relaxed pl-4 border-l border-white/10 group-hover:border-[#d4af37]/30 transition-colors">
                      {member.bio}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white bg-white/5 hover:bg-[#d4af37] rounded transition-all duration-300 group/btn">
                      <svg className="w-3 h-3 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Currículo
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white bg-white/5 hover:bg-[#0077b5] rounded transition-all duration-300 group/btn">
                      <svg className="w-3 h-3 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
