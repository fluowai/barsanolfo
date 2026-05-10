import { useState, useMemo, useCallback } from 'react';
import {
  Scale, Phone, Calendar, Clock, AlertTriangle, ChevronRight,
  CheckCircle, XCircle, FileText, UserPlus, Briefcase,
  FileSignature, MessageSquare, Search, ArrowLeft,
  ClipboardList, Send, Save, ThumbsUp, ThumbsDown,
  Gavel, Heart, Users, Shield, Building, ShoppingCart,
  Landmark, Home, FileCheck, UserCheck, Plus,
  ChevronDown, ChevronUp, History, Check, X
} from 'lucide-react';

type LegalArea =
  | 'CRIMINAL'
  | 'FAMILIA'
  | 'TRABALHISTA'
  | 'PREVIDENCIARIO'
  | 'CIVEL'
  | 'EMPRESARIAL'
  | 'CONSUMIDOR'
  | 'TRIBUTARIO'
  | 'IMOBILIARIO'
  | 'ADMINISTRATIVO';

type Urgency = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

type TriageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'CONVERTED';

type ConversionType = 'PROPOSAL' | 'CONTRACT' | 'CLIENT';

interface TriageAnswer {
  question: string;
  answer: string;
}

interface TriageRecord {
  id: string;
  leadId: string;
  legalArea: LegalArea;
  answers: TriageAnswer[];
  summary: string;
  urgencyClassification: string;
  riskLevel: string;
  suggestedSteps: string[];
  documentsChecklist: string[];
  status: TriageStatus;
  internalNote: string;
  conversionType?: ConversionType;
  createdAt: string;
  completedAt?: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  legalArea: LegalArea;
  urgency: Urgency;
  createdAt: string;
  description: string;
  triages: TriageRecord[];
}

const LEGAL_AREA_LABELS: Record<LegalArea, string> = {
  CRIMINAL: 'Criminal',
  FAMILIA: 'Família',
  TRABALHISTA: 'Trabalhista',
  PREVIDENCIARIO: 'Previdenciário',
  CIVEL: 'Cível',
  EMPRESARIAL: 'Empresarial',
  CONSUMIDOR: 'Consumidor',
  TRIBUTARIO: 'Tributário',
  IMOBILIARIO: 'Imobiliário',
  ADMINISTRATIVO: 'Administrativo',
};

const URGENCY_COLORS: Record<Urgency, string> = {
  LOW: '',
  NORMAL: 'badge-blue',
  HIGH: 'badge-orange',
  URGENT: 'badge-red',
};

const URGENCY_LABELS: Record<Urgency, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const LEGAL_AREA_ICONS: Record<LegalArea, React.ReactNode> = {
  CRIMINAL: <Gavel size={16} />,
  FAMILIA: <Heart size={16} />,
  TRABALHISTA: <Briefcase size={16} />,
  PREVIDENCIARIO: <Shield size={16} />,
  CIVEL: <Scale size={16} />,
  EMPRESARIAL: <Building size={16} />,
  CONSUMIDOR: <ShoppingCart size={16} />,
  TRIBUTARIO: <Landmark size={16} />,
  IMOBILIARIO: <Home size={16} />,
  ADMINISTRATIVO: <ClipboardList size={16} />,
};

