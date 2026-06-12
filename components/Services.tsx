import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SERVICES } from '../constants';

const Services: React.FC = () => (
  <section id="atuacao" className="bg-[#183f35] py-24 text-white md:py-32">
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="section-label text-[#c9b889]">Frentes de atuação</p>
          <p className="mt-8 max-w-xs text-sm leading-7 text-white/55">Assessoria consultiva e contenciosa para momentos de estruturação, crescimento e transição.</p>
        </div>
        <div className="border-t border-white/20">
          {SERVICES.map((service, index) => (
            <a key={service.id} href="#contato" className="group grid gap-4 border-b border-white/20 py-7 transition hover:bg-white/[.04] md:grid-cols-[70px_260px_1fr_30px] md:items-center md:px-4">
              <span className="text-xs text-[#c9b889]">0{index + 1}</span>
              <h3 className="text-2xl font-normal md:text-3xl">{service.title}</h3>
              <p className="max-w-xl text-sm leading-7 text-white/55">{service.description}</p>
              <ArrowUpRight className="transition group-hover:-translate-y-1 group-hover:translate-x-1" size={20} />
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Services;
