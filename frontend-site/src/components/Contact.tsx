
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
      const response = await fetch('/api/contact', {
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
      <section id="contato" className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white p-16 text-center border border-[#d4af37]/30 shadow-xl">
            <div className="flex justify-center mb-6">
              <CheckCircle2 size={80} className="text-[#b8860b]" />
            </div>
            <h2 className="text-4xl font-bold mb-4 font-serif text-gray-900">Mensagem Enviada!</h2>
            <p className="text-gray-600 text-lg mb-8">
              Agradecemos seu contato. Uma de nossas advogadas entrará em contato em breve para realizar sua triagem.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="gold-bg px-8 py-3 text-white font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contato" className="py-24 bg-gray-50 relative">
      <div className="container mx-auto px-6">
        <div className="bg-white shadow-xl overflow-hidden border border-gray-200">
          <div className="flex flex-col lg:flex-row">
            {/* Contact Info */}
            <div className="lg:w-2/5 gold-bg p-12 text-white">
              <h2 className="text-4xl font-bold mb-8 font-serif">Vamos Resolver Seu Caso?</h2>
              <p className="text-white/80 mb-12 text-lg">
                Não deixe seus direitos prescreverem. Entre em contato agora para uma triagem inicial gratuita e sigilosa.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Ligue para nós</p>
                    <p className="text-xl font-bold tracking-tighter">(11) 98765-4321</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">E-mail</p>
                    <p className="text-xl font-bold break-all">contato@bmadvogados.com.br</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest opacity-60">Escritório</p>
                    <p className="text-lg font-bold">Av. Paulista, 1000 - São Paulo/SP</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-12 border-t border-white/20">
                <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Siga-nos</h4>
                <div className="flex gap-4">
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all cursor-pointer">In</div>
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all cursor-pointer">Ig</div>
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-gray-900 transition-all cursor-pointer">Fb</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-3/5 p-12 bg-white">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Nome Completo</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} p-4 focus:border-[#b8860b] outline-none transition-colors text-gray-900`} 
                      placeholder="Ex: João da Silva" 
                    />
                    {errors.name && <p className="text-red-600 text-[10px] uppercase font-bold tracking-widest">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} p-4 focus:border-[#b8860b] outline-none transition-colors text-gray-900`} 
                      placeholder="(00) 00000-0000" 
                    />
                    {errors.phone && <p className="text-red-600 text-[10px] uppercase font-bold tracking-widest">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Seu E-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-4 focus:border-[#b8860b] outline-none transition-colors text-gray-900`} 
                    placeholder="email@exemplo.com" 
                  />
                  {errors.email && <p className="text-red-600 text-[10px] uppercase font-bold tracking-widest">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Tipo de Problema</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.type ? 'border-red-500' : 'border-gray-300'} p-4 focus:border-[#b8860b] outline-none transition-colors appearance-none text-gray-700`}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="rescisao">Rescisão Indireta</option>
                    <option value="horas">Horas Extras</option>
                    <option value="assedio">Assédio Moral</option>
                    <option value="outro">Outros Direitos</option>
                  </select>
                  {errors.type && <p className="text-red-600 text-[10px] uppercase font-bold tracking-widest">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500">Descrição Breve</label>
                  <textarea 
                    name="message"
                    rows={4} 
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-gray-50 border ${errors.message ? 'border-red-500' : 'border-gray-300'} p-4 focus:border-[#b8860b] outline-none transition-colors resize-none text-gray-900`} 
                    placeholder="Conte-nos brevemente o que aconteceu..."
                  ></textarea>
                  {errors.message && <p className="text-red-600 text-[10px] uppercase font-bold tracking-widest">{errors.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full p-5 text-white font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl ${(!isFormValid || isSubmitting) ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'gold-bg hover:brightness-110'}`}
                >
                  {isSubmitting ? (
                    <>Processando... <Loader2 className="animate-spin" size={18} /></>
                  ) : (
                    <>Enviar Solicitação <Send size={18} /></>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">Seus dados estão 100% seguros sob sigilo profissional.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
