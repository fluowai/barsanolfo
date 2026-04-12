import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Smartphone,
  RefreshCw,
  Phone,
  User
} from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import './WhatsApp.css';

interface Instance {
  id: string;
  name: string;
  phone?: string;
  connected: boolean;
  qrCode?: string;
}

interface Message {
  id: string;
  from: string;
  fromName?: string;
  message: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  status?: string;
}

interface Contact {
  id: string;
  phone: string;
  name?: string;
  lastMessage?: string;
}

export default function WhatsApp() {
  const [activeTab, setActiveTab] = useState<'instances' | 'messages' | 'contacts'>('instances');
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const [formData, setFormData] = useState({
    phone: '',
    message: ''
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      fetchMessages(selectedInstance.id);
      fetchContacts(selectedInstance.id);
      setupEventSource(selectedInstance.id);
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [selectedInstance]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api/instances', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setInstances(data.instances);
        if (!selectedInstance && data.instances.length > 0) {
          setSelectedInstance(data.instances[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (instanceId: string) => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/messages`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async (instanceId: string) => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/contacts`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const setupEventSource = (instanceId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const eventSource = new EventSource(`/api/instances/${instanceId}/events?token=${token}`, {
      withCredentials: true
    });

    eventSource.addEventListener('message', (e) => {
      const newMessage = JSON.parse(e.data);
      setMessages(prev => [newMessage, ...prev]);
      setContacts(prev => {
        const existing = prev.find(c => c.phone === newMessage.from);
        if (existing) {
          return prev.map(c => c.phone === newMessage.from ? { ...c, lastMessage: newMessage.message } : c);
        }
        return [{ id: newMessage.from, phone: newMessage.from, name: newMessage.fromName, lastMessage: newMessage.message }, ...prev];
      });
    });

    eventSource.addEventListener('qrcode', (e) => {
      setQrCode(e.data);
      setConnecting(null);
    });

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      setSelectedInstance(prev => prev ? { ...prev, connected: true, phone: data.phone } : null);
      setQrCode(null);
      setConnecting(null);
      fetchInstances();
    });

    eventSource.addEventListener('disconnected', () => {
      setSelectedInstance(prev => prev ? { ...prev, connected: false, qrCode: undefined } : null);
      setQrCode(null);
      fetchInstances();
    });

    eventSourceRef.current = eventSource;
  };

  const handleCreateInstance = async () => {
    const name = prompt('Nome da instância (ex: Escritório, Secundário):');
    if (!name) return;

    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data.success) {
        fetchInstances();
        setSelectedInstance(data.instance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    if (!confirm('Excluir esta instância?')) return;

    try {
      await fetch(`/api/instances/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (selectedInstance?.id === id) {
        setSelectedInstance(null);
      }
      fetchInstances();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (instanceId: string) => {
    setConnecting(instanceId);
    setQrCode(null);
    
    try {
      const res = await fetch(`/api/instances/${instanceId}/connect`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && data.instance?.qrCode) {
        setQrCode(data.instance.qrCode);
      }
    } catch (err) {
      console.error(err);
    }

    // Poll for QR code updates
    const pollInterval = setInterval(async () => {
      if (!connecting) {
        clearInterval(pollInterval);
        return;
      }
      try {
        const res = await fetch(`/api/instances/${instanceId}/status`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success && data.instance?.qrCode) {
          setQrCode(data.instance.qrCode);
          clearInterval(pollInterval);
        }
        if (data.success && data.instance?.connected) {
          setConnecting(null);
          setQrCode(null);
          clearInterval(pollInterval);
          fetchInstances();
        }
      } catch (err) {
        console.error(err);
      }
    }, 1000);

    // Stop polling after 60 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      if (connecting === instanceId) {
        setConnecting(null);
      }
    }, 60000);
  };

  const handleDisconnect = async (instanceId: string) => {
    try {
      await fetch(`/api/instances/${instanceId}/disconnect`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      fetchInstances();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance?.connected || !formData.phone || !formData.message) return;

    setSending(true);
    try {
      const res = await fetch(`/api/instances/${selectedInstance.id}/send`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.phone,
          message: formData.message
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ phone: '', message: '' });
      } else {
        alert(data.error || 'Erro ao enviar mensagem');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({ ...prev, phone: contact.phone }));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    return date.toLocaleDateString('pt-BR');
  };

  const generateQRImage = (qr: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`;
  };

  if (loading) {
    return <div className="page-loading">Carregando...</div>;
  }

  return (
    <div className="page whatsapp-page">
      <div className="page-header">
        <div>
          <h1><MessageSquare size={24} /> WhatsApp</h1>
          <p>Gerencie suas instâncias e mensagens</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'instances' ? 'active' : ''}
          onClick={() => setActiveTab('instances')}
        >
          <Smartphone size={16} /> Instâncias
        </button>
        <button 
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
          disabled={!selectedInstance?.connected}
        >
          <User size={16} /> Contatos
        </button>
        <button 
          className={activeTab === 'messages' ? 'active' : ''}
          onClick={() => setActiveTab('messages')}
          disabled={!selectedInstance?.connected}
        >
          <MessageSquare size={16} /> Mensagens
        </button>
      </div>

      {/* Instances Tab */}
      {activeTab === 'instances' && (
        <div className="instances-section">
          <div className="section-header">
            <h3><Smartphone size={18} /> Instâncias WhatsApp</h3>
            <button className="btn btn-primary" onClick={handleCreateInstance}>
              <Plus size={16} /> Nova Instância
            </button>
          </div>

          {instances.length === 0 ? (
            <div className="empty-state">
              <Smartphone size={48} />
              <p>Nenhuma instância criada</p>
              <button className="btn btn-primary" onClick={handleCreateInstance}>
                Criar primeira instância
              </button>
            </div>
          ) : (
            <div className="instances-grid">
              {instances.map(instance => (
                <div 
                  key={instance.id} 
                  className={`instance-card ${selectedInstance?.id === instance.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInstance(instance)}
                >
                  <div className="instance-header">
                    <div className="instance-info">
                      <Smartphone size={20} />
                      <div>
                        <h4>{instance.name}</h4>
                        {instance.phone && <span className="phone">{instance.phone}</span>}
                      </div>
                    </div>
                    <span className={`status-badge ${instance.connected ? 'connected' : 'disconnected'}`}>
                      {instance.connected ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {instance.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>

                  <div className="instance-actions">
                    {!instance.connected ? (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleConnect(instance.id); }}
                        disabled={connecting === instance.id}
                      >
                        {connecting === instance.id ? (
                          <><RefreshCw size={14} className="spin" /> Conectando...</>
                        ) : (
                          <><Phone size={14} /> Conectar</>
                        )}
                      </button>
                    ) : (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleDisconnect(instance.id); }}
                      >
                        <XCircle size={14} /> Desconectar
                      </button>
                    )}
                    <button 
                      className="btn-icon danger"
                      onClick={(e) => { e.stopPropagation(); handleDeleteInstance(instance.id); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* QR Code Modal */}
          {connecting && (
            <div className="modal-overlay">
              <div className="modal qr-modal">
                <h3>Escaneie o QR Code</h3>
                <p>Abra o WhatsApp no seu celular e escaneie o código:</p>
                {qrCode ? (
                  <img src={generateQRImage(qrCode)} alt="QR Code" className="qr-image" />
                ) : (
                  <div className="qr-loading">
                    <RefreshCw size={32} className="spin" />
                    <p>Gerando QR Code...</p>
                  </div>
                )}
                <button 
                  className="btn btn-outline"
                  onClick={() => { setConnecting(null); setQrCode(null); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && selectedInstance && (
        <div className="contacts-section">
          <h3><User size={18} /> Contatos</h3>
          {contacts.length === 0 ? (
            <div className="empty-state">
              <User size={48} />
              <p>Nenhum contato ainda</p>
              <p className="hint">Contatos aparecerão quando receberem mensagens</p>
            </div>
          ) : (
            <div className="contacts-list">
              {contacts.map(contact => (
                <div 
                  key={contact.id} 
                  className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="contact-avatar">
                    <User size={20} />
                  </div>
                  <div className="contact-info">
                    <h4>{contact.name || contact.phone}</h4>
                    {contact.lastMessage && <p>{contact.lastMessage}</p>}
                  </div>
                  <Phone size={14} className="contact-phone" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && selectedInstance && (
        <div className="messages-section-full">
          <div className="send-message-panel">
            <h3><Send size={18} /> Enviar Mensagem</h3>
            <form onSubmit={handleSend}>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Telefone</label>
                  <input
                    type="text"
                    placeholder="62999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mensagem</label>
                <textarea
                  placeholder="Digite sua mensagem..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={sending || !selectedInstance.connected}
              >
                <Send size={16} /> {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
            
            {!selectedInstance.connected && (
              <div className="warning-message">
                Conecte o WhatsApp para enviar mensagens
              </div>
            )}
          </div>

          <div className="messages-history">
            <h3><MessageSquare size={18} /> Histórico de Mensagens</h3>
            {messages.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>Nenhuma mensagem</p>
              </div>
            ) : (
              <div className="messages-list-full">
                {messages.map((msg, index) => {
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="date-separator">
                          <span>{formatDate(msg.timestamp)}</span>
                        </div>
                      )}
                      <div className={`message-bubble ${msg.direction}`}>
                        <div className="message-header">
                          <span className="sender">{msg.direction === 'incoming' ? msg.fromName || msg.from : 'Você'}</span>
                          <span className="time">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="message-text">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* No instance selected */}
      {!selectedInstance && activeTab !== 'instances' && (
        <div className="empty-state">
          <Smartphone size={48} />
          <p>Selecione uma instância</p>
        </div>
      )}
    </div>
  );
}
