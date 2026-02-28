import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Mail, Phone } from 'lucide-react';
import './Leads.css';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      NEW: { label: 'Novo', color: '#3b82f6' },
      CONTACTED: { label: 'Contactado', color: '#f59e0b' },
      QUALIFIED: { label: 'Qualificado', color: '#8b5cf6' },
      CONVERTED: { label: 'Convertido', color: '#10b981' },
      LOST: { label: 'Perdido', color: '#ef4444' },
    };
    const badge = badges[status] || badges.NEW;
    return (
      <span className="status-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      rescisao: 'Rescisão Indireta',
      horas: 'Horas Extras',
      assedio: 'Assédio Moral',
      outro: 'Outros',
    };
    return types[type] || type;
  };

  if (loading) {
    return <div className="loading">Carregando leads...</div>;
  }

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Leads</h1>
          <p className="page-subtitle">{filteredLeads.length} leads encontrados</p>
        </div>
        <button className="btn-primary">+ Novo Lead</button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={20} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Todos os status</option>
            <option value="NEW">Novos</option>
            <option value="CONTACTED">Contactados</option>
            <option value="QUALIFIED">Qualificados</option>
            <option value="CONVERTED">Convertidos</option>
            <option value="LOST">Perdidos</option>
          </select>
        </div>
      </div>

      <div className="leads-table-container">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Contato</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="lead-name">
                    <strong>{lead.name}</strong>
                  </div>
                </td>
                <td>
                  <div className="lead-contact">
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{lead.email}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="type-badge">{getTypeLabel(lead.type)}</span>
                </td>
                <td>{getStatusBadge(lead.status)}</td>
                <td className="lead-date">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  <button className="btn-icon" title="Ver detalhes">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="empty-state">
            <p>Nenhum lead encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
