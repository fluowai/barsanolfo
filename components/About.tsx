
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="escritorio" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-2 gap-4">
             <img src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800" alt="Livros de Direito" className="rounded-sm shadow-xl" />
             <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800" alt="Assinatura" className="rounded-sm shadow-xl mt-8" />
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[#d4af37] font-bold uppercase tracking-[0.2em] text-sm">O Escritório</h4>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">Barsanulfo & Martins <br /><span className="text-white/50">Advogados Associados</span></h2>
            <div className="w-20 h-1 gold-bg mb-8"></div>
            
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Nascemos com a missão de humanizar o atendimento jurídico e trazer resultados efetivos para o trabalhador. Em um mercado muitas vezes frio e burocrático, escolhemos a proximidade e a combatividade.
            </p>
            <p className="text-white/70 text-base md:text-lg leading-relaxed">
              Nossa sede é focada em oferecer uma infraestrutura moderna e um atendimento acolhedor, garantindo que cada cliente se sinta protegido desde o primeiro contato até a resolução final da sua causa.
            </p>
            
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-6">
              <div>
                <h5 className="text-2xl md:text-3xl font-bold gold-gradient font-serif">15+</h5>
                <p className="text-[10px] md:text-xs uppercase text-white/50 tracking-widest mt-2 whitespace-nowrap">Anos de Exp.</p>
              </div>
              <div>
                <h5 className="text-2xl md:text-3xl font-bold gold-gradient font-serif">2k+</h5>
                <p className="text-[10px] md:text-xs uppercase text-white/50 tracking-widest mt-2 whitespace-nowrap">Causas Ganhas</p>
              </div>
              <div>
                <h5 className="text-2xl md:text-3xl font-bold gold-gradient font-serif">100%</h5>
                <p className="text-[10px] md:text-xs uppercase text-white/50 tracking-widest mt-2 whitespace-nowrap">Foco Cliente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
