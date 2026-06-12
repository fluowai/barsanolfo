import React from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const Hero: React.FC = () => (
  <section id="home" className="relative flex min-h-[92vh] items-end overflow-hidden bg-[#111713] pt-24 text-white">
    <img src="/assets/lume-hero.png" alt="Escritorio contemporaneo Lume e Prado" className="absolute inset-0 h-full w-full object-cover object-center" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,15,.94)_0%,rgba(10,18,15,.74)_38%,rgba(10,18,15,.16)_76%,rgba(10,18,15,.1)_100%)]" />
    <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-14 md:px-10 md:pb-20 lg:grid-cols-[1fr_280px] lg:px-14">
      <div className="max-w-4xl">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c9b889]">Direito empresarial, societário e patrimonial</p>
        <h1 className="max-w-4xl text-[clamp(3rem,7vw,7.2rem)] font-normal leading-[0.9] text-white">Clareza jurídica para decisões que movem negócios.</h1>
        <div className="mt-8 flex flex-col gap-6 border-t border-white/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">Estratégia, prevenção e acompanhamento próximo para empresas, famílias empresárias e novos projetos.</p>
          <a href="#contato" className="inline-flex shrink-0 items-center gap-3 bg-[#c9b889] px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#17211e] transition hover:bg-white">Apresente seu caso <ArrowUpRight size={17} /></a>
        </div>
      </div>
      <div className="hidden self-end border-l border-white/25 pl-8 lg:block">
        <p className="text-5xl font-serif">18</p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55">anos somados de atuação estratégica</p>
        <a href="#escritorio" className="mt-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/70"><ArrowDown size={16} /> Conheça o escritório</a>
      </div>
    </div>
  </section>
);

export default Hero;
