
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContactForm } from '../hooks/useContactForm';
import { API_BASE_URL, API_ENDPOINTS, PROBLEM_TYPES } from '../constants';
import { ContactFormData } from '../types';

const Contact: React.FC = () => {
  const { formData, errors, isValid, handleChange, validate, reset } = useContactForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CONTACT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        reset();
        // Auto-reset after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setSubmitError(data.message || 'Erro ao enviar formulário. Tente novamente.');
      }
    } catch (error) {
      setSubmitError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
      console.error('Erro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contato" className="py-24 bg-[#121212] relative scroll-mt-64 md:scroll-mt-80">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] p-8 md:p-16 text-center border border-[#d4af37]/30 shadow-2xl rounded-lg">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={80} className="text-[#d4af37]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Mensagem Enviada!</h2>
            <p className="text-white/70 text-base md:text-lg mb-8">
              Agradecemos seu contato. Uma de nossas advogadas entrará em contato em breve para realizar sua triagem.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="gold-bg px-8 py-3 text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all text-xs md:text-sm rounded"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="py-24 bg-[#121212] relative scroll-mt-64 md:scroll-mt-80">
      <div className="container mx-auto px-6">
        <div className="bg-[#1a1a1a] shadow-2xl overflow-hidden border border-white/5 rounded-lg">
          <div className="flex flex-col lg:flex-row">
            {/* Contact Info */}
            <div className="lg:w-2/5 gold-bg p-8 md:p-12 text-black">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 font-serif">Vamos Resolver Seu Caso?</h2>
              <p className="text-black/80 mb-8 md:mb-12 text-base md:text-lg">
                Não deixe seus direitos prescreverem. Entre em contato agora para uma triagem inicial gratuita e sigilosa.
              </p>
              
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Ligue para nós</p>
                    <p className="text-lg md:text-xl font-bold tracking-tighter">(62) 99904-1023</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">E-mail</p>
                    <p className="text-sm md:text-lg font-bold break-all">contato@barsanulfoemartins.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Escritório</p>
                    <p className="text-sm md:text-lg font-bold">Rua 16 A, 1078, Setor Aeroporto, Goiânia - GO</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-black/10">
                <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Siga-nos</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer text-xs font-bold">In</a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer text-xs font-bold">Ig</a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer text-xs font-bold">Fb</a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-3/5 p-8 md:p-12 bg-[#1a1a1a]">
              {submitError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                  <AlertCircle size={20} />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50">Nome Completo *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors rounded`} 
                      placeholder="Ex: João da Silva" 
                    />
                    {errors.name && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50">Telefone / WhatsApp *</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors rounded`} 
                      placeholder="(00) 00000-0000" 
                    />
                    {errors.phone && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Seu E-mail *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors rounded`} 
                    placeholder="email@exemplo.com" 
                  />
                  {errors.email && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Tipo de Problema *</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.type ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors appearance-none text-white/70 rounded`}
                  >
                    {Object.entries(PROBLEM_TYPES).map(([key, val]) => (
                      <option key={key} value={val.code}>{val.label}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Descrição Breve *</label>
                  <textarea 
                    name="message"
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors resize-none rounded`} 
                    placeholder="Conte-nos brevemente o que aconteceu..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-xs uppercase font-bold tracking-widest">{errors.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={!isValid || isSubmitting}
                  className={`w-full p-5 text-black font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl rounded ${(!isValid || isSubmitting) ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'gold-bg hover:brightness-110'}`}
                >
                  {isSubmitting ? (
                    <>Processando... <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <>Enviar Solicitação <Send size={18} /></>
                  )}
                </button>
                <p className="text-xs text-white/30 text-center uppercase tracking-widest">Seus dados estão 100% seguros sob sigilo profissional.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
