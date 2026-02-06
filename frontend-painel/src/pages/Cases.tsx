
import { useState } from 'react';
import { Search, Loader, FileText, Calendar, Database, AlertCircle } from 'lucide-react';

interface ProcessMove {
  dataHora: string;
  nome: string;
  complementosTabelados?: { nome: string; valor: string | number }[];
}

interface ProcessData {
  numeroProcesso: string;
  classe: { nome: string };
  sistema: { nome: string };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  movimentos: ProcessMove[];
}

interface SearchResult {
  alias: string;
  tribunal: string;
  total: number;
  processes: ProcessData[];
}

export default function Cases() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/datajud/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processNumber: search })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar processo');
      }

      if (data.data.total === 0) {
        setError('Nenhum processo encontrado com este número.');
      } else {
        setResult(data.data);
      }

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao buscar o processo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cases-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="header-section" style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '24px', marginBottom: '10px' }}>Consulta Processual Pública</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Consulte processos em todos os tribunais do Brasil via Datajud (CNJ).</p>
      </div>

      {/* Search Box */}
      <div className="search-section" style={{ 
        background: 'var(--darker)', 
        padding: '20px', 
        borderRadius: '12px', 
        border: '1px solid var(--border)',
        marginBottom: '30px'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Número do Processo (Ex: 0000832-35.2018.4.01.3202)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 45px',
                background: 'var(--black)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '16px 30px',
              background: 'var(--gold)',
              color: 'var(--black)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%'
            }}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
            Consultar
          </button>
        </form>
        <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          * Digite o número completo no padrão CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO).
        </p>
      </div>


      {/* Error Message */}
      {error && (
        <div style={{ 
          padding: '20px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #ef4444', 
          borderRadius: '8px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '30px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Results */}
      {result && result.processes.map((proc, index) => (
        <div key={index} className="process-card" style={{ 
          background: 'var(--darker)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: '30px'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '25px', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  color: 'var(--gold)', 
                  padding: '5px 10px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 600 
                }}>
                  {proc.tribunal}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {proc.sistema.nome}
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '5px' }}>
                {proc.numeroProcesso}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>{proc.classe.nome}</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>Última atualização</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text)' }}>
                <Calendar size={16} color="var(--gold)" />
                {new Date(proc.dataHoraUltimaAtualizacao).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '25px' }}>
            <h3 style={{ color: 'var(--text)', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="var(--gold)" />
              Últimas Movimentações
            </h3>

            <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {proc.movimentos.slice(0, 5).map((mov, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    width: '20px' 
                  }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: idx === 0 ? 'var(--gold)' : 'var(--border)' 
                    }} />
                    {idx < 4 && <div style={{ width: '2px', flex: 1, background: 'var(--border)', marginTop: '5px' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: '5px' }}>
                      {mov.nome}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>
                      {new Date(mov.dataHora).toLocaleDateString()} às {new Date(mov.dataHora).toLocaleTimeString()}
                    </p>
                    {mov.complementosTabelados && mov.complementosTabelados.length > 0 && (
                       <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                         {mov.complementosTabelados.map((comp, cIdx) => (
                           <div key={cIdx} style={{ color: 'var(--text-muted)' }}>
                             <span style={{ fontWeight: 600 }}>{comp.nome}:</span> {comp.valor}
                           </div>
                         ))}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        
          {/* Footer - Import Action */}
          <div style={{ 
            padding: '20px 25px', 
            background: 'rgba(212, 175, 55, 0.05)', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button 
              onClick={async () => {
                if (!proc.numeroProcesso) return;
                try {
                  const response = await fetch('http://localhost:3000/api/cases/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      processData: proc,
                      clientId: 'placeholder-client-id', // TODO: Selecionar cliente real
                      lawyerId: 'placeholder-lawyer-id'  // TODO: Selecionar advogado real
                    })
                  });
                  const data = await response.json();
                  if (data.success) {
                    alert('Processo importado com sucesso!');
                  } else {
                    alert(data.message || 'Erro ao importar processo');
                  }
                } catch (err) {
                  alert('Erro ao conectar com o servidor');
                }
              }}
              style={{
                background: 'transparent',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Database size={18} />
              Importar para o Sistema
            </button>

          </div>
        </div>
      ))}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Database size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
          <h3>Sua busca começa aqui</h3>
          <p>Digite o número do processo acima para consultar a base nacional do Datajud.</p>
        </div>
      )}
    </div>
  );
}
