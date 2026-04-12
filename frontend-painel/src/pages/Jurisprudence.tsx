import { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Building, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import './Jurisprudence.css';

interface JurisprudenceResult {
  id: string;
  numeroProcesso: string;
  tribunal: string;
  tema: string;
  conteudo: string;
  dataPublicacao: string;
  magistardo?: string;
  orgaoJulgador?: string;
}

interface Court {
  id: string;
  name: string;
}

const COURTS: Court[] = [
  { id: 'tjgo', name: 'TJGO - Goiás' },
  { id: 'trt18', name: 'TRT 18 - Goiás' },
  { id: 'tst', name: 'TST - Tribunal Superior do Trabalho' },
  { id: 'stj', name: 'STJ - Superior Tribunal de Justiça' },
  { id: 'stf', name: 'STF - Supremo Tribunal Federal' },
];

export default function Jurisprudence() {
  const [query, setQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [results, setResults] = useState<JurisprudenceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 3) {
      setError('Digite pelo menos 3 caracteres para buscar');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch('/api/datajud/jurisprudence', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          court: selectedCourt || undefined,
          page: 0,
          size: 20
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setResults(data.results || []);
      } else {
        setError(data.message || 'Erro na busca');
        setResults([]);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="page jurisprudence-page">
      <div className="page-header">
        <div>
          <h1>Jurisprudência</h1>
          <p>Busca em tribunais de todo o Brasil</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <Search size={20} />
            <input
              type="text"
              placeholder="Digite sua consulta jurídica..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <Building size={16} />
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="court-select"
              >
                <option value="">Todos os Tribunais</option>
                {COURTS.map(court => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <><RefreshCw size={18} className="spinner" /> Buscando...</>
              ) : (
                <><Search size={18} /> Buscar</>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* Quick Searches */}
      <div className="quick-searches">
        <span>Temas populares:</span>
        <button onClick={() => setQuery('hora extra')}>Hora Extra</button>
        <button onClick={() => setQuery('rescisão indireta')}>Rescisão Indireta</button>
        <button onClick={() => setQuery('assédio moral')}>Assédio Moral</button>
        <button onClick={() => setQuery('intervalo intrajornada')}>Intervalo</button>
        <button onClick={() => setQuery('adicional noturno')}>Adicional Noturno</button>
      </div>

      {/* Results */}
      <div className="results-section">
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={32} className="spinner" />
            <p>Buscando jurisprudência...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>Nenhum resultado encontrado</p>
            <span>Tente buscar com outros termos</span>
          </div>
        ) : !searched ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>Digite sua consulta acima para buscar jurisprudência</p>
            <span>A busca é feita em múltiplos tribunais simultaneamente</span>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2>{results.length} resultados encontrados</h2>
              {selectedCourt && (
                <span className="court-badge">
                  {COURTS.find(c => c.id === selectedCourt)?.name}
                </span>
              )}
            </div>
            
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <div className="result-meta">
                      <span className="court-tag">{result.tribunal}</span>
                      <span className="date-tag">
                        <Calendar size={14} />
                        {formatDate(result.dataPublicacao)}
                      </span>
                    </div>
                    <h3 className="result-title">{result.tema || 'Sem tema definido'}</h3>
                  </div>
                  
                  <div className="result-body">
                    <p className="result-excerpt">
                      {truncateText(result.conteudo)}
                    </p>
                  </div>
                  
                  <div className="result-footer">
                    <div className="result-info">
                      {result.orgaoJulgador && (
                        <span><Building size={14} /> {result.orgaoJulgador}</span>
                      )}
                      {result.magistardo && (
                        <span><FileText size={14} /> {result.magistardo}</span>
                      )}
                    </div>
                    <span className="process-number">{result.numeroProcesso}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
