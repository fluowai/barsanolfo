import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-start relative">
        <button className="md:hidden text-slate-800 relative z-50 flex items-center gap-2 mt-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <>
              <X size={28} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Fechar</span>
            </>
          ) : (
            <Menu size={28} />
          )}
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 transition-all mt-1">
          <Logo className="" />
        </div>

        <div className="w-7 md:hidden"></div>

        <nav className="hidden md:flex items-center gap-8 mt-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium uppercase tracking-widest text-slate-600 hover:text-primary-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contato"
            className="px-6 py-2.5 bg-primary-600 text-white font-semibold text-xs uppercase tracking-widest rounded-md hover:bg-primary-700 transition-all hover:-translate-y-0.5 shadow-sm"
          >
            Falar agora
          </a>
        </nav>
      </div>

      <div className={`fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-2xl font-serif text-slate-800 hover:text-primary-600"
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          href="#contato"
          className="mt-4 px-10 py-4 bg-primary-600 text-white font-bold uppercase tracking-widest rounded-md"
          onClick={() => setIsOpen(false)}
        >
          Agendar Consulta
        </a>
      </div>
    </header>
  );
};

export default Header;
