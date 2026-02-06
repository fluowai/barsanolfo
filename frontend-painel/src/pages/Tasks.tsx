import { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignedTo: string;
}

export default function Tasks() {
  const [tasks] = useState<Task[]>([
    { id: '1', title: 'Revisar petição inicial Silva', priority: 'HIGH', status: 'IN_PROGRESS', assignedTo: 'Dr. Paulo' },
    { id: '2', title: 'Protocolar recursos Oliveira', priority: 'URGENT', status: 'TODO', assignedTo: 'Dra. Maria' },
    { id: '3', title: 'Organizar documentos novos clientes', priority: 'LOW', status: 'DONE', assignedTo: 'Secretaria' },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="page">
      <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '10px' }}>Tarefas da Equipe</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestão de atividades internas do escritório.</p>
        </div>
        <button style={{
          background: 'var(--gold)',
          color: 'var(--black)',
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}>
          <Plus size={20} />
          Nova Tarefa
        </button>
      </div>

      <div style={{ background: 'var(--darker)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>TAREFA</th>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>PRIORIDADE</th>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>STATUS</th>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>RESPONSÁVEL</th>
              <th style={{ textAlign: 'right', padding: '15px 20px' }}></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '15px 20px', color: 'var(--text)', fontWeight: 500 }}>{task.title}</td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: getPriorityColor(task.priority),
                    background: `${getPriorityColor(task.priority)}15`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${getPriorityColor(task.priority)}30`
                  }}>
                    {task.priority}
                  </span>
                </td>
                <td style={{ padding: '15px 20px' }}>
                   <span style={{ 
                    fontSize: '11px', 
                    color: 'var(--text-muted)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{task.assignedTo}</td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
