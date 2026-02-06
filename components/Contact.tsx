
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    type: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (value.trim().length < 3) error = 'O nome deve ter pelo menos 3 caracteres.';
        break;
      case 'email':
        if (!emailRegex.test(value)) error = 'Informe um e-mail válido.';
        break;
      case 'phone':
        if (!phoneRegex.test(value)) error = 'Informe um telefone válido (Ex: 11 98888-7777).';
        break;
      case 'type':
        if (!value) error = 'Selecione o tipo de problema.';
        break;
      case 'message':
        if (value.trim().length < 10) error = 'Por favor, descreva seu caso com mais detalhes.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== '');
    const isComplete = Object.values(formData).every(value => value !== '');
    setIsFormValid(!hasErrors && isComplete);
  }, [errors, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Formulário enviado com sucesso!', data);
        setIsSubmitted(true);
        setFormData({ name: '', phone: '', email: '', type: '', message: '' });
      } else {
        console.error('❌ Erro na resposta:', data);
        alert(data.message || 'Erro ao enviar formulário. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contato" className="py-24 bg-[#121212] relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-[#1a1a1a] p-16 text-center border border-[#d4af37]/30 shadow-2xl">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={80} className="text-[#d4af37]" />
            </div>
            <h2 className="text-4xl font-bold mb-4 font-serif">Mensagem Enviada!</h2>
            <p className="text-white/70 text-lg mb-8">
              Agradecemos seu contato. Uma de nossas advogadas entrará em contato em breve para realizar sua triagem.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="gold-bg px-8 py-3 text-black font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="py-24 bg-[#121212] relative">
      <div className="container mx-auto px-6">
        <div className="bg-[#1a1a1a] shadow-2xl overflow-hidden border border-white/5">
          <div className="flex flex-col lg:flex-row">
            {/* Contact Info */}
            <div className="lg:w-2/5 bg-gradient-to-br from-[#c9a227] to-[#a8861a] p-12 text-black">
              <h2 className="text-4xl font-bold mb-8 font-serif">Vamos Resolver Seu Caso?</h2>
              <p className="text-black/80 mb-12 text-lg">
                Não deixe seus direitos prescreverem. Entre em contato agora para uma triagem inicial gratuita e sigilosa.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Ligue para nós</p>
                    <p className="text-xl font-bold tracking-tighter">(62) 99904-1023</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">E-mail</p>
                    <p className="text-xl font-bold break-all">contato@barsanulfoemartins.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Escritório</p>
                    <p className="text-lg font-bold">Rua 16-A, 1078, Setor Aeroporto - Goiânia/GO</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-12 border-t border-black/10">
                <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Siga-nos</h4>
                <div className="flex gap-4">
                  <a href="https://wa.me/5562999041023" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform shadow-lg cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                  <a href="https://instagram.com/barsanulfoemartins" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform shadow-lg cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-3/5 p-12 bg-[#1a1a1a]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50">Nome Completo</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors`} 
                      placeholder="Ex: João da Silva" 
                    />
                    {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors`} 
                      placeholder="(00) 00000-0000" 
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Seu E-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors`} 
                    placeholder="email@exemplo.com" 
                  />
                  {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Tipo de Problema</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full bg-[#2a2a2a] border ${errors.type ? 'border-red-500/50' : 'border-white/20'} p-4 focus:border-[#d4af37] outline-none transition-colors appearance-none text-white cursor-pointer`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '20px' }}
                  >
                    <option value="" className="bg-[#1a1a1a] text-white">Selecione uma opção</option>
                    <option value="rescisao" className="bg-[#1a1a1a] text-white">Rescisão Indireta</option>
                    <option value="horas" className="bg-[#1a1a1a] text-white">Horas Extras</option>
                    <option value="assedio" className="bg-[#1a1a1a] text-white">Assédio Moral</option>
                    <option value="outro" className="bg-[#1a1a1a] text-white">Outros Direitos</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-white/50">Descrição Breve</label>
                  <textarea 
                    name="message"
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} p-4 focus:border-[#d4af37] outline-none transition-colors resize-none`} 
                    placeholder="Conte-nos brevemente o que aconteceu..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest">{errors.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full p-5 text-black font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${(!isFormValid || isSubmitting) ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'gold-bg hover:brightness-110'}`}
                >
                  {isSubmitting ? (
                    <>Processando... <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <>Enviar Solicitação <Send size={18} /></>
                  )}
                </button>
                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">Seus dados estão 100% seguros sob sigilo profissional.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
