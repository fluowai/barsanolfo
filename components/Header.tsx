
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
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md py-6 shadow-2xl' : 'bg-transparent py-12'}`}>
      <div className="container mx-auto px-6 flex justify-between items-start relative">
        {/* Mobile Toggle (Left) */}
        <button className="md:hidden text-white relative z-50 flex items-center gap-2 mt-4" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <>
              <X size={28} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Fechar</span>
            </>
          ) : (
            <Menu size={28} />
          )}
        </button>

        {/* Logo (Center on Mobile, Left on Desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 transition-all mt-2">
          <Logo className="" />
        </div>

        {/* Placeholder/Balancer for Mobile Right Side */}
        <div className="w-7 md:hidden"></div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 mt-14">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium uppercase tracking-widest text-white/80 hover:text-[#d4af37] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contato"
            className="px-6 py-2 gold-bg text-black font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 transition-all transform hover:-translate-y-1"
          >
            Falar agora
          </a>
        </nav>
      </div>

      {/* Mobile Nav */}
      <div className={`fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-2xl font-serif text-white hover:text-[#d4af37]"
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          href="#contato"
          className="mt-4 px-10 py-4 gold-bg text-black font-bold uppercase tracking-widest rounded-sm"
          onClick={() => setIsOpen(false)}
        >
          Agendar Consulta
        </a>
      </div>
    </header>
  );
};

export default Header;
