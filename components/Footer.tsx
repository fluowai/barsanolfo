import React from 'react';
import Logo from './Logo';
import { NAV_ITEMS } from '../constants';

const Footer: React.FC = () => (
  <footer className="bg-[#101714] py-14 text-white">
    <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
      <div className="grid gap-12 border-b border-white/15 pb-14 md:grid-cols-[1.3fr_.7fr_.7fr]">
        <div><Logo light /><p className="mt-7 max-w-md text-sm leading-7 text-white/50">Assessoria jurídica estratégica para empresas, empreendedores e famílias empresárias. Todos os nomes e dados deste modelo são fictícios.</p></div>
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c9b889]">Navegação</p><div className="mt-6 flex flex-col gap-3">{NAV_ITEMS.map(item => <a key={item.href} href={item.href} className="text-sm text-white/60 hover:text-white">{item.label}</a>)}</div></div>
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#c9b889]">Contato</p><div className="mt-6 space-y-3 text-sm text-white/60"><p>contato@lumeprado.legal</p><p>(11) 4002-2844</p><p>São Paulo · SP</p></div></div>
      </div>
      <div className="flex flex-col gap-4 pt-7 text-[10px] uppercase tracking-[.14em] text-white/35 sm:flex-row sm:justify-between"><p>© 2026 Lume & Prado · Modelo demonstrativo</p><p>Privacidade · Termos</p></div>
    </div>
  </footer>
);

export default Footer;
