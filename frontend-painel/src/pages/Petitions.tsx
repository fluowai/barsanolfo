import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Eye, Printer, Image, Type, Plus, X, Settings } from 'lucide-react';
import './Petitions.css';

interface PetitionData {
  title: string;
  clientName: string;
  clientCpf: string;
  recipient: string;
  caseNumber: string;
  court: string;
  fieldValues: Record<string, string>;
  mainContent: string;
  footerName: string;
  footerOab: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
  placeholder?: string;
}

export default function Petitions() {
  const [petitionData, setPetitionData] = useState<PetitionData>({
    title: '',
    clientName: '',
    clientCpf: '',
    recipient: '',
    caseNumber: '',
    court: '',
    fieldValues: {},
    mainContent: '',
    footerName: '',
    footerOab: '',
    footerAddress: '',
    footerPhone: '',
    footerEmail: '',
  });
  
  const [timbradoFile, setTimbradoFile] = useState<File | null>(null);
  const [timbradoPreview, setTimbradoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  const [showTimbradoSettings, setShowTimbradoSettings] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const timbradoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof PetitionData, value: string) => {
    setPetitionData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Selecione uma imagem (PNG, JPG)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setLogoPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTimbradoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Selecione um arquivo PDF' });
      return;
    }

    setTimbradoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setTimbradoPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const removeTimbrado = () => {
    setTimbradoFile(null);
    setTimbradoPreview(null);
    if (timbradoInputRef.current) timbradoInputRef.current.value = '';
  };

  const addCustomField = () => {
    const newId = String(Date.now());
    setCustomFields([...customFields, {
      id: newId,
      label: '',
      type: 'text',
      placeholder: ''
    }]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
    const newValues = { ...petitionData.fieldValues };
    delete newValues[id];
    setPetitionData(prev => ({ ...prev, fieldValues: newValues }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleFieldValueChange = (id: string, value: string) => {
    setPetitionData(prev => ({
      ...prev,
      fieldValues: { ...prev.fieldValues, [id]: value }
    }));
  };

  const generateHTML = () => {
    let html = `
      <div class="petition-page" style="font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 50px 40px;">
    `;

    // Logo
    if (logoPreview) {
      html += `
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoPreview}" alt="Logo" style="max-height: 90px; max-width: 220px; object-fit: contain;" />
        </div>
      `;
    }

    // Cabeçalho
    html += `
      <div style="text-align: right; margin-bottom: 30px;">
        <p style="margin: 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div style="margin-bottom: 25px;">
        <p style="text-align: justify; margin-bottom: 10px;"><strong>EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DO TRABALHO DA ${petitionData.court || '__ª VARA DO TRABALHO DE LOCAL'}</strong></p>
      </div>
      
      <div style="margin-bottom: 25px; text-align: center;">
        <p style="font-weight: bold; text-decoration: underline; margin: 0;">${petitionData.title || 'TÍTULO DA PETIÇÃO'}</p>
        ${petitionData.caseNumber ? `<p style="margin: 5px 0;"><strong>Processo nº:</strong> ${petitionData.caseNumber}</p>` : ''}
      </div>
    `;

    // Dados do cliente
    if (petitionData.clientName) {
      html += `<p style="text-align: justify; margin-bottom: 15px;"><strong>RECLAMANTE:</strong> ${petitionData.clientName}${petitionData.clientCpf ? ` (CPF: ${petitionData.clientCpf})` : ''}</p>`;
    }

    if (petitionData.recipient) {
      html += `<p style="text-align: justify; margin-bottom: 15px;"><strong>RÉ:</strong> ${petitionData.recipient}</p>`;
    }

    // Campos customizados
    customFields.forEach(field => {
      const value = petitionData.fieldValues[field.id];
      if (value && field.label) {
        html += `<p style="text-align: justify; margin-bottom: 15px;"><strong>${field.label}:</strong> ${value}</p>`;
      }
    });

    // Conteúdo principal
    if (petitionData.mainContent) {
      const formattedContent = petitionData.mainContent
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => `<p style="text-align: justify; margin-bottom: 15px; text-indent: 2em;">${p}</p>`)
        .join('');
      html += `<div style="margin-bottom: 30px;">${formattedContent}</div>`;
    }

    // Termo final
    html += `
      <div style="text-align: justify; margin-bottom: 30px;">
        <p style="margin-bottom: 15px;">Nestes termos,</p>
        <p>Pede deferimento.</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 40px;">
        <p>${petitionData.footerAddress?.split(',')[0] || 'Cidade'}, _____ de _____________ de _______.</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 50px;">
        <p style="margin-bottom: 30px;">________________________________</p>
        <p style="font-weight: bold; margin: 0;">${petitionData.footerName || 'Nome do Advogado'}</p>
        <p style="margin: 0;">${petitionData.footerOab || 'OAB/GO 00.000'}</p>
      </div>
    `;

    // Rodapé
    const hasFooterInfo = petitionData.footerAddress || petitionData.footerPhone || petitionData.footerEmail;
    if (hasFooterInfo) {
      html += `
        <div style="border-top: 1px solid #999; padding-top: 12px; margin-top: 30px; text-align: center; font-size: 11px; color: #666;">
          <p style="margin: 2px 0;"><strong>${petitionData.footerName || ''}</strong></p>
          <p style="margin: 2px 0;">${petitionData.footerOab || ''}</p>
          <p style="margin: 2px 0;">${petitionData.footerAddress || ''}</p>
          <p style="margin: 2px 0;">${[petitionData.footerPhone, petitionData.footerEmail].filter(Boolean).join(' | ')}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  };

  const handlePrint = () => {
    const html = generateHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${petitionData.title || 'Petição'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @page { margin: 0; size: A4; }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="page petitions-container">
      <div className="page-header">
        <div>
          <h1>Criar Petição</h1>
          <p>Elabore suas petições online com logo e rodapé customizáveis</p>
        </div>
        <button 
          className="btn btn-outline"
          onClick={() => setShowTimbradoSettings(!showTimbradoSettings)}
        >
          <Settings size={18} />
          Configurar Timbrado
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Configurações de Timbrado */}
      {showTimbradoSettings && (
        <div className="timbrado-settings">
          <h3><Image size={20} /> Logo do Escritório</h3>
          <div className="timbrado-upload-area">
            {logoPreview ? (
              <div className="file-preview">
                <img src={logoPreview} alt="Logo" className="preview-img" />
                <button className="btn btn-danger btn-sm" onClick={removeLogo}>
                  <Trash2 size={16} /> Remover
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <Upload size={32} />
                <span>Enviar Logo (PNG/JPG)</span>
                <input 
                  ref={logoInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <h3><FileText size={20} /> Papel Timbrado (PDF)</h3>
          <div className="timbrado-upload-area">
            {timbradoPreview ? (
              <div className="file-preview">
                <div className="pdf-preview">
                  <FileText size={32} />
                  <span>{timbradoFile?.name}</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={removeTimbrado}>
                  <Trash2 size={16} /> Remover
                </button>
              </div>
            ) : (
              <label className="upload-label">
                <Upload size={32} />
                <span>Enviar Papel Timbrado (PDF)</span>
                <input 
                  ref={timbradoInputRef}
                  type="file" 
                  accept="application/pdf"
                  onChange={handleTimbradoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          <p className="timbrado-hint">
            O PDF será usado como plano de fundo da petição. Se não enviar, será gerado automaticamente.
          </p>
        </div>
      )}

      <div className="petition-form">
        {/* Dados Principais */}
        <div className="form-section">
          <h3 className="section-title">Dados da Petição</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Título da Petição *</label>
              <input
                type="text"
                placeholder="Ex: Petição Inicial, Contestação, Reclamação Trabalhista..."
                value={petitionData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Reclamante</label>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={petitionData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>CPF do Reclamante</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={petitionData.clientCpf}
                onChange={(e) => handleInputChange('clientCpf', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Ré</label>
              <input
                type="text"
                placeholder="Nome da empresa ré"
                value={petitionData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Nº do Processo</label>
              <input
                type="text"
                placeholder="0000000-00.0000.0.00.0000"
                value={petitionData.caseNumber}
                onChange={(e) => handleInputChange('caseNumber', e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Comarca/Vara</label>
              <input
                type="text"
                placeholder="Ex: 5ª Vara do Trabalho de Goiânia/GO"
                value={petitionData.court}
                onChange={(e) => handleInputChange('court', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Campos Customizados */}
        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title"><Plus size={20} /> Campos Adicionais</h3>
            <button className="btn btn-sm btn-outline" onClick={addCustomField}>
              <Plus size={16} /> Adicionar Campo
            </button>
          </div>
          {customFields.length > 0 && (
            <div className="custom-fields-list">
              {customFields.map(field => (
                <div key={field.id} className="custom-field-row">
                  <input
                    type="text"
                    placeholder="Nome do campo"
                    value={field.label}
                    onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                    className="field-label"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(field.id, { type: e.target.value as any })}
                    className="field-type"
                  >
                    <option value="text">Texto</option>
                    <option value="textarea">Texto Longo</option>
                    <option value="date">Data</option>
                    <option value="number">Número</option>
                  </select>
                  <input
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                    placeholder="Valor do campo"
                    value={petitionData.fieldValues[field.id] || ''}
                    onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                    className="field-value"
                  />
                  <button 
                    className="btn btn-icon btn-danger"
                    onClick={() => removeCustomField(field.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="form-section">
          <h3 className="section-title">Conteúdo da Petição</h3>
          <textarea
            className="form-textarea"
            placeholder="Digite o texto da petição aqui...

Dica: Separe cada parágrafo com uma linha em branco."
            value={petitionData.mainContent}
            onChange={(e) => handleInputChange('mainContent', e.target.value)}
            rows={15}
          />
        </div>

        {/* Rodapé Manual */}
        <div className="form-section">
          <h3 className="section-title"><Type size={20} /> Dados do Rodapé (Manual)</h3>
          <p className="section-hint">Preencha os dados do advogado que aparecerão na petição</p>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Nome do Advogado</label>
              <input
                type="text"
                placeholder="Ex: Dr. João Silva"
                value={petitionData.footerName}
                onChange={(e) => handleInputChange('footerName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>OAB</label>
              <input
                type="text"
                placeholder="OAB/GO 00.000"
                value={petitionData.footerOab}
                onChange={(e) => handleInputChange('footerOab', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                placeholder="Av. T-7, 500, Setor Bueno, Goiânia/GO"
                value={petitionData.footerAddress}
                onChange={(e) => handleInputChange('footerAddress', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                placeholder="(62) 99999-9999"
                value={petitionData.footerPhone}
                onChange={(e) => handleInputChange('footerPhone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="advogado@email.com"
                value={petitionData.footerEmail}
                onChange={(e) => handleInputChange('footerEmail', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-overlay">
          <div className="preview-modal">
            <div className="preview-header">
              <h2>Pré-visualização da Petição</h2>
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Imprimir
                </button>
                <button className="btn btn-outline" onClick={() => setShowPreview(false)}>
                  <X size={18} /> Fechar
                </button>
              </div>
            </div>
            <div className="preview-body">
              <iframe
                srcDoc={`<html><head><style>body { margin: 0; padding: 20px; background: #f0f0f0; } iframe { width: 100%; height: calc(100vh - 100px); border: none; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }</style></head><body><iframe srcdoc="${generateHTML().replace(/"/g, '&quot;')}"></iframe></body></html>`}
                title="Preview"
                className="preview-frame"
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button 
          className="btn btn-outline"
          onClick={() => setShowPreview(true)}
        >
          <Eye size={18} /> Visualizar
        </button>
        <button 
          className="btn btn-primary"
          onClick={handlePrint}
        >
          <Printer size={18} /> Imprimir
        </button>
      </div>
    </div>
  );
}
