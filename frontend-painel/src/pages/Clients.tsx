import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  FileText,
  Calendar
} from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import './Clients.css';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  address?: string;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  rg?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  cases: any[];
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDetail | null>(null);
  const [viewingClient, setViewingClient] = useState<ClientDetail | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredClients(clients.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      (c.cpf && c.cpf.includes(term))
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
    const method = editingClient ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        fetchClients();
        resetForm();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client as any);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpf: client.cpf || '',
      rg: '',
      address: client.address || '',
      notes: ''
    });
    setShowForm(true);
  };

  const handleView = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setViewingClient(data.client);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      await fetch(`/api/clients/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeaders() 
      });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', cpf: '', rg: '', address: '', notes: '' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="page-loading">Carregando...</div>;
  }

  return (
    <div className="page clients-page">
      <div className="page-header">
        <div>
          <h1>Clientes</h1>
          <p>{clients.length} clientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por nome, email, CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="btn-close" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Av. T-7, 500, Setor Bueno, Goiânia/GO"
                />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Modal */}
      {viewingClient && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{viewingClient.name}</h2>
              <button className="btn-close" onClick={() => setViewingClient(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="client-detail-grid">
                <div className="detail-card">
                  <h3><Mail size={16} /> Contato</h3>
                  <p><strong>Email:</strong> {viewingClient.email}</p>
                  <p><strong>Telefone:</strong> {viewingClient.phone}</p>
                  {viewingClient.address && (
                    <p><strong>Endereço:</strong> {viewingClient.address}</p>
                  )}
                </div>
                <div className="detail-card">
                  <h3><FileText size={16} /> Documentos</h3>
                  <p><strong>CPF:</strong> {viewingClient.cpf || 'Não informado'}</p>
                  <p><strong>RG:</strong> {viewingClient.rg || 'Não informado'}</p>
                </div>
                <div className="detail-card">
                  <h3><Calendar size={16} /> Informações</h3>
                  <p><strong>Cadastro:</strong> {formatDate(viewingClient.createdAt)}</p>
                </div>
              </div>
              {viewingClient.notes && (
                <div className="detail-card full-width">
                  <h3><FileText size={16} /> Observações</h3>
                  <p>{viewingClient.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="clients-list">
        {filteredClients.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Nenhum cliente encontrado</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Cadastrar Primeiro Cliente
            </button>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-avatar">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="client-info">
                <h3>{client.name}</h3>
                <div className="client-meta">
                  <span><Mail size={14} /> {client.email}</span>
                  <span><Phone size={14} /> {client.phone}</span>
                  {client.cpf && <span><FileText size={14} /> {client.cpf}</span>}
                </div>
              </div>
              <div className="client-actions">
                <button className="btn-icon" onClick={() => handleView(client.id)} title="Ver detalhes">
                  <Eye size={18} />
                </button>
                <button className="btn-icon" onClick={() => handleEdit(client)} title="Editar">
                  <Edit size={18} />
                </button>
                <button className="btn-icon danger" onClick={() => handleDelete(client.id)} title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
