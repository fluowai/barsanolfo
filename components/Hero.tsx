import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white/80 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
          alt="Escritório Advocacia" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-block px-4 py-1.5 border border-primary-300 text-primary-700 text-xs uppercase tracking-[0.3em] font-semibold rounded-full mb-4 bg-white/50 backdrop-blur-sm">
            Especialistas em Direito do Trabalho
          </div>
          <h1 className="text-3xl md:text-7xl font-bold leading-tight text-slate-900 mb-2">
            Defendemos Seus <br className="hidden md:block" />
            <span className="text-primary-600">Direitos com Força e Estratégia.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed max-w-lg">
            A Woojuris é sua aliada contra injustiças laborais. Combatividade e seriedade para garantir o que é seu por direito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
            <a 
              href="#contato" 
              className="px-6 py-3 sm:px-8 sm:py-4 bg-primary-600 text-white font-semibold uppercase tracking-widest text-sm sm:text-base text-center rounded-md hover:bg-primary-700 transition-all hover:shadow-lg"
            >
              Consultoria Gratuita
            </a>
            <a 
              href="#atuacao" 
              className="px-6 py-3 sm:px-8 sm:py-4 border border-slate-300 text-slate-700 font-semibold uppercase tracking-widest text-sm sm:text-base text-center rounded-md hover:bg-slate-50 transition-all"
            >
              Nossas Áreas
            </a>
          </div>
        </div>

        <div className="hidden md:flex justify-end">
          <div className="relative p-2 border-2 border-primary-200 rounded-lg transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl bg-white">
             <img 
               src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800" 
               alt="Advocacia Premium" 
               className="w-80 h-[480px] object-cover rounded"
             />
             <div className="absolute -bottom-6 -left-6 bg-white p-6 border border-primary-200 shadow-lg rounded-lg">
                <p className="text-primary-700 font-serif text-2xl italic">&ldquo;Justiça é o nosso dever&rdquo;</p>
             </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-slate-400 hidden md:block">
        <ChevronDown size={32} />
      </div>
    </section>
  );
};

export default Hero;
