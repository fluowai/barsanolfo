import { useState, useEffect } from 'react';
import { Users, Bot, Plus, Trash2, Save, X } from 'lucide-react';

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

  const tabStyle = (tab: string) => ({
    padding: '12px 24px',
    background: activeTab === tab ? 'var(--gold)' : 'transparent',
    color: activeTab === tab ? 'var(--black)' : 'var(--text-muted)',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="page">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '10px' }}>Configurações</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gerencie sua equipe e integrações de IA.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('team')} style={tabStyle('team')}>
          <Users size={18} /> Equipe
        </button>
        <button onClick={() => setActiveTab('ai')} style={tabStyle('ai')}>
          <Bot size={18} /> Configuração de IA
        </button>
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={() => setShowTeamForm(true)} style={{ background: 'var(--gold)', color: 'var(--black)', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo Membro
            </button>
          </div>

          {showTeamForm && (
            <div style={{ background: 'var(--darker)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '15px' }}>Adicionar Membro</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input placeholder="Nome" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <input placeholder="Email" type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <input placeholder="Senha" type="password" value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}>
                  <option value="ADMIN">Administrador</option>
                  <option value="LAWYER">Advogado</option>
                  <option value="SECRETARY">Secretário(a)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={handleCreateMember} style={{ background: 'var(--gold)', color: 'var(--black)', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}><Save size={16} /> Salvar</button>
                <button onClick={() => setShowTeamForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}><X size={16} /> Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ background: 'var(--darker)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>NOME</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>EMAIL</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>FUNÇÃO</th>
                  <th style={{ padding: '15px 20px', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {team.map(member => (
                  <tr key={member.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px', color: 'var(--text)' }}>{member.name}</td>
                    <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>{member.email}</td>
                    <td style={{ padding: '15px 20px' }}><span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)' }}>{member.role}</span></td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteMember(member.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {team.length === 0 && <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum membro cadastrado.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={() => setShowAIForm(true)} style={{ background: 'var(--gold)', color: 'var(--black)', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Nova Configuração
            </button>
          </div>

          {showAIForm && (
            <div style={{ background: 'var(--darker)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '15px' }}>Adicionar Credencial de IA</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <select value={newAIConfig.provider} onChange={e => setNewAIConfig({ ...newAIConfig, provider: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }}>
                  <option value="GEMINI">Google Gemini</option>
                  <option value="OPENAI">OpenAI</option>
                  <option value="CLAUDE">Anthropic Claude</option>
                </select>
                <input placeholder="API Key" value={newAIConfig.apiKey} onChange={e => setNewAIConfig({ ...newAIConfig, apiKey: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
                <input placeholder="Modelo (opcional)" value={newAIConfig.model} onChange={e => setNewAIConfig({ ...newAIConfig, model: e.target.value })} style={{ padding: '12px', background: 'var(--black)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={handleCreateAIConfig} style={{ background: 'var(--gold)', color: 'var(--black)', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}><Save size={16} /> Salvar</button>
                <button onClick={() => setShowAIForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}><X size={16} /> Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ background: 'var(--darker)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>PROVEDOR</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>API KEY</th>
                  <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>MODELO</th>
                  <th style={{ padding: '15px 20px', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {aiConfigs.map(config => (
                  <tr key={config.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '15px 20px', color: 'var(--text)', fontWeight: 600 }}>{config.provider}</td>
                    <td style={{ padding: '15px 20px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{config.apiKey}</td>
                    <td style={{ padding: '15px 20px', color: 'var(--text-muted)' }}>{config.model || '-'}</td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteAIConfig(config.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {aiConfigs.length === 0 && <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma configuração de IA.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
