
import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
          alt="Escritório Advocacia" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-block px-4 py-1 border border-[#d4af37] text-[#d4af37] text-xs uppercase tracking-[0.3em] font-bold rounded-full mb-4">
            Especialistas em Direito do Trabalho
          </div>
          <h1 className="text-3xl md:text-7xl font-bold leading-tight text-white mb-2">
            Defendemos Seus <br className="hidden md:block" />
            <span className="gold-gradient">Direitos com Força e Estratégia.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-lg">
            A Barsanulfo & Martins Advogados Associados é sua aliada contra injustiças laborais. Combatividade e seriedade para garantir o que é seu por direito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
            <a 
              href="#contato" 
              className="px-6 py-3 sm:px-8 sm:py-4 gold-bg text-black font-bold uppercase tracking-widest text-sm sm:text-base text-center transition-transform transform hover:scale-105"
            >
              Consultoria Gratuita
            </a>
            <a 
              href="#atuacao" 
              className="px-6 py-3 sm:px-8 sm:py-4 border border-white/20 text-white font-bold uppercase tracking-widest text-sm sm:text-base text-center hover:bg-white/10 transition-all"
            >
              Nossas Áreas
            </a>
          </div>
        </div>

        {/* Highlight Image Section */}
        <div className="hidden md:flex justify-end">
          <div className="relative p-2 border-2 premium-border transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
             <img 
               src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800" 
               alt="Advocacia Premium" 
               className="w-80 h-[480px] object-cover"
             />
             <div className="absolute -bottom-6 -left-6 bg-[#1a1a1a] p-6 border border-[#d4af37] shadow-xl">
                <p className="text-[#d4af37] font-serif text-2xl italic">"Justiça é o nosso dever"</p>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30 hidden md:block">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;