const AREA_QUESTIONS: Record<LegalArea, { id: string; question: string; type: 'yesno' | 'text' | 'select'; options?: string[] }[]> = {
  CRIMINAL: [
    { id: 'preso', question: 'O cliente foi preso?', type: 'yesno' },
    { id: 'flagrante', question: 'Está em flagrante?', type: 'yesno' },
    { id: 'audiencia_custodia', question: 'Já passou por audiência de custódia?', type: 'yesno' },
    { id: 'bo', question: 'Existe BO?', type: 'yesno' },
    { id: 'inquerito', question: 'Existe inquérito policial?', type: 'yesno' },
    { id: 'intimacao', question: 'Recebeu intimação?', type: 'yesno' },
    { id: 'delegacia', question: 'Qual delegacia?', type: 'text' },
    { id: 'vara', question: 'Qual vara?', type: 'text' },
    { id: 'crime', question: 'Qual crime investigado?', type: 'text' },
    { id: 'medida_cautelar', question: 'Existe medida cautelar?', type: 'yesno' },
    { id: 'audiencia_marcada', question: 'Existe audiência marcada?', type: 'yesno' },
    { id: 'prazo_andamento', question: 'Existe prazo em andamento?', type: 'yesno' },
    { id: 'soltou_preso', question: 'Cliente está solto ou preso?', type: 'select', options: ['Solto', 'Preso'] },
    { id: 'unidade_prisional', question: 'Unidade prisional?', type: 'text' },
    { id: 'observacoes', question: 'Observações urgentes', type: 'text' },
  ],
  FAMILIA: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Divórcio', 'Guarda', 'Pensão', 'Alimentos', 'Inventário', 'Partilha', 'Medida Protetiva'] },
    { id: 'acordo', question: 'Existe acordo?', type: 'yesno' },
    { id: 'filho_menor', question: 'Existe filho menor?', type: 'yesno' },
    { id: 'bens', question: 'Existem bens?', type: 'yesno' },
    { id: 'audiencia', question: 'Existe audiência?', type: 'yesno' },
    { id: 'documentos_pendentes', question: 'Documentos pendentes', type: 'text' },
  ],
  TRABALHISTA: [
    { id: 'reclamante_reclamada', question: 'Reclamante ou reclamada', type: 'select', options: ['Reclamante', 'Reclamada'] },
    { id: 'data_admissao', question: 'Data de admissão', type: 'text' },
    { id: 'data_demissao', question: 'Data de demissão', type: 'text' },
    { id: 'salario', question: 'Salário', type: 'text' },
    { id: 'verbas_pendentes', question: 'Verbas pendentes', type: 'text' },
    { id: 'horas_extras', question: 'Horas extras', type: 'text' },
    { id: 'fgts', question: 'FGTS', type: 'text' },
    { id: 'rescisao', question: 'Rescisão', type: 'text' },
    { id: 'testemunhas', question: 'Testemunhas', type: 'text' },
    { id: 'documentos', question: 'Documentos', type: 'text' },
    { id: 'audiencia_marcada', question: 'Audiência marcada', type: 'yesno' },
    { id: 'tentativa_acordo', question: 'Tentativa de acordo', type: 'yesno' },
  ],
  PREVIDENCIARIO: [
    { id: 'tipo_beneficio', question: 'Tipo de benefício pretendido', type: 'select', options: ['Aposentadoria', 'Pensão por Morte', 'Auxílio-Doença', 'BPC/LOAS', 'Salário-Maternidade', 'Auxílio-Acidente', 'Revisão'] },
    { id: 'ja_recebe', question: 'Já recebe algum benefício?', type: 'yesno' },
    { id: 'negado_inss', question: 'Já foi negado pelo INSS?', type: 'yesno' },
    { id: 'tempo_contribuicao', question: 'Tempo de contribuição', type: 'text' },
    { id: 'idade', question: 'Idade do cliente', type: 'text' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
    { id: 'exame_medico', question: 'Possui exames médicos?', type: 'yesno' },
  ],
  CIVEL: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Cobrança', 'Indenização', 'Contratos', 'Responsabilidade Civil', 'Direito do Consumidor', 'Direito Imobiliário', 'Acidente de Trânsito', 'Outros'] },
    { id: 'valor_causa', question: 'Valor estimado da causa', type: 'text' },
    { id: 'partes_envolvidas', question: 'Partes envolvidas', type: 'text' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
    { id: 'prazo', question: 'Existe prazo?', type: 'yesno' },
    { id: 'tentativa_acordo', question: 'Houve tentativa de acordo?', type: 'yesno' },
  ],
  EMPRESARIAL: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Contratos Societários', 'Due Diligence', 'Recuperação Judicial', 'Fusão/Aquisição', 'Governança Corporativa', 'Registro Empresarial', 'Outros'] },
    { id: 'empresa_tipo', question: 'Tipo de empresa', type: 'text' },
    { id: 'faturamento', question: 'Faturamento estimado', type: 'text' },
    { id: 'socios', question: 'Número de sócios', type: 'text' },
    { id: 'contrato_social', question: 'Possui contrato social?', type: 'yesno' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
  ],
  CONSUMIDOR: [
    { id: 'tipo_problema', question: 'Tipo de problema', type: 'select', options: ['Produto com defeito', 'Serviço não prestado', 'Cobrança indevida', 'Negativação indevida', 'Venda casada', 'Publicidade enganosa', 'Outros'] },
    { id: 'fornecedor', question: 'Nome do fornecedor', type: 'text' },
    { id: 'valor', question: 'Valor da causa', type: 'text' },
    { id: 'tentativa_solucao', question: 'Tentou solução administrativa?', type: 'yesno' },
    { id: 'protocolo', question: 'Possui protocolo?', type: 'text' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
  ],
  TRIBUTARIO: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Execução Fiscal', 'Pedido de Restituição', 'Compensação Tributária', 'Planejamento Tributário', 'Contencioso Administrativo', 'Outros'] },
    { id: 'tributo', question: 'Tributo envolvido', type: 'text' },
    { id: 'valor', question: 'Valor da causa', type: 'text' },
    { id: 'esfera', question: 'Esfera', type: 'select', options: ['Federal', 'Estadual', 'Municipal'] },
    { id: 'processo_admin', question: 'Existe processo administrativo?', type: 'yesno' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
  ],
  IMOBILIARIO: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Compra e Venda', 'Locação', 'Usucapião', 'Incorporação', 'Regularização', 'Condomínio', 'Outros'] },
    { id: 'imovel_tipo', question: 'Tipo de imóvel', type: 'text' },
    { id: 'valor', question: 'Valor do imóvel', type: 'text' },
    { id: 'matricula', question: 'Possui matrícula?', type: 'yesno' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
  ],
  ADMINISTRATIVO: [
    { id: 'tipo_demanda', question: 'Tipo de demanda', type: 'select', options: ['Licitação', 'Contrato Administrativo', 'Servidor Público', 'Processo Administrativo', 'Licenciamento', 'Outros'] },
    { id: 'orgao', question: 'Órgão envolvido', type: 'text' },
    { id: 'esfera', question: 'Esfera', type: 'select', options: ['Federal', 'Estadual', 'Municipal'] },
    { id: 'prazo', question: 'Existe prazo?', type: 'yesno' },
    { id: 'documentos', question: 'Documentos disponíveis', type: 'text' },
  ],
};

const MOCK_LEADS: Lead[] = [
  {
    id: '1', name: 'Carlos Alberto Mendes', phone: '(11) 99999-1101',
    legalArea: 'CRIMINAL', urgency: 'URGENT', createdAt: '2026-05-10T08:15:00',
    description: 'Preso em flagrante por tráfico de drogas. Já passou por audiência de custódia. Família busca advogado criminalista urgente.',
    triages: [
      {
        id: 't1', leadId: '1', legalArea: 'CRIMINAL',
        answers: [
          { question: 'O cliente foi preso?', answer: 'Sim' },
          { question: 'Está em flagrante?', answer: 'Sim' },
        ],
        summary: 'Cliente preso em flagrante por tráfico. Audiência de custódia já realizada.',
        urgencyClassification: 'Urgente - Necessita ação imediata',
        riskLevel: 'Alto - Prisão preventiva possível',
        suggestedSteps: ['Solicitar relaxamento da prisão', 'Verificar legalidade do flagrante', 'Impetrar HC se necessário'],
        documentsChecklist: ['BO', 'Auto de Prisão em Flagrante', 'Documentos pessoais'],
        status: 'COMPLETED', internalNote: '', createdAt: '2026-05-10T09:00:00', completedAt: '2026-05-10T09:30:00',
      },
    ],
  },
  {
    id: '2', name: 'Ana Paula Oliveira', phone: '(21) 98888-2202',
    legalArea: 'FAMILIA', urgency: 'HIGH', createdAt: '2026-05-09T14:30:00',
    description: 'Divórcio litigioso com partilha de bens. Casal tem dois filhos menores. Necessita definição de guarda e pensão.',
    triages: [],
  },
  {
    id: '3', name: 'Roberto Souza Lima', phone: '(31) 97777-3303',
    legalArea: 'TRABALHISTA', urgency: 'NORMAL', createdAt: '2026-05-08T10:00:00',
    description: 'Reclamação trabalhista após 8 anos de empresa. FGTS não depositado, verbas rescisórias pendentes.',
    triages: [],
  },
  {
    id: '4', name: 'Maria José Santos', phone: '(41) 96666-4404',
    legalArea: 'PREVIDENCIARIO', urgency: 'HIGH', createdAt: '2026-05-07T16:45:00',
    description: 'Aposentadoria por idade rural negada pelo INSS. Cliente com 62 anos, trabalhadora rural.',
    triages: [],
  },
  {
    id: '5', name: 'Fernando Costa', phone: '(51) 95555-5505',
    legalArea: 'CIVEL', urgency: 'NORMAL', createdAt: '2026-05-06T11:20:00',
    description: 'Ação de cobrança de R$ 50.000,00 referente a contrato de prestação de serviços não pago.',
    triages: [],
  },
  {
    id: '6', name: 'Juliana Martins Rocha', phone: '(61) 94444-6606',
    legalArea: 'CRIMINAL', urgency: 'URGENT', createdAt: '2026-05-10T07:00:00',
    description: 'Mandado de prisão preventiva expedido. Cliente se apresentou voluntariamente. Necessidade de revogação.',
    triages: [],
  },
  {
    id: '7', name: 'Lucas Pereira', phone: '(71) 93333-7707',
    legalArea: 'CONSUMIDOR', urgency: 'NORMAL', createdAt: '2026-05-05T09:10:00',
    description: 'Produto com defeito comprado há 3 meses. Fornecedor se recusa a trocar ou devolver o valor.',
    triages: [],
  },
  {
    id: '8', name: 'Patrícia Albuquerque', phone: '(81) 92222-8808',
    legalArea: 'TRIBUTARIO', urgency: 'HIGH', createdAt: '2026-05-04T13:55:00',
    description: 'Execução fiscal de IPTU no valor de R$ 120.000,00. Empresa corre risco de penhora.',
    triages: [],
  },
];

const generateSummary = (area: LegalArea, answers: Record<string, string>): {
  summary: string;
  urgency: string;
  risk: string;
  steps: string[];
  documents: string[];
} => {
  switch (area) {
    case 'CRIMINAL': {
      const preso = answers['preso'];
      const flagrante = answers['flagrante'];
      const crime = answers['crime'] || 'não informado';
      const soltoPreso = answers['soltou_preso'];
      let summary = `Cliente ${preso === 'Sim' ? 'foi preso' : 'não foi preso'}`;
      if (flagrante === 'Sim') summary += ' em flagrante';
      summary += `. Crime investigado: ${crime}. Cliente está ${soltoPreso || 'com situação não informada'}.`;
      let urgency = 'Normal';
      let risk = 'Moderado';
      if (preso === 'Sim') { urgency = 'Urgente'; risk = 'Alto'; }
      if (soltoPreso === 'Preso') { urgency = 'Urgente'; risk = 'Alto'; }
      return {
        summary,
        urgency,
        risk,
        steps: [
          preso === 'Sim' ? 'Solicitar relaxamento da prisão ou liberdade provisória' : 'Acompanhamento processual preventivo',
          flagrante === 'Sim' ? 'Analisar legalidade do flagrante' : 'Verificar andamento do inquérito',
          'Agendar reunião com familiares',
          risk === 'Alto' ? 'Preparar HC preventivo' : 'Acompanhamento ordinário',
        ],
        documents: [
          'Auto de Prisão em Flagrante',
          'Boletim de Ocorrência',
          'Documentos pessoais do cliente',
          'Comprovante de endereço',
          'Procuração',
        ],
      };
    }
    case 'FAMILIA': {
      const tipo = answers['tipo_demanda'] || 'não informado';
      const filhos = answers['filho_menor'];
      const bens = answers['bens'];
      let summary = `Demanda de ${tipo}`;
      if (filhos === 'Sim') summary += ' com filho(s) menor(es)';
      if (bens === 'Sim') summary += ' e bens a partilhar';
      summary += '.';
      return {
        summary,
        urgency: 'Normal',
        risk: bens === 'Sim' || filhos === 'Sim' ? 'Alto - Conflito potencial' : 'Moderado',
        steps: [
          'Levantar documentação completa',
          filhos === 'Sim' ? 'Definir guarda e pensão' : 'Prosseguir com divórcio',
          bens === 'Sim' ? 'Realizar inventário de bens' : 'Sem bens a partilhar',
          'Agendar mediação se aplicável',
        ],
        documents: [
          'Certidão de casamento',
          'Certidão de nascimento dos filhos',
          'Documentos de bens',
          'Comprovante de renda',
          'Extratos bancários',
        ],
      };
    }
    case 'TRABALHISTA': {
      const reclamante = answers['reclamante_reclamada'];
      const adm = answers['data_admissao'] || 'não informada';
      const dem = answers['data_demissao'] || 'não informada';
      const salario = answers['salario'] || 'não informado';
      let summary = `Parte ${reclamante || 'não informada'}. Admissão: ${adm}, Demissão: ${dem}. Salário: ${salario}.`;
      return {
        summary,
        urgency: 'Normal',
        risk: 'Moderado',
        steps: [
          'Solicitar documentos trabalhistas',
          'Calcular verbas rescisórias',
          'Verificar FGTS',
          'Preparar petição inicial',
        ],
        documents: [
          'CTPS',
          'Contrato de trabalho',
          'Holerites',
          'Termo de rescisão',
          'Extrato FGTS',
          'Comprovante de endereço',
        ],
      };
    }
    case 'PREVIDENCIARIO': {
      const tipo = answers['tipo_beneficio'] || 'não informado';
      const negado = answers['negado_inss'];
      let summary = `Benefício pretendido: ${tipo}.`;
      if (negado === 'Sim') summary += ' Já foi negado pelo INSS.';
      return {
        summary,
        urgency: 'Alta',
        risk: 'Moderado',
        steps: [
          'Solicitar documentos pessoais',
          'Verificar tempo de contribuição',
          negado === 'Sim' ? 'Analisar motivo da negativa' : 'Avaliar viabilidade do pedido',
          'Preparar requerimento administrativo ou judicial',
        ],
        documents: [
          'RG e CPF',
          'Comprovante de residência',
          'Carteira de trabalho',
          'Extrato CNIS',
          'Documentos rurais (se aplicável)',
          'Laudos médicos (se aplicável)',
        ],
      };
    }
    case 'CIVEL': {
      const tipo = answers['tipo_demanda'] || 'não informado';
      const valor = answers['valor_causa'] || 'não informado';
      let summary = `Demanda cível: ${tipo}. Valor estimado: ${valor}.`;
      return {
        summary,
        urgency: 'Normal',
        risk: 'Moderado',
        steps: [
          'Analisar documentos contratuais',
          'Verificar prazos prescricionais',
          'Preparar petição inicial',
          'Avaliar possibilidade de acordo',
        ],
        documents: [
          'Contratos e documentos relacionados',
          'Comprovantes de pagamento',
          'Documentos pessoais',
          'Provas documentais',
          'Correspondências',
        ],
      };
    }
    default: {
      return {
        summary: `Triagem para área ${LEGAL_AREA_LABELS[area]} em andamento.`,
        urgency: 'Normal',
        risk: 'Moderado',
        steps: ['Analisar documentação', 'Agendar reunião', 'Preparar minuta'],
        documents: ['Documentos pessoais', 'Comprovante de endereço', 'Procuração'],
      };
    }
  }
};

const TriagePage: React.FC = () => {
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<LegalArea | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<'list' | 'form' | 'summary'>('list');
  const [internalNote, setInternalNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [activeSection, setActiveSection] = useState<'answers' | 'summary' | 'actions'>('answers');
  const [conversionModal, setConversionModal] = useState<ConversionType | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const pendingCount = useMemo(() => leads.filter(l => l.triages.every(t => t.status !== 'APPROVED' && t.status !== 'REJECTED')).length, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm);
      const matchesArea = !areaFilter || l.legalArea === areaFilter;
      const hasCompleted = l.triages.some(t => t.status === 'COMPLETED' || t.status === 'APPROVED' || t.status === 'REJECTED');
      if (statusFilter === 'pending') return matchesSearch && matchesArea && !hasCompleted;
      if (statusFilter === 'completed') return matchesSearch && matchesArea && hasCompleted;
      return matchesSearch && matchesArea;
    });
  }, [leads, searchTerm, areaFilter, statusFilter]);

  const leadHistory = useMemo(() => {
    if (!selectedLead) return [];
    return [...selectedLead.triages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedLead]);

  const handleStartTriage = (lead: Lead) => {
    setSelectedLead(lead);
    setAnswers({});
    setInternalNote('');
    setCurrentStep('form');
    setActiveSection('answers');
    setShowHistory(false);
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateSummary = () => {
    setActiveSection('summary');
    setCurrentStep('summary');
  };

  const summaryData = useMemo(() => {
    if (!selectedLead || currentStep !== 'summary') return null;
    return generateSummary(selectedLead.legalArea, answers);
  }, [selectedLead, currentStep, answers]);

  const handleApprove = () => {
    setToastMessage('Triagem aprovada com sucesso!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleReject = () => {
    setToastMessage('Triagem rejeitada.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleConvert = (type: ConversionType) => {
    setConversionModal(type);
    setToastMessage(`Convertido para ${type === 'PROPOSAL' ? 'Proposta' : type === 'CONTRACT' ? 'Contrato' : 'Cliente'}`);
    setTimeout(() => setToastMessage(''), 3000);
    setConversionModal(null);
  };

  const handleBack = () => {
    setCurrentStep('list');
    setSelectedLead(null);
    setAnswers({});
    setInternalNote('');
    setActiveSection('answers');
    setShowHistory(false);
  };

  const questions = useMemo(() => {
    if (!selectedLead) return [];
    return AREA_QUESTIONS[selectedLead.legalArea] || [];
  }, [selectedLead]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const showToast = toastMessage ? (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dim))',
      color: '#080808', padding: '12px 24px', borderRadius: 'var(--radius-lg)',
      fontWeight: 600, boxShadow: '0 8px 32px rgba(228,194,58,0.3)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeIn 0.3s ease',
    }}>
      <Check size={18} />
      {toastMessage}
    </div>
  ) : null;

  return (
    <div className="triage-page" style={{ maxWidth: 1400, animation: 'fadeIn 0.3s ease' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .triage-lead-card { cursor: pointer; transition: all 0.2s ease; }
        .triage-lead-card:hover { border-color: var(--gold-primary) !important; box-shadow: var(--shadow-gold); transform: translateY(-2px); }
        .triage-lead-card.selected { border-color: var(--gold-primary) !important; box-shadow: 0 0 0 2px var(--gold-glow); }
        .triage-form-card { animation: slideIn 0.3s ease; }
        .urgent-pulse { animation: pulse 2s infinite; }
        .triage-section-btn { padding: 10px 16px; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: transparent; color: var(--text-secondary); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .triage-section-btn:hover { border-color: var(--gold-primary); color: var(--gold-primary); }
        .triage-section-btn.active { border-color: var(--gold-primary); color: var(--gold-primary); background: var(--gold-glow); }
        .triage-history-item { border-left: 2px solid var(--border-default); padding-left: 16px; position: relative; }
        .triage-history-item::before { content: ''; position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold-primary); }
        .form-textarea { min-height: 80px; resize: vertical; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        .modal-content { background: var(--bg-card); border: 1px solid var(--border-default); border-radius: var(--radius-xl); padding: 32px; max-width: 480px; width: 90%; box-shadow: var(--shadow-xl); }
        .lead-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background: var(--gold-glow); color: var(--gold-primary); }
        .lead-tag.neutral { background: var(--bg-hover); color: var(--text-secondary); }
      `}</style>

      {showToast}

      {currentStep === 'list' && (
        <>
          <div className="page-header" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 40, paddingBottom: 30, borderBottom: '2px solid var(--border-default)', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <h1 className="page-title" style={{
                fontSize: 32, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-hover))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', marginBottom: 8,
              }}>
                Triagem Jurídica
              </h1>
              <p className="page-subtitle" style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                Realize a triagem estruturada de leads antes da reunião ou contratação
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-card" style={{ padding: '12px 20px', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <ClipboardList size={24} style={{ color: 'var(--gold-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pendentes</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{pendingCount}</div>
                </div>
              </div>
              <div className="stat-card" style={{ padding: '12px 20px', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={24} style={{ color: 'var(--green)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Triados</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{leads.filter(l => l.triages.some(t => t.status === 'COMPLETED')).length}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 30, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{
              flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
              border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 16px',
              color: 'var(--text-tertiary)', transition: 'all 0.2s ease',
            }}>
              <Search size={18} />
              <input
                type="text" placeholder="Buscar por nome ou telefone..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
              />
            </div>
            <div className="filter-group" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
              border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 16px',
            }}>
              <ClipboardList size={16} style={{ color: 'var(--text-tertiary)' }} />
              <select
                value={areaFilter} onChange={e => setAreaFilter(e.target.value as LegalArea | '')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Todas as áreas</option>
                {Object.entries(LEGAL_AREA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="filter-group" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
              border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 16px',
            }}>
              <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
              >
                <option value="pending">Pendentes</option>
                <option value="completed">Triados</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {filteredLeads.length === 0 && (
              <div className="empty-state" style={{
                gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)',
              }}>
                <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: 16 }}>Nenhum lead encontrado com os filtros atuais.</p>
              </div>
            )}
            {filteredLeads.map(lead => {
              const hasCompleted = lead.triages.some(t => t.status === 'COMPLETED' || t.status === 'APPROVED' || t.status === 'REJECTED');
              return (
                <div
                  key={lead.id}
                  className="card triage-lead-card"
                  onClick={() => handleStartTriage(lead)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)', padding: 20,
                    display: 'flex', flexDirection: 'column', gap: 12,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {lead.urgency === 'URGENT' && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: 'var(--red)', color: '#fff', fontSize: '0.625rem',
                      fontWeight: 700, padding: '3px 12px', borderRadius: '0 0 0 8px',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Urgente
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15, marginBottom: 2 }}>{lead.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 13 }}>
                        <Phone size={12} /> {lead.phone}
                      </div>
                    </div>
                    <div className="lead-tag" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 500,
                      background: 'var(--gold-glow)', color: 'var(--gold-primary)',
                    }}>
                      {LEGAL_AREA_ICONS[lead.legalArea]}
                      {LEGAL_AREA_LABELS[lead.legalArea]}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lead.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 12 }}>
                      <Calendar size={13} />
                      {formatDate(lead.createdAt)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {hasCompleted && (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle size={11} /> Triado
                        </span>
                      )}
                      <span className={`badge ${URGENCY_COLORS[lead.urgency]}`} style={{ fontSize: '0.7rem' }}>
                        {URGENCY_LABELS[lead.urgency]}
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(currentStep === 'form' || currentStep === 'summary') && selectedLead && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <button
            onClick={handleBack}
            className="btn btn-ghost"
            style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ArrowLeft size={18} />
            Voltar para lista
          </button>

          <div className="card" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          }}>
            <div className="card-header" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 28px', borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-elevated)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                  background: 'var(--gold-glow)', color: 'var(--gold-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {LEGAL_AREA_ICONS[selectedLead.legalArea]}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {selectedLead.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {selectedLead.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Scale size={12} /> {LEGAL_AREA_LABELS[selectedLead.legalArea]}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge ${URGENCY_COLORS[selectedLead.urgency]}`}>
                  {URGENCY_LABELS[selectedLead.urgency]}
                </span>
                {selectedLead.triages.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowHistory(!showHistory)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                  >
                    <History size={14} />
                    {showHistory ? 'Ocultar' : 'Histórico'} ({selectedLead.triages.length})
                  </button>
                )}
              </div>
            </div>

            <div className="card-body" style={{ padding: '24px 28px' }}>
              {showHistory && selectedLead.triages.length > 0 && (
                <div style={{
                  marginBottom: 24, padding: 16,
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-default)',
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <History size={16} /> Histórico de Triagens
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {leadHistory.map(triage => (
                      <div key={triage.id} className="triage-history-item" style={{
                        borderLeft: '2px solid var(--border-default)', paddingLeft: 16, position: 'relative',
                      }}>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                          {formatDateTime(triage.createdAt)}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span className={`badge ${triage.status === 'APPROVED' ? 'badge-green' : triage.status === 'REJECTED' ? 'badge-red' : triage.status === 'COMPLETED' ? 'badge-blue' : 'badge-gold'}`}>
                            {triage.status === 'APPROVED' ? 'Aprovado' : triage.status === 'REJECTED' ? 'Rejeitado' : triage.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                          </span>
                          {triage.conversionType && (
                            <span className="badge badge-gold">
                              Convertido: {triage.conversionType === 'PROPOSAL' ? 'Proposta' : triage.conversionType === 'CONTRACT' ? 'Contrato' : 'Cliente'}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{triage.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button
                  className={`triage-section-btn ${activeSection === 'answers' ? 'active' : ''}`}
                  onClick={() => { setActiveSection('answers'); setCurrentStep('form'); }}
                >
                  <ClipboardList size={14} style={{ marginRight: 6 }} />
                  Questionário
                </button>
                <button
                  className={`triage-section-btn ${activeSection === 'summary' ? 'active' : ''}`}
                  onClick={() => { if (Object.keys(answers).length > 0) { setActiveSection('summary'); setCurrentStep('summary'); } }}
                  disabled={Object.keys(answers).length === 0}
                  style={{ opacity: Object.keys(answers).length === 0 ? 0.4 : 1 }}
                >
                  <FileText size={14} style={{ marginRight: 6 }} />
                  Resumo
                </button>
                <button
                  className={`triage-section-btn ${activeSection === 'actions' ? 'active' : ''}`}
                  onClick={() => { if (Object.keys(answers).length > 0) { setActiveSection('actions'); setCurrentStep('summary'); } }}
                  disabled={Object.keys(answers).length === 0}
                  style={{ opacity: Object.keys(answers).length === 0 ? 0.4 : 1 }}
                >
                  <CheckCircle size={14} style={{ marginRight: 6 }} />
                  Ações
                </button>
              </div>

              {activeSection === 'answers' && (
                <div className="triage-form-card">
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                    Preencha as informações abaixo para realizar a triagem jurídica do lead.
                    Os campos variam de acordo com a área jurídica selecionada.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {questions.map(q => (
                      <div key={q.id}>
                        {q.type === 'yesno' && (
                          <div>
                            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                              {q.question}
                            </label>
                            <div style={{ display: 'flex', gap: 16 }}>
                              {['Sim', 'Não'].map(opt => (
                                <label key={opt} className="form-radio" style={{
                                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)',
                                }}>
                                  <input
                                    type="radio" name={q.id} value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={() => handleAnswerChange(q.id, opt)}
                                    style={{ accentColor: 'var(--gold-primary)' }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        {q.type === 'select' && q.options && (
                          <div className="form-group">
                            <label className="form-label">{q.question}</label>
                            <select
                              className="form-select"
                              value={answers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              style={{ marginTop: 4 }}
                            >
                              <option value="">Selecione...</option>
                              {q.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {q.type === 'text' && (
                          <div className="form-group">
                            <label className="form-label">{q.question}</label>
                            {q.id === 'observacoes' || q.id === 'documentos' || q.id === 'documentos_pendentes' ? (
                              <textarea
                                className="form-textarea"
                                value={answers[q.id] || ''}
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Descreva..."
                                style={{ marginTop: 4, minHeight: 80 }}
                              />
                            ) : (
                              <input
                                className="form-input"
                                type="text"
                                value={answers[q.id] || ''}
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                placeholder="Informe..."
                                style={{ marginTop: 4 }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {questions.length > 0 && Object.keys(answers).length > 0 && (
                    <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-gold"
                        onClick={handleGenerateSummary}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <FileText size={18} />
                        Gerar Resumo da Triagem
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'summary' && summaryData && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div className="alert alert-gold" style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '16px 20px', borderRadius: 'var(--radius-md)',
                    background: 'var(--gold-glow)', border: '1px solid rgba(228,194,58,0.2)',
                    marginBottom: 24,
                  }}>
                    <FileText size={20} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--gold-primary)', marginBottom: 4 }}>Resumo Automático</div>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                        {summaryData.summary}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div className="card" style={{
                      padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                    }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={14} style={{ color: summaryData.urgency === 'Urgente' ? 'var(--red)' : 'var(--orange)' }} />
                        Urgência
                      </div>
                      <div style={{
                        fontSize: 20, fontWeight: 700,
                        color: summaryData.urgency === 'Urgente' ? 'var(--red)' : summaryData.urgency === 'Alta' ? 'var(--orange)' : 'var(--text-primary)',
                      }}>
                        {summaryData.urgency}
                      </div>
                    </div>
                    <div className="card" style={{
                      padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                    }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Shield size={14} style={{ color: summaryData.risk === 'Alto' ? 'var(--red)' : 'var(--orange)' }} />
                        Risco
                      </div>
                      <div style={{
                        fontSize: 20, fontWeight: 700,
                        color: summaryData.risk.includes('Alto') ? 'var(--red)' : summaryData.risk.includes('Alto') ? 'var(--orange)' : 'var(--text-primary)',
                      }}>
                        {summaryData.risk}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <div className="card" style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)', padding: 20,
                    }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ChevronRight size={16} style={{ color: 'var(--gold-primary)' }} />
                        Próximos Passos Sugeridos
                      </h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {summaryData.steps.map((step, i) => (
                          <li key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                          }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: '50%',
                              background: 'var(--gold-glow)', color: 'var(--gold-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                            }}>{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="card" style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)', padding: 20,
                    }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileCheck size={16} style={{ color: 'var(--gold-primary)' }} />
                        Checklist de Documentos
                      </h4>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {summaryData.documents.map((doc, i) => (
                          <li key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 13, color: 'var(--text-secondary)',
                          }}>
                            <FileText size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'actions' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ marginBottom: 8, display: 'block', fontSize: 14 }}>
                      Anotação Interna (visível apenas para a equipe)
                    </label>
                    <textarea
                      className="form-textarea"
                      value={internalNote}
                      onChange={e => setInternalNote(e.target.value)}
                      placeholder="Adicione observações internas sobre esta triagem..."
                      style={{ minHeight: 100, width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleApprove}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <ThumbsUp size={18} />
                      Aprovar Triagem
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleReject}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <ThumbsDown size={18} />
                      Rejeitar Triagem
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setInternalNote('')}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <X size={18} />
                      Limpar Anotação
                    </button>
                  </div>

                  <div style={{
                    padding: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                  }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserPlus size={16} style={{ color: 'var(--gold-primary)' }} />
                      Conversão
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                      Após aprovação da triagem, converta o lead em:
                    </p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-gold"
                        onClick={() => handleConvert('PROPOSAL')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <FileSignature size={18} />
                        Criar Proposta
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConvert('CONTRACT')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <FileText size={18} />
                        Gerar Contrato
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleConvert('CLIENT')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <UserCheck size={18} />
                        Cadastrar Cliente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {conversionModal && (
        <div className="modal-overlay" onClick={() => setConversionModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={20} style={{ color: 'var(--gold-primary)' }} />
                {conversionModal === 'PROPOSAL' ? 'Criar Proposta' : conversionModal === 'CONTRACT' ? 'Gerar Contrato' : 'Cadastrar Cliente'}
              </h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setConversionModal(null)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {conversionModal === 'PROPOSAL'
                ? 'Uma minuta de proposta será gerada com base nos dados da triagem.'
                : conversionModal === 'CONTRACT'
                ? 'Um contrato preliminar será gerado com as informações coletadas.'
                : 'O lead será cadastrado como cliente no sistema com os dados da triagem.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConversionModal(null)}>Cancelar</button>
              <button className="btn btn-gold" onClick={() => handleConvert(conversionModal)}>
                <Check size={16} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TriagePage;
