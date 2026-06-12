import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => (
  <a href="https://wa.me/551140022844" target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center bg-[#183f35] text-white shadow-xl transition hover:-translate-y-1" aria-label="Falar por WhatsApp">
    <MessageCircle size={24} />
  </a>
);

export default WhatsAppButton;
