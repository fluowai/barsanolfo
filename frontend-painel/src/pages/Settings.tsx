import { useState } from 'react';
import {
  Building, Scale, TrendingUp, DollarSign, Users, Bot, Bell,
  Plus, Trash2, Save, X, Upload, Globe, Phone, Mail, MapPin,
  Clock, CheckCircle, Gavel, BookOpen, Target, Percent,
  CreditCard, Calendar, RefreshCw, FileText, Briefcase,
  AlertTriangle, Tag, Settings as SettingsIcon, Shield, Award
} from 'lucide-react';
import './Settings.css';

/* ── Interfaces ── */

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

/* ── Mock Data ── */

const LEGAL_AREAS = [
  'Direito do Trabalho', 'Direito Civil', 'Direito de Família',
  'Direito Empresarial', 'Direito Tributário', 'Direito Previdenciário',
  'Direito do Consumidor', 'Direito Penal', 'Direito Administrativo',
  'Direito Constitucional', 'Direito Ambiental', 'Direito Digital',
];

const PROCESS_TYPES = [
  'Ação de Cobrança', 'Ação Indenizatória', 'Reclamação Trabalhista',
  'Divórcio Litigioso', 'Execução Fiscal', 'Mandado de Segurança',
  'Ação Penal', 'Ação de Alimentos', 'Inventário',
];

const PROCESS_PHASES = [
  'Pré-Processual', 'Conhecimento', 'Instrução', 'Sentença',
  'Recursal', 'Execução', 'Arquivado',
];

const DEADLINE_TYPES = [
  'Contestação', 'Embargos', 'Recurso', 'Contrarrazões',
  'Audiência', 'Perícia', 'Manifestação', 'Documentos',
];

const LEAD_SOURCES = [
  'Indicação', 'Google', 'Instagram', 'Facebook',
  'LinkedIn', 'Site', 'WhatsApp', 'Presencial',
];

const LOSS_REASONS = [
  'Preço alto', 'Preferiu outro escritório', 'Não respondeu contato',
  'Não é o momento', 'Serviço não disponível', 'Outro',
];

const REVENUE_CATEGORIES = [
  'Honorários Contrato', 'Honorários Sucumbência',
  'Consultoria', 'Parecer Jurídico', 'Assinatura Mensal',
];

const EXPENSE_CATEGORIES = [
  'Custas Processuais', 'Assinaturas', 'Salários',
  'Marketing', 'Impostos', 'Aluguel', 'Utilidades',
];

const PAYMENT_METHODS = [
  'PIX', 'Boleto Bancário', 'Cartão de Crédito',
  'Cartão de Débito', 'Transferência Bancária', 'Dinheiro',
];

/* ── Helper Component ── */

