import React from 'react';
import { Gavel, Scale, Briefcase, Users, FileText, ShieldAlert, LucideIcon } from 'lucide-react';
import { SERVICES } from '../constants';

const iconMap: Record<string, LucideIcon> = {
  Gavel, Scale, Briefcase, Users, FileText, ShieldAlert
};

const Services: React.FC = () => {
  return (
    <section id="atuacao" className="py-24 bg-white relative overflow-hidden scroll-mt-64 md:scroll-mt-80">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h4 className="text-primary-600 font-semibold uppercase tracking-[0.2em] text-sm">Áreas de Especialidade</h4>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Soluções Jurídicas Para o <span className="text-primary-600">Trabalhador</span></h2>
          <p className="text-slate-500 text-sm md:text-base">Atuamos com maestria em todas as vertentes do Direito do Trabalho, protegendo quem move a economia do país.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <div 
                key={service.id} 
                className="group p-8 md:p-10 bg-slate-50 border border-slate-200 hover:border-primary-300 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden rounded-xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon size={120} />
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-6 md:mb-8 group-hover:scale-110 transition-transform shadow-sm">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4 font-serif text-slate-900">{service.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-6">
                  {service.description}
                </p>
                <a href="#contato" className="text-xs md:text-sm font-semibold text-primary-600 flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest">
                  Saiba mais <span className="text-lg md:text-xl">→</span>
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
