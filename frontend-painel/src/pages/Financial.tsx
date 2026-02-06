import { DollarSign, Landmark, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

export default function Financial() {
  const summary = [
    { title: 'Receita Total', value: 'R$ 45.200,00', icon: TrendingUp, color: '#10b981' },
    { title: 'Contas a Receber', value: 'R$ 12.800,00', icon: DollarSign, color: 'var(--gold)' },
    { title: 'Despesas', value: 'R$ 8.450,00', icon: TrendingDown, color: '#ef4444' },
    { title: 'Saldo Previsto', value: 'R$ 49.550,00', icon: Landmark, color: '#3b82f6' },
  ];

  const recentInvoices = [
    { id: '1', client: 'Empresa Alpha Ltda', amount: 'R$ 5.000,00', dueDate: '10/02/2026', status: 'PENDING' },
    { id: '2', client: 'João dos Santos', amount: 'R$ 2.500,00', dueDate: '05/02/2026', status: 'PAID' },
    { id: '3', client: 'Maria Oliveira', amount: 'R$ 1.200,00', dueDate: '15/02/2026', status: 'OVERDUE' },
  ];

  return (
    <div className="page">
      <div className="header-section" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '10px' }}>Gestão Financeira</h1>
        <p style={{ color: 'var(--text-muted)' }}>Visão geral de honorários, contratos e fluxo de caixa.</p>
      </div>

      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {summary.map((item, idx) => (
          <div key={idx} style={{ background: 'var(--darker)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.title}</span>
              <item.icon size={20} color={item.color} />
            </div>
            <h2 style={{ color: 'var(--text)', fontSize: '24px', fontWeight: 700 }}>{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="table-section" style={{ background: 'var(--darker)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: 'var(--text)', fontSize: '18px' }}>Faturas Recentes</h3>
          <button style={{ background: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Ver Tudo</button>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>CLIENTE</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>VALOR</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>VENCIMENTO</th>
                <th style={{ padding: '15px 20px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '15px 20px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(invoice => (
                <tr key={invoice.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '15px 20px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{invoice.client}</td>
                  <td style={{ padding: '15px 20px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{invoice.amount}</td>
                  <td style={{ padding: '15px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{invoice.dueDate}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      whiteSpace: 'nowrap',
                      background: invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : invoice.status === 'OVERDUE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                      color: invoice.status === 'PAID' ? '#10b981' : invoice.status === 'OVERDUE' ? '#ef4444' : 'var(--gold)'
                    }}>
                      {invoice.status}
                    </span>
                  </td>
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
    </div>
  );
}

