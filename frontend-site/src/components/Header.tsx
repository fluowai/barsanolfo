
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
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-8'}`}>
      <div className="container mx-auto px-6 flex justify-between items-start">
        <Logo className="origin-left mt-2" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 mt-12">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium uppercase tracking-widest text-gray-700 hover:text-[#b8860b] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contato"
            className="px-6 py-2 gold-bg text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 transition-all transform hover:-translate-y-1"
          >
            Falar agora
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div className={`fixed inset-0 bg-white/95 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-2xl font-serif text-gray-900 hover:text-[#b8860b]"
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          href="#contato"
          className="mt-4 px-10 py-4 gold-bg text-white font-bold uppercase tracking-widest rounded-sm"
          onClick={() => setIsOpen(false)}
        >
          Agendar Consulta
        </a>
      </div>
    </header>
  );
};

export default Header;
