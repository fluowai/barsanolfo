import { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Image, FileText } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import './Settings.css';

interface PetitionConfig {
  hasLogo?: boolean;
  logoData?: string;
  footerName?: string;
  footerOab?: string;
  footerAddress?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerWebsite?: string;
}

export default function PetitionSettings() {
  const [config, setConfig] = useState<PetitionConfig>({
    footerName: '',
    footerOab: '',
    footerAddress: '',
    footerPhone: '',
    footerEmail: '',
    footerWebsite: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`
  });

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/petition-config', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        if (data.config.logoData) {
          setLogoPreview(data.config.logoData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecione uma imagem' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setConfig(prev => ({ ...prev, logoData: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    try {
      await fetch('/api/petition-config/logo', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setLogoPreview(null);
      setConfig(prev => ({ ...prev, logoData: undefined, hasLogo: false }));
      setMessage({ type: 'success', text: 'Logo removido com sucesso' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover logo' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/petition-config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          logoData: config.logoData,
          logoMimeType: 'image/png',
          footerName: config.footerName,
          footerOab: config.footerOab,
          footerAddress: config.footerAddress,
          footerPhone: config.footerPhone,
          footerEmail: config.footerEmail,
          footerWebsite: config.footerWebsite,
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setConfig(prev => ({ ...prev, hasLogo: !!config.logoData }));
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page">Carregando...</div>;
  }

  return (
    <div className="page petition-settings-container">
      <div className="page-header">
        <h1>Configurações de Petição</h1>
        <p>Configure o logo e rodapé que aparecerão nas suas petições</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="petition-settings-grid">
        {/* Logo Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Image size={24} />
            <h2>Logo do Escritório</h2>
          </div>
          <div className="settings-card-content">
            <p className="settings-hint">
              Envie o logo do seu escritório. Ele aparecerá no cabeçalho das petições.
              <br />
              <strong>PNG ou JPG recomendado</strong>
            </p>

            <div className="logo-upload-area">
              {logoPreview ? (
                <div className="logo-preview-container">
                  <img src={logoPreview} alt="Logo" className="logo-preview" />
                  <button 
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 size={16} /> Remover
                  </button>
                </div>
              ) : (
                <label className="logo-upload-label">
                  <Upload size={40} />
                  <span>Clique para enviar ou arraste uma imagem</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <FileText size={24} />
            <h2>Rodapé da Petição</h2>
          </div>
          <div className="settings-card-content">
            <p className="settings-hint">
              Configure as informações que aparecerão no rodapé de suas petições.
              <br />
              <strong>Essas informações ficam salvas e não precisam ser preenchidas novamente.</strong>
            </p>

            <div className="settings-form">
              <div className="form-group">
                <label>Nome do Escritório</label>
                <input 
                  type="text"
                  placeholder="Barsanulfo & Martins Advogados"
                  value={config.footerName || ''}
                  onChange={(e) => setConfig({ ...config, footerName: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Número OAB</label>
                  <input 
                    type="text"
                    placeholder="OAB/GO 43.681"
                    value={config.footerOab || ''}
                    onChange={(e) => setConfig({ ...config, footerOab: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input 
                    type="text"
                    placeholder="(62) 99999-9999"
                    value={config.footerPhone || ''}
                    onChange={(e) => setConfig({ ...config, footerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input 
                  type="text"
                  placeholder="Av. T-7, nº 500, Setor Bueno, Goiânia/GO"
                  value={config.footerAddress || ''}
                  onChange={(e) => setConfig({ ...config, footerAddress: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email"
                    placeholder="contato@barsaadvocacia.com.br"
                    value={config.footerEmail || ''}
                    onChange={(e) => setConfig({ ...config, footerEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input 
                    type="text"
                    placeholder="www.barsaadvocacia.com.br"
                    value={config.footerWebsite || ''}
                    onChange={(e) => setConfig({ ...config, footerWebsite: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="settings-card preview-card">
        <div className="settings-card-header">
          <FileText size={24} />
          <h2>Pré-visualização</h2>
        </div>
        <div className="settings-card-content">
          <div className="petition-preview">
            {logoPreview && (
              <div className="preview-logo">
                <img src={logoPreview} alt="Logo" />
              </div>
            )}
            <div className="preview-content">
              <div className="preview-placeholder">
                <p>Conteúdo da petição aparecerá aqui...</p>
              </div>
            </div>
            <div className="preview-footer">
              {(config.footerName || config.footerOab || config.footerAddress || config.footerPhone || config.footerEmail) && (
                <div className="preview-footer-content">
                  {config.footerName && <p><strong>{config.footerName}</strong></p>}
                  {config.footerOab && <p>OAB {config.footerOab}</p>}
                  {config.footerAddress && <p>{config.footerAddress}</p>}
                  <p>
                    {config.footerPhone && <span>{config.footerPhone}</span>}
                    {config.footerPhone && config.footerEmail && <span> | </span>}
                    {config.footerEmail && <span>{config.footerEmail}</span>}
                    {config.footerWebsite && <span> | {config.footerWebsite}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
