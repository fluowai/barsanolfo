import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import { NAV_ITEMS } from '../constants';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors ${scrolled || open ? 'bg-[#f3f1eb]/95 text-[#17211e] shadow-sm backdrop-blur' : 'bg-transparent text-white'}`}>
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14">
        <Logo light={!scrolled && !open} />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80 transition hover:opacity-100">
              {item.label}
            </a>
          ))}
          <a href="#contato" className={`inline-flex items-center gap-2 border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${scrolled ? 'border-[#183f35] hover:bg-[#183f35] hover:text-white' : 'border-white/55 hover:bg-white hover:text-[#17211e]'}`}>
            Conversar <ArrowUpRight size={15} />
          </a>
        </nav>
        <button onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center lg:hidden" aria-label="Abrir menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-black/10 bg-[#f3f1eb] px-5 py-8 lg:hidden">
          <div className="flex flex-col gap-6">
            {NAV_ITEMS.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-2xl font-serif">{item.label}</a>)}
            <a href="#contato" onClick={() => setOpen(false)} className="mt-2 bg-[#183f35] px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white">Agendar conversa</a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