function TagBadge({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)',
      border: '1px solid rgba(212,175,55,0.2)',
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-primary)', display: 'flex', padding: 0 }}>
          <X size={14} />
        </button>
      )}
    </span>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>('geral');

  /* ── Team ── */
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'LAWYER' });

  /* ── AI ── */
  const [aiConfigs, setAIConfigs] = useState<AIConfig[]>([]);
  const [showAIForm, setShowAIForm] = useState(false);
  const [newAIConfig, setNewAIConfig] = useState({ provider: 'GEMINI', apiKey: '', model: '' });

  /* ── Geral ── */
  const [officeName, setOfficeName] = useState('Martins & Oliveira Advogados');
  const [cnpj, setCnpj] = useState('00.000.000/0001-00');
  const [officeAddress, setOfficeAddress] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
  const [officePhone, setOfficePhone] = useState('(11) 3000-0000');
  const [officeEmail, setOfficeEmail] = useState('contato@martinsoliveira.adv.br');
  const [officeWebsite, setOfficeWebsite] = useState('www.martinsoliveira.adv.br');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');

  /* ── Jurídico ── */
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Direito do Trabalho', 'Direito Civil', 'Direito de Família']);
  const [selectedProcessTypes, setSelectedProcessTypes] = useState<string[]>(['Reclamação Trabalhista', 'Ação Indenizatória']);
  const [selectedPhases, setSelectedPhases] = useState<string[]>(PROCESS_PHASES);
  const [selectedDeadlineTypes, setSelectedDeadlineTypes] = useState<string[]>(['Contestação', 'Embargos', 'Recurso']);
  const [holidays, setHolidays] = useState<string[]>(['2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-15', '2026-12-25']);
  const [newHoliday, setNewHoliday] = useState('');

  /* ── Comercial ── */
  const [leadSources, setLeadSources] = useState<string[]>(LEAD_SOURCES);
  const [newLeadSource, setNewLeadSource] = useState('');
  const [lossReasons, setLossReasons] = useState<string[]>(LOSS_REASONS);
  const [newLossReason, setNewLossReason] = useState('');
  const [leadSLA, setLeadSLA] = useState({ hot: 2, warm: 24, cold: 72 });

  /* ── Financeiro ── */
  const [revenueCategories, setRevenueCategories] = useState<string[]>(REVENUE_CATEGORIES);
  const [newRevenueCategory, setNewRevenueCategory] = useState('');
  const [expenseCategories, setExpenseCategories] = useState<string[]>(EXPENSE_CATEGORIES);
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>(PAYMENT_METHODS);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [interestRate, setInterestRate] = useState(1);
  const [penaltyRate, setPenaltyRate] = useState(2);

  /* ── Notificações ── */
  const [notifications, setNotifications] = useState({
    prazoProximo: { email: true, push: true, whatsapp: false },
    prazoVencido: { email: true, push: true, whatsapp: true },
    novoLead: { email: true, push: true, whatsapp: true },
    novaMensagem: { email: false, push: true, whatsapp: true },
    tarefaAtribuida: { email: true, push: true, whatsapp: false },
    movimentacaoProcessual: { email: true, push: false, whatsapp: false },
    pagamentoRecebido: { email: true, push: true, whatsapp: false },
    audienciaAgendada: { email: true, push: true, whatsapp: true },
  });

  const notificationTypes = [
    { key: 'prazoProximo', label: 'Prazo Próximo' },
    { key: 'prazoVencido', label: 'Prazo Vencido' },
    { key: 'novoLead', label: 'Novo Lead' },
    { key: 'novaMensagem', label: 'Nova Mensagem' },
    { key: 'tarefaAtribuida', label: 'Tarefa Atribuída' },
    { key: 'movimentacaoProcessual', label: 'Movimentação Processual' },
    { key: 'pagamentoRecebido', label: 'Pagamento Recebido' },
    { key: 'audienciaAgendada', label: 'Audiência Agendada' },
  ];

  const toggleNotification = (type: string, channel: 'email' | 'push' | 'whatsapp') => {
    setNotifications(prev => ({
      ...prev,
      [type]: { ...prev[type as keyof typeof prev], [channel]: !prev[type as keyof typeof prev][channel] },
    }));
  };

  /* ── CRUDs ── */

  const handleCreateMember = () => {
    if (!newMember.name || !newMember.email) return;
    const member: TeamMember = { id: String(Date.now()), ...newMember };
    setTeam([...team, member]);
    setShowTeamForm(false);
    setNewMember({ name: '', email: '', password: '', role: 'LAWYER' });
  };

  const handleDeleteMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const handleCreateAIConfig = () => {
    if (!newAIConfig.apiKey) return;
    const config: AIConfig = { id: String(Date.now()), ...newAIConfig, model: newAIConfig.model || null, isActive: true };
    setAIConfigs([...aiConfigs, config]);
    setShowAIForm(false);
    setNewAIConfig({ provider: 'GEMINI', apiKey: '', model: '' });
  };

  const handleDeleteAIConfig = (id: string) => {
    setAIConfigs(aiConfigs.filter(c => c.id !== id));
  };

  const addItem = (list: string[], setter: (v: string[]) => void, value: string, clear: (v: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      clear('');
    }
  };

  const addHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday('');
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const tabs = [
    { key: 'geral', label: 'Geral', icon: <Building size={18} /> },
    { key: 'juridico', label: 'Jurídico', icon: <Scale size={18} /> },
    { key: 'comercial', label: 'Comercial', icon: <TrendingUp size={18} /> },
    { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { key: 'equipe', label: 'Equipe', icon: <Users size={18} /> },
    { key: 'ia', label: 'IA', icon: <Bot size={18} /> },
    { key: 'notificacoes', label: 'Notificações', icon: <Bell size={18} /> },
  ];

  return (
    <div className="page settings-container">
      <style>{`
        .settings-header { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid var(--border); }
        .settings-title { font-size: 32px; font-weight: 700; background: linear-gradient(135deg, var(--gold), var(--gold-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
        .settings-subtitle { font-size: 16px; color: var(--text-muted); }
        .settings-tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 30px; overflow-x: auto; }
        .settings-tab { padding: 14px 18px; background: transparent; border: none; color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border-bottom: 3px solid transparent; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .settings-tab:hover { color: var(--text); background: rgba(212, 175, 55, 0.05); }
        .settings-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
        .settings-form { background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 30px; }
        .settings-form h3 { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 24px; }
        .settings-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .settings-form-group { display: flex; flex-direction: column; gap: 8px; }
        .settings-form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .settings-form-group input, .settings-form-group select, .settings-form-group textarea { background: var(--darker-alt); border: 1px solid var(--border); color: var(--text); padding: 12px; border-radius: 8px; font-family: inherit; font-size: 14px; transition: all 0.2s ease; }
        .settings-form-group input:focus, .settings-form-group select:focus, .settings-form-group textarea:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1); }
        .settings-form-actions { display: flex; gap: 12px; justify-content: flex-start; }
        .settings-form-actions button { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; display: flex; align-items: center; gap: 8px; }
        .btn-save { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--black); }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3); }
        .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
        .btn-cancel:hover { background: var(--dark); border-color: var(--gold); color: var(--text); }
        .settings-table-container { background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .settings-table { width: 100%; border-collapse: collapse; }
        .settings-table thead th { background: rgba(255, 255, 255, 0.02); padding: 16px 20px; text-align: left; font-weight: 600; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
        .settings-table tbody td { padding: 16px 20px; border-bottom: 1px solid var(--border); color: var(--text); font-size: 14px; }
        .settings-table tbody tr:last-child td { border-bottom: none; }
        .settings-table tbody tr:hover { background: rgba(212, 175, 55, 0.02); }
        .settings-table-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .settings-table-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.2s ease; }
        .settings-table-btn:hover { background: var(--dark); color: var(--gold); }
        .settings-table-btn.delete { color: #ef4444; }
        .settings-table-btn.delete:hover { background: rgba(239, 68, 68, 0.1); }
        .settings-empty { padding: 40px 20px; text-align: center; color: var(--text-muted); }
        .section-card { background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
        .section-card-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .tags-wrap { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .add-input-row { display: flex; gap: 8px; align-items: center; }
        .add-input-row input { flex: 1; background: var(--darker-alt); border: 1px solid var(--border); color: var(--text); padding: 10px 12px; border-radius: 8px; font-family: inherit; font-size: 14px; }
        .add-input-row input:focus { outline: none; border-color: var(--gold); }
        .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .checkbox-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .checkbox-item:hover { border-color: var(--gold); }
        .checkbox-item.checked { border-color: var(--gold); background: rgba(212,175,55,0.08); }
        .checkbox-item input { accent-color: var(--gold-primary); }
        .checkbox-item label { font-size: 14px; color: var(--text); cursor: pointer; }
        .sla-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .sla-item { display: flex; flex-direction: column; gap: 6px; }
        .sla-item label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
        .sla-item input { background: var(--darker-alt); border: 1px solid var(--border); color: var(--text); padding: 10px 12px; border-radius: 8px; font-size: 14px; }
        .sla-item input:focus { outline: none; border-color: var(--gold); }
        .notif-grid { display: flex; flex-direction: column; gap: 8px; }
        .notif-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; }
        .notif-row-label { font-size: 14px; font-weight: 600; color: var(--text); }
        .notif-channels { display: flex; gap: 16px; align-items: center; }
        .notif-channel { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); cursor: pointer; }
        .notif-channel input { accent-color: var(--gold-primary); }
        .upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .upload-area:hover { border-color: var(--gold); background: rgba(212,175,55,0.03); }
        .upload-area p { color: var(--text-muted); font-size: 14px; }
        .upload-area svg { color: var(--text-tertiary); margin-bottom: 8px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .page-actions { display: flex; gap: 10px; align-items: center; }
      `}</style>

      <div className="settings-header">
        <h1 className="settings-title">Configurações</h1>
        <p className="settings-subtitle">Gerencie todas as configurações do seu escritório</p>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Geral ── */}
      {activeTab === 'geral' && (
        <div>
          <div className="section-card">
            <div className="section-card-title"><Building size={20} /> Informações do Escritório</div>
            <div className="settings-form-grid">
              <div className="settings-form-group">
                <label>Nome do Escritório</label>
                <input value={officeName} onChange={e => setOfficeName(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label>CNPJ</label>
                <input value={cnpj} onChange={e => setCnpj(e.target.value)} />
              </div>
              <div className="settings-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Endereço</label>
                <textarea value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} rows={2} />
              </div>
              <div className="settings-form-group">
                <label>Telefone</label>
                <input value={officePhone} onChange={e => setOfficePhone(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label>Email</label>
                <input type="email" value={officeEmail} onChange={e => setOfficeEmail(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label>Website</label>
                <input value={officeWebsite} onChange={e => setOfficeWebsite(e.target.value)} />
              </div>
              <div className="settings-form-group">
                <label>Fuso Horário</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                  <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                  <option value="America/Manaus">America/Manaus (UTC-4)</option>
                  <option value="America/Fortaleza">America/Fortaleza (UTC-3)</option>
                  <option value="America/Noronha">America/Noronha (UTC-2)</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="settings-form-group" style={{ marginBottom: 16 }}>
                <label>Logo do Escritório</label>
                <div className="upload-area">
                  <Upload size={32} />
                  <p>Clique para fazer upload da logo<br />PNG, JPG até 2MB</p>
                </div>
              </div>
            </div>
            <div className="settings-form-actions">
              <button className="btn-save"><Save size={16} /> Salvar Configurações</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Jurídico ── */}
      {activeTab === 'juridico' && (
        <div>
          <div className="section-card">
            <div className="section-card-title"><BookOpen size={20} /> Áreas de Atuação</div>
            <div className="checkbox-grid">
              {LEGAL_AREAS.map(area => (
                <div
                  key={area}
                  className={`checkbox-item ${selectedAreas.includes(area) ? 'checked' : ''}`}
                  onClick={() => {
                    setSelectedAreas(prev =>
                      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
                    );
                  }}
                >
                  <input type="checkbox" checked={selectedAreas.includes(area)} readOnly />
                  <label>{area}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><Gavel size={20} /> Tipos de Processo</div>
            <div className="checkbox-grid">
              {PROCESS_TYPES.map(pt => (
                <div
                  key={pt}
                  className={`checkbox-item ${selectedProcessTypes.includes(pt) ? 'checked' : ''}`}
                  onClick={() => setSelectedProcessTypes(prev =>
                    prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]
                  )}
                >
                  <input type="checkbox" checked={selectedProcessTypes.includes(pt)} readOnly />
                  <label>{pt}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><RefreshCw size={20} /> Fases Processuais</div>
            <div className="checkbox-grid">
              {PROCESS_PHASES.map(phase => (
                <div
                  key={phase}
                  className={`checkbox-item ${selectedPhases.includes(phase) ? 'checked' : ''}`}
                  onClick={() => setSelectedPhases(prev =>
                    prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
                  )}
                >
                  <input type="checkbox" checked={selectedPhases.includes(phase)} readOnly />
                  <label>{phase}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><Clock size={20} /> Tipos de Prazo</div>
            <div className="tags-wrap">
              {selectedDeadlineTypes.map(dt => (
                <TagBadge key={dt} label={dt} onRemove={() => setSelectedDeadlineTypes(prev => prev.filter(d => d !== dt))} />
              ))}
            </div>
            <div className="add-input-row">
              <select
                style={{ flex: 1, background: 'var(--darker-alt)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
                value=""
                onChange={e => {
                  if (e.target.value && !selectedDeadlineTypes.includes(e.target.value)) {
                    setSelectedDeadlineTypes([...selectedDeadlineTypes, e.target.value]);
                  }
                }}
              >
                <option value="">Adicionar tipo de prazo...</option>
                {DEADLINE_TYPES.filter(d => !selectedDeadlineTypes.includes(d)).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><Calendar size={20} /> Feriados</div>
            <div className="tags-wrap">
              {holidays.map(h => (
                <TagBadge key={h} label={formatDate(h)} onRemove={() => setHolidays(prev => prev.filter(d => d !== h))} />
              ))}
            </div>
            <div className="add-input-row">
              <input type="date" value={newHoliday} onChange={e => setNewHoliday(e.target.value)} />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={addHoliday}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Comercial ── */}
      {activeTab === 'comercial' && (
        <div>
          <div className="section-card">
            <div className="section-card-title"><Target size={20} /> Origens de Lead</div>
            <div className="tags-wrap">
              {leadSources.map(s => (
                <TagBadge key={s} label={s} onRemove={() => setLeadSources(prev => prev.filter(x => x !== s))} />
              ))}
            </div>
            <div className="add-input-row">
              <input
                placeholder="Nova origem..."
                value={newLeadSource}
                onChange={e => setNewLeadSource(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(leadSources, setLeadSources, newLeadSource, setNewLeadSource); }}
              />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={() => addItem(leadSources, setLeadSources, newLeadSource, setNewLeadSource)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><AlertTriangle size={20} /> Motivos de Perda</div>
            <div className="tags-wrap">
              {lossReasons.map(r => (
                <TagBadge key={r} label={r} onRemove={() => setLossReasons(prev => prev.filter(x => x !== r))} />
              ))}
            </div>
            <div className="add-input-row">
              <input
                placeholder="Novo motivo..."
                value={newLossReason}
                onChange={e => setNewLossReason(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(lossReasons, setLossReasons, newLossReason, setNewLossReason); }}
              />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={() => addItem(lossReasons, setLossReasons, newLossReason, setNewLossReason)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><Clock size={20} /> SLA por Tipo de Lead</div>
            <div className="sla-grid">
              <div className="sla-item">
                <label style={{ color: '#ef4444' }}>Hot (horas)</label>
                <input type="number" min={1} value={leadSLA.hot} onChange={e => setLeadSLA({ ...leadSLA, hot: Number(e.target.value) })} />
              </div>
              <div className="sla-item">
                <label style={{ color: '#f59e0b' }}>Warm (horas)</label>
                <input type="number" min={1} value={leadSLA.warm} onChange={e => setLeadSLA({ ...leadSLA, warm: Number(e.target.value) })} />
              </div>
              <div className="sla-item">
                <label style={{ color: '#6b7280' }}>Cold (horas)</label>
                <input type="number" min={1} value={leadSLA.cold} onChange={e => setLeadSLA({ ...leadSLA, cold: Number(e.target.value) })} />
              </div>
            </div>
            <div className="settings-form-actions" style={{ marginTop: 16 }}>
              <button className="btn-save"><Save size={16} /> Salvar SLA</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Financeiro ── */}
      {activeTab === 'financeiro' && (
        <div>
          <div className="section-card">
            <div className="section-card-title"><TrendingUp size={20} /> Categorias de Receita</div>
            <div className="tags-wrap">
              {revenueCategories.map(c => (
                <TagBadge key={c} label={c} onRemove={() => setRevenueCategories(prev => prev.filter(x => x !== c))} />
              ))}
            </div>
            <div className="add-input-row">
              <input
                placeholder="Nova categoria de receita..."
                value={newRevenueCategory}
                onChange={e => setNewRevenueCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(revenueCategories, setRevenueCategories, newRevenueCategory, setNewRevenueCategory); }}
              />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={() => addItem(revenueCategories, setRevenueCategories, newRevenueCategory, setNewRevenueCategory)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><DollarSign size={20} /> Categorias de Despesa</div>
            <div className="tags-wrap">
              {expenseCategories.map(c => (
                <TagBadge key={c} label={c} onRemove={() => setExpenseCategories(prev => prev.filter(x => x !== c))} />
              ))}
            </div>
            <div className="add-input-row">
              <input
                placeholder="Nova categoria de despesa..."
                value={newExpenseCategory}
                onChange={e => setNewExpenseCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(expenseCategories, setExpenseCategories, newExpenseCategory, setNewExpenseCategory); }}
              />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={() => addItem(expenseCategories, setExpenseCategories, newExpenseCategory, setNewExpenseCategory)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><CreditCard size={20} /> Formas de Pagamento</div>
            <div className="tags-wrap">
              {paymentMethods.map(m => (
                <TagBadge key={m} label={m} onRemove={() => setPaymentMethods(prev => prev.filter(x => x !== m))} />
              ))}
            </div>
            <div className="add-input-row">
              <input
                placeholder="Nova forma de pagamento..."
                value={newPaymentMethod}
                onChange={e => setNewPaymentMethod(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addItem(paymentMethods, setPaymentMethods, newPaymentMethod, setNewPaymentMethod); }}
              />
              <button className="btn-save" style={{ padding: '10px 16px' }} onClick={() => addItem(paymentMethods, setPaymentMethods, newPaymentMethod, setNewPaymentMethod)}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-title"><Percent size={20} /> Juros e Multa</div>
            <div className="settings-form-grid">
              <div className="settings-form-group">
                <label>Juros ao Mês (%)</label>
                <input type="number" step="0.1" min="0" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
              </div>
              <div className="settings-form-group">
                <label>Multa por Atraso (%)</label>
                <input type="number" step="0.1" min="0" value={penaltyRate} onChange={e => setPenaltyRate(Number(e.target.value))} />
              </div>
            </div>
            <div className="settings-form-actions">
              <button className="btn-save"><Save size={16} /> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Equipe ── */}
      {activeTab === 'equipe' && (
        <div>
          <div className="page-header" style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Gerencie os membros da sua equipe. Para uma gestão completa, acesse{' '}
              <a href="/painel/equipe" style={{ color: 'var(--gold-primary)', textDecoration: 'underline' }}>Equipe</a>.
            </p>
            <div className="page-actions">
              <button onClick={() => setShowTeamForm(true)} className="btn btn-primary">
                <Plus size={18} /> Novo Membro
              </button>
            </div>
          </div>

          {showTeamForm && (
            <div className="settings-form">
              <h3>Adicionar Membro</h3>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Nome</label>
                  <input placeholder="João Silva" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                </div>
                <div className="settings-form-group">
                  <label>Email</label>
                  <input placeholder="joao@example.com" type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
                </div>
                <div className="settings-form-group">
                  <label>Senha</label>
                  <input placeholder="••••••••" type="password" value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })} />
                </div>
                <div className="settings-form-group">
                  <label>Função</label>
                  <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}>
                    <option value="ADMIN">Administrador</option>
                    <option value="LAWYER">Advogado</option>
                    <option value="SECRETARY">Secretário(a)</option>
                    <option value="ESTAGIARIO">Estagiário(a)</option>
                    <option value="FINANCEIRO">Financeiro</option>
                  </select>
                </div>
              </div>
              <div className="settings-form-actions">
                <button onClick={handleCreateMember} className="btn-save"><Save size={16} /> Salvar</button>
                <button onClick={() => setShowTeamForm(false)} className="btn-cancel"><X size={16} /> Cancelar</button>
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
                    <td><span className="badge badge-gold">{member.role}</span></td>
                    <td>
                      <div className="settings-table-actions">
                        <button onClick={() => handleDeleteMember(member.id)} className="settings-table-btn delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {team.length === 0 && (
                  <tr>
                    <td colSpan={4} className="settings-empty">Nenhum membro cadastrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── IA ── */}
      {activeTab === 'ia' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <button onClick={() => setShowAIForm(true)} className="btn btn-primary">
              <Plus size={18} /> Nova Configuração
            </button>
          </div>

          {showAIForm && (
            <div className="settings-form">
              <h3>Adicionar Credencial de IA</h3>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Provedor</label>
                  <select value={newAIConfig.provider} onChange={e => setNewAIConfig({ ...newAIConfig, provider: e.target.value })}>
                    <option value="GEMINI">Google Gemini</option>
                    <option value="OPENAI">OpenAI</option>
                    <option value="CLAUDE">Anthropic Claude</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label>API Key</label>
                  <input placeholder="sk-..." value={newAIConfig.apiKey} onChange={e => setNewAIConfig({ ...newAIConfig, apiKey: e.target.value })} />
                </div>
                <div className="settings-form-group">
                  <label>Modelo (opcional)</label>
                  <input placeholder="gpt-4, claude-3, etc..." value={newAIConfig.model} onChange={e => setNewAIConfig({ ...newAIConfig, model: e.target.value })} />
                </div>
              </div>
              <div className="settings-form-actions">
                <button onClick={handleCreateAIConfig} className="btn-save"><Save size={16} /> Salvar</button>
                <button onClick={() => setShowAIForm(false)} className="btn-cancel"><X size={16} /> Cancelar</button>
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
                        <button onClick={() => handleDeleteAIConfig(config.id)} className="settings-table-btn delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {aiConfigs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="settings-empty">Nenhuma configuração de IA</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Notificações ── */}
      {activeTab === 'notificacoes' && (
        <div className="section-card">
          <div className="section-card-title"><Bell size={20} /> Preferências de Notificação</div>
          <div className="notif-grid">
            <div className="notif-row" style={{ fontWeight: 600, background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid var(--border)' }}>
              <span>Tipo de Notificação</span>
              <div className="notif-channels">
                <span className="notif-channel">Email</span>
                <span className="notif-channel">Push</span>
                <span className="notif-channel">WhatsApp</span>
              </div>
            </div>
            {notificationTypes.map(n => {
              const config = notifications[n.key as keyof typeof notifications];
              return (
                <div key={n.key} className="notif-row">
                  <span className="notif-row-label">{n.label}</span>
                  <div className="notif-channels">
                    <label className="notif-channel">
                      <input type="checkbox" checked={config.email} onChange={() => toggleNotification(n.key, 'email')} />
                      Email
                    </label>
                    <label className="notif-channel">
                      <input type="checkbox" checked={config.push} onChange={() => toggleNotification(n.key, 'push')} />
                      Push
                    </label>
                    <label className="notif-channel">
                      <input type="checkbox" checked={config.whatsapp} onChange={() => toggleNotification(n.key, 'whatsapp')} />
                      WhatsApp
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="settings-form-actions" style={{ marginTop: 20 }}>
            <button className="btn-save"><Save size={16} /> Salvar Preferências</button>
          </div>
        </div>
      )}
    </div>
  );
}
