import { useState, useEffect } from 'react';
import {
  Bot, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw,
  Clock, History, Settings, Play
} from 'lucide-react';
import { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '../constants';
import { automationsApi } from '../services/api';

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  condition?: string;
  action: string;
  actionConfig?: string;
  isActive: boolean;
  lastRunAt?: string;
  createdAt: string;
}

interface AutomationLog {
  id: string;
  automationId: string;
  trigger: string;
  result: string;
  details?: string;
  createdAt: string;
}

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'automations' | 'logs'>('automations');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [autoRes, logsRes]: [any, any] = await Promise.all([
        automationsApi.list(),
        automationsApi.logs(),
      ]);
      setAutomations(autoRes.automations || []);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id: string) => {
    try {
      await automationsApi.toggle(id);
      setAutomations(prev => prev.map(a =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      await automationsApi.delete(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTriggerLabel = (value: string) => {
    const t = AUTOMATION_TRIGGERS.find(t => t.value === value);
    return t?.label || value;
  };

  const getActionLabel = (value: string) => {
    const a = AUTOMATION_ACTIONS.find(a => a.value === value);
    return a?.label || value;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <RefreshCw size={32} className="spin" />
          <p>Carregando automações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        .automations-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .automation-tabs { display: flex; gap: 4px; margin-bottom: 24px; }
        .automation-tab { padding: 10px 20px; border-radius: 8px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .automation-tab:hover { border-color: var(--primary); color: var(--primary); }
        .automation-tab.active { background: var(--primary); color: #1a1a1a; border-color: var(--primary); }
        .automations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
        .automation-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: all 0.2s; }
        .automation-card:hover { border-color: var(--border-light); }
        .automation-card.inactive { opacity: 0.6; }
        .auto-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .auto-header h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .auto-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.5; }
        .auto-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .auto-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .auto-tag.trigger { background: rgba(59,130,246,0.15); color: #3B82F6; }
        .auto-tag.action { background: rgba(139,92,246,0.15); color: #8B5CF6; }
        .auto-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); }
        .auto-time { font-size: 11px; color: var(--text-tertiary); }
        .auto-actions { display: flex; gap: 8px; }
        .btn-icon-sm { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .btn-icon-sm:hover { background: var(--bg-hover); color: var(--text-primary); }
        .btn-icon-sm.danger:hover { background: var(--red-bg); color: var(--red); }
        .logs-table { width: 100%; }
        .logs-table th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); }
        .logs-table td { padding: 12px 16px; font-size: 13px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
        .result-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .result-badge.success { background: rgba(16,185,129,0.15); color: #10B981; }
        .result-badge.failed { background: rgba(239,68,68,0.15); color: #EF4444; }
        .result-badge.skipped { background: rgba(107,114,128,0.15); color: #6B7280; }
      `}</style>

      <div className="automations-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={28} />
            Automações
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automatize tarefas e notificações do escritório
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Nova Automação
        </button>
      </div>

      <div className="automation-tabs">
        <button className={`automation-tab ${activeTab === 'automations' ? 'active' : ''}`} onClick={() => setActiveTab('automations')}>
          <Bot size={16} /> Automações ({automations.length})
        </button>
        <button className={`automation-tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          <History size={16} /> Histórico ({logs.length})
        </button>
      </div>

      {activeTab === 'automations' && (
        automations.length === 0 ? (
          <div className="empty-state">
            <Bot size={48} />
            <h4>Nenhuma automação configurada</h4>
            <p>Crie automações para otimizar a operação do escritório.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Criar Automação
            </button>
          </div>
        ) : (
          <div className="automations-grid">
            {automations.map(auto => (
              <div key={auto.id} className={`automation-card ${!auto.isActive ? 'inactive' : ''}`}>
                <div className="auto-header">
                  <h3>{auto.name}</h3>
                  <button onClick={() => toggleAutomation(auto.id)} title={auto.isActive ? 'Desativar' : 'Ativar'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: auto.isActive ? '#10B981' : '#6B7280' }}>
                    {auto.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
                <p className="auto-desc">{auto.description}</p>
                <div className="auto-tags">
                  <span className="auto-tag trigger">{getTriggerLabel(auto.trigger)}</span>
                  <span className="auto-tag action">{getActionLabel(auto.action)}</span>
                  {auto.isActive ? <span style={{ color: '#10B981', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Ativo</span> : <span style={{ color: '#6B7280', fontSize: '11px' }}>Inativo</span>}
                </div>
                <div className="auto-footer">
                  <span className="auto-time">Criada em {new Date(auto.createdAt).toLocaleDateString('pt-BR')}</span>
                  <div className="auto-actions">
                    <button className="btn-icon-sm" title="Executar agora"><Play size={14} /></button>
                    <button className="btn-icon-sm" title="Configurar"><Settings size={14} /></button>
                    <button className="btn-icon-sm danger" onClick={() => deleteAutomation(auto.id)} title="Excluir"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'logs' && (
        logs.length === 0 ? (
          <div className="empty-state">
            <History size={48} />
            <h4>Nenhum histórico disponível</h4>
            <p>As execuções de automações aparecerão aqui.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Automação</th>
                  <th>Gatilho</th>
                  <th>Resultado</th>
                  <th>Detalhes</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const auto = automations.find(a => a.id === log.automationId);
                  return (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{auto?.name || 'N/A'}</td>
                      <td>{getTriggerLabel(log.trigger)}</td>
                      <td><span className={`result-badge ${log.result.toLowerCase()}`}>{log.result === 'SUCCESS' ? 'Sucesso' : log.result === 'FAILED' ? 'Falha' : 'Pulado'}</span></td>
                      <td>{log.details}</td>
                      <td>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Nova Automação</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                Configure uma automação para otimizar a operação do escritório.
              </p>
              <div className="empty-state" style={{ padding: '20px' }}>
                <Settings size={32} />
                <p style={{ fontSize: '13px' }}>Funcionalidade completa disponível em breve.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
