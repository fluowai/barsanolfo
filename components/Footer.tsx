
import React from 'react';
import Logo from './Logo';
import { NAV_ITEMS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Logo className="h-16 md:h-24" />
            <p className="text-white/40 text-sm leading-relaxed">
              Escritório especializado em Direito do Trabalho, defendendo os interesses de quem constrói o futuro com as próprias mãos.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Navegação</h4>
            <ul className="space-y-4">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <a href={item.href} className="text-white/40 hover:text-[#d4af37] transition-colors text-sm">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Áreas de Foco</h4>
            <ul className="space-y-4">
              <li><a href="#atuacao" className="text-white/40 hover:text-[#d4af37] transition-colors text-sm">Rescisão Indireta</a></li>
              <li><a href="#atuacao" className="text-white/40 hover:text-[#d4af37] transition-colors text-sm">Horas Extras</a></li>
              <li><a href="#atuacao" className="text-white/40 hover:text-[#d4af37] transition-colors text-sm">Dano Moral</a></li>
              <li><a href="#atuacao" className="text-white/40 hover:text-[#d4af37] transition-colors text-sm">Acidente de Trabalho</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Informações</h4>
            <p className="text-white/40 text-sm mb-4">Goiânia - GO</p>
            <p className="text-white/40 text-sm mb-4">Rua 16 A, 1078, Setor Aeroporto</p>
            <p className="text-[#d4af37] text-sm font-bold">Atendimento: (62) 99904-1023</p>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-[10px] uppercase tracking-widest">
            © 2024 Barsanulfo & Martins Advogados Associados. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 text-white/20 text-[10px] uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
