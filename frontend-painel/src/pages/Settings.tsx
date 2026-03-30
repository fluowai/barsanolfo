import { useState, useEffect } from 'react';
import { Users, Bot, Plus, Trash2, Save, X } from 'lucide-react';
import './Settings.css';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AIConfig {
  id: string;
  provider: string;
  apiKey: string;
  model: string | null;
  isActive: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'team' | 'ai'>('team');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);

  // Form states
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'LAWYER' });
  const [showAIForm, setShowAIForm] = useState(false);
  const [newAIConfig, setNewAIConfig] = useState({ provider: 'GEMINI', apiKey: '', model: '' });

  useEffect(() => {
    if (activeTab === 'team') fetchTeam();
    else fetchAIConfigs();
  }, [activeTab]);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) setTeam(data.users);
    } catch (err) { console.error(err); }
  };

  const fetchAIConfigs = async () => {
    try {
      const res = await fetch('/api/ai-config');
      const data = await res.json();
      if (data.success) setAIConfigs(data.configs);
    } catch (err) { console.error(err); }
  };

  const handleCreateMember = async () => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (data.success) {
        fetchTeam();
        setShowTeamForm(false);
        setNewMember({ name: '', email: '', password: '', role: 'LAWYER' });
      } else {
        alert(data.message);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Remover este membro?')) return;
    await fetch(`/api/team/${id}`, { method: 'DELETE' });
    fetchTeam();
  };

  const handleCreateAIConfig = async () => {
    try {
      const res = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAIConfig)
      });
      const data = await res.json();
      if (data.success) {
        fetchAIConfigs();
        setShowAIForm(false);
        setNewAIConfig({ provider: 'GEMINI', apiKey: '', model: '' });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteAIConfig = async (id: string) => {
    if (!confirm('Remover esta configuração?')) return;
    await fetch(`/api/ai-config/${id}`, { method: 'DELETE' });
    fetchAIConfigs();
  };

  return (
    <div className="page settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Configurações</h1>
        <p className="settings-subtitle">Gerencie sua equipe e integrações de IA</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          <Users size={18} /> Equipe
        </button>
        <button 
          className={`settings-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Bot size={18} /> Configuração de IA
        </button>
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button 
              onClick={() => setShowTeamForm(true)} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Novo Membro
            </button>
          </div>

          {showTeamForm && (
            <div className="settings-form">
              <h3>Adicionar Membro</h3>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Nome</label>
                  <input 
                    placeholder="João Silva" 
                    value={newMember.name} 
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                  />
                </div>
                <div className="settings-form-group">
                  <label>Email</label>
                  <input 
                    placeholder="joao@example.com" 
                    type="email" 
                    value={newMember.email} 
                    onChange={e => setNewMember({ ...newMember, email: e.target.value })} 
                  />
                </div>
                <div className="settings-form-group">
                  <label>Senha</label>
                  <input 
                    placeholder="••••••••" 
                    type="password" 
                    value={newMember.password} 
                    onChange={e => setNewMember({ ...newMember, password: e.target.value })} 
                  />
                </div>
                <div className="settings-form-group">
                  <label>Função</label>
                  <select 
                    value={newMember.role} 
                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="LAWYER">Advogado</option>
                    <option value="SECRETARY">Secretário(a)</option>
                  </select>
                </div>
              </div>
              <div className="settings-form-actions">
                <button onClick={handleCreateMember} className="btn btn-save">
                  <Save size={16} /> Salvar
                </button>
                <button onClick={() => setShowTeamForm(false)} className="btn btn-cancel">
                  <X size={16} /> Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="settings-table-container">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>EMAIL</th>
                  <th>FUNÇÃO</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {team.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{member.email}</td>
                    <td>
                      <span className="badge badge-gold">{member.role}</span>
                    </td>
                    <td>
                      <div className="settings-table-actions">
                        <button 
                          onClick={() => handleDeleteMember(member.id)} 
                          className="settings-table-btn delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {team.length === 0 && (
                  <tr>
                    <td colSpan={4} className="settings-empty">
                      Nenhum membro cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button 
              onClick={() => setShowAIForm(true)} 
              className="btn btn-primary"
            >
              <Plus size={18} /> Nova Configuração
            </button>
          </div>

          {showAIForm && (
            <div className="settings-form">
              <h3>Adicionar Credencial de IA</h3>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Provedor</label>
                  <select 
                    value={newAIConfig.provider} 
                    onChange={e => setNewAIConfig({ ...newAIConfig, provider: e.target.value })}
                  >
                    <option value="GEMINI">Google Gemini</option>
                    <option value="OPENAI">OpenAI</option>
                    <option value="CLAUDE">Anthropic Claude</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>API Key</label>
                  <input 
                    placeholder="sk-..." 
                    value={newAIConfig.apiKey} 
                    onChange={e => setNewAIConfig({ ...newAIConfig, apiKey: e.target.value })} 
                  />
                </div>
                <div className="settings-form-group">
                  <label>Modelo (opcional)</label>
                  <input 
                    placeholder="gpt-4, claude-3, etc..." 
                    value={newAIConfig.model} 
                    onChange={e => setNewAIConfig({ ...newAIConfig, model: e.target.value })} 
                  />
                </div>
              </div>
              <div className="settings-form-actions">
                <button onClick={handleCreateAIConfig} className="btn btn-save">
                  <Save size={16} /> Salvar
                </button>
                <button onClick={() => setShowAIForm(false)} className="btn btn-cancel">
                  <X size={16} /> Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="settings-table-container">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>PROVEDOR</th>
                  <th>API KEY</th>
                  <th>MODELO</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {aiConfigs.map(config => (
                  <tr key={config.id}>
                    <td style={{ fontWeight: 600 }}>{config.provider}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>
                      {config.apiKey.substring(0, 10)}...
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{config.model || '-'}</td>
                    <td>
                      <div className="settings-table-actions">
                        <button 
                          onClick={() => handleDeleteAIConfig(config.id)} 
                          className="settings-table-btn delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {aiConfigs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="settings-empty">
                      Nenhuma configuração de IA
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
