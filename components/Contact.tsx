import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONTACT}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.get('name'), email: form.get('email'), phone: form.get('phone'), type: form.get('type'), message: form.get('message') }),
      });
      if (response.ok) setSent(true);
    } finally { setLoading(false); }
  };

  return (
    <section id="contato" className="bg-[#c9b889] py-24 md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 md:px-10 lg:grid-cols-[.9fr_1.1fr] lg:px-14">
        <div>
          <p className="section-label">Primeira conversa</p>
          <h2 className="mt-8 max-w-xl text-[clamp(2.7rem,5vw,5.5rem)] leading-[.95]">Toda boa estratégia começa com uma pergunta bem feita.</h2>
          <div className="mt-12 grid gap-5 text-sm sm:grid-cols-2">
            <div><p className="text-xs uppercase tracking-[.16em] opacity-60">E-mail</p><p className="mt-2 font-semibold">contato@lumeprado.legal</p></div>
            <div><p className="text-xs uppercase tracking-[.16em] opacity-60">Telefone</p><p className="mt-2 font-semibold">(11) 4002-2844</p></div>
            <div><p className="text-xs uppercase tracking-[.16em] opacity-60">Endereço</p><p className="mt-2 font-semibold">Alameda Horizonte, 180 · São Paulo</p></div>
            <div><p className="text-xs uppercase tracking-[.16em] opacity-60">Atendimento</p><p className="mt-2 font-semibold">Brasil e exterior</p></div>
          </div>
        </div>
        <div className="bg-[#f3f1eb] p-6 md:p-10">
          {sent ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><CheckCircle2 size={48} className="text-[#183f35]" /><h3 className="mt-6 text-3xl">Mensagem recebida.</h3><p className="mt-3 max-w-sm text-sm leading-7 text-[#68716d]">Nossa equipe retornará em até um dia útil.</p></div>
          ) : (
            <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
              <label className="field"><span>Nome</span><input name="name" required /></label>
              <label className="field"><span>Telefone</span><input name="phone" required /></label>
              <label className="field sm:col-span-2"><span>E-mail</span><input type="email" name="email" required /></label>
              <label className="field sm:col-span-2"><span>Assunto</span><select name="type"><option value="empresarial">Direito empresarial</option><option value="societario">Societário e M&A</option><option value="patrimonial">Patrimônio e sucessão</option><option value="contratos">Contratos</option></select></label>
              <label className="field sm:col-span-2"><span>Como podemos ajudar?</span><textarea name="message" rows={4} required /></label>
              <button disabled={loading} className="sm:col-span-2 inline-flex items-center justify-between bg-[#183f35] px-6 py-5 text-xs font-bold uppercase tracking-[.15em] text-white disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar mensagem'} <ArrowRight size={18} /></button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
