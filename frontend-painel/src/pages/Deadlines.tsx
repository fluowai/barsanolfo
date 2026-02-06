import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Deadline {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
  caseNumber: string;
}


export default function Deadlines() {
  const [deadlines] = useState<Deadline[]>([
    {
      id: '1',
      description: 'Petição Inicial - Caso Silva',
      dueDate: '2026-02-10T14:00:00Z',
      completed: false,
      caseNumber: '0000832-35.2018.4.01.3202'
    },
    {
      id: '2',
      description: 'Réplica à Contestação - Caso Oliveira',
      dueDate: '2026-02-15T18:00:00Z',
      completed: true,
      caseNumber: '1234567-89.2023.8.26.0000'
    }
  ]);

  return (
    <div className="page">
      <div className="header-section" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '10px' }}>Prazos e Audiências</h1>
        <p style={{ color: 'var(--text-muted)' }}>Controle de vencimentos e compromissos processuais.</p>
      </div>

      <div className="deadlines-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {deadlines.map((deadline) => (
          <div key={deadline.id} style={{ 
            background: 'var(--darker)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '4px', 
              height: '100%', 
              background: deadline.completed ? '#10b981' : 'var(--gold)' 
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Clock size={14} />
                {new Date(deadline.dueDate).toLocaleDateString()}
              </span>
              {deadline.completed ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <AlertCircle size={18} color="var(--gold)" />
              )}
            </div>

            <h3 style={{ color: 'var(--text)', fontSize: '16px', marginBottom: '10px' }}>{deadline.description}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Proc: {deadline.caseNumber}</p>
            
            <button style={{
              marginTop: '15px',
              width: '100%',
              padding: '8px',
              background: deadline.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
              color: deadline.completed ? '#10b981' : 'var(--gold)',
              border: `1px solid ${deadline.completed ? '#10b981' : 'var(--gold)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {deadline.completed ? 'Reabrir' : 'Concluir'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
