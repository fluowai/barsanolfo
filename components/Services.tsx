
import React from 'react';
import { Gavel, Scale, Briefcase, Users, FileText, ShieldAlert, LucideIcon } from 'lucide-react';
import { SERVICES } from '../constants';

const iconMap: Record<string, LucideIcon> = {
  Gavel, Scale, Briefcase, Users, FileText, ShieldAlert
};

const Services: React.FC = () => {
  return (
    <section id="atuacao" className="py-24 bg-[#121212] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h4 className="text-[#d4af37] font-bold uppercase tracking-[0.2em] text-sm">Áreas de Especialidade</h4>
          <h2 className="text-4xl md:text-5xl font-bold">Soluções Jurídicas Para o <span className="gold-gradient">Trabalhador</span></h2>
          <p className="text-white/60">Atuamos com maestria em todas as vertentes do Direito do Trabalho, protegendo quem move a economy do país.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <div 
                key={service.id} 
                className="group p-10 bg-[#1a1a1a] border border-white/5 hover:border-[#d4af37]/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={120} />
                </div>
                <div className="w-14 h-14 gold-bg rounded-sm flex items-center justify-center text-black mb-8 group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-serif">{service.title}</h3>
                <p className="text-white/60 leading-relaxed mb-6">
                  {service.description}
                </p>
                <a href="#contato" className="text-sm font-bold text-[#d4af37] flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest">
                  Saiba mais <span className="text-xl">→</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
