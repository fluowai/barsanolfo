import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

const analyzeCaseSchema = z.object({
  caseId: z.string().min(1, 'ID do processo é obrigatório'),
});

interface CaseData {
  number: string;
  type: string;
  status: string;
  court?: string;
  value?: number;
  filedDate?: string;
  client?: { name: string; email: string; phone: string };
  movements?: Array<{ date: string; description: string; type?: string }>;
  deadlines?: Array<{ description: string; dueDate: string; completed: boolean }>;
}

// POST /api/ai/analyze-case
router.post('/ai/analyze-case', async (req: Request, res: Response) => {
  try {
    const { caseId } = analyzeCaseSchema.parse(req.body);

    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configError || !aiConfig) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma configuração de IA ativa. Configure em /painel/configuracoes'
      });
    }

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        number, type, court, status, value, filed_date,
        client:clients(name, email, phone),
        case_movements(date, description, type),
        deadlines(description, due_date, completed)
      `)
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return res.status(404).json({ success: false, message: 'Processo não encontrado' });
    }

    const typedCase = caseData as unknown as CaseData;

    const prompt = buildAnalysisPrompt(typedCase);

    let analysis: string;
    try {
      if (aiConfig.provider.toLowerCase() === 'gemini') {
        analysis = await callGemini(aiConfig.api_key, aiConfig.model || 'gemini-pro', prompt);
      } else if (aiConfig.provider.toLowerCase() === 'openai') {
        analysis = await callOpenAI(aiConfig.api_key, aiConfig.model || 'gpt-4o-mini', prompt);
      } else {
        return res.status(400).json({ success: false, message: 'Provider não suportado' });
      }
    } catch (aiError: any) {
      console.error('Erro na chamada da IA:', aiError);
      analysis = generateLocalAnalysis(typedCase);
    }

    res.json({ success: true, analysis });

  } catch (error: any) {
    console.error('Erro na análise de processo:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Erro interno ao analisar processo' });
  }
});

// POST /api/ai/generate-petition
router.post('/ai/generate-petition', async (req: Request, res: Response) => {
  try {
    const { title, facts, legalBasis } = req.body;

    const { data: aiConfig } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!aiConfig) {
      return res.status(400).json({ success: false, message: 'IA não configurada' });
    }

    const prompt = `Gere uma petição jurídica inicial com os seguintes dados:\n\nTítulo: ${title}\n\nFatos: ${facts}\n\nFundamentos Jurídicos: ${legalBasis}\n\nFormato: Petição inicial estruturada com cabeçalho, qualificação das partes, fatos, direito, pedidos e valor da causa. Use linguagem jurídica formal brasileira.`;

    let content: string;
    try {
      if (aiConfig.provider.toLowerCase() === 'gemini') {
        content = await callGemini(aiConfig.api_key, aiConfig.model || 'gemini-pro', prompt);
      } else {
        content = await callOpenAI(aiConfig.api_key, aiConfig.model || 'gpt-4o-mini', prompt);
      }
    } catch {
      content = `PETIÇÃO INICIAL\n\nEXMO(A). SENHOR(A). DOUTOR(A). JUIZ(A). DA ...\n\n[Conteúdo gerado automaticamente - edite conforme necessário]\n\n${facts}\n\nDireito:\n${legalBasis}\n\nPedidos:\n...\n\nValor da causa: R$ ...\n\nLocal e data.`;
    }

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao gerar petição' });
  }
});

// POST /api/ai/analyze-deadlines
router.post('/ai/analyze-deadlines', async (req: Request, res: Response) => {
  try {
    const { data: aiConfig } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!aiConfig) {
      return res.status(400).json({ success: false, message: 'IA não configurada' });
    }

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 15);
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select(`
        description, due_date, completed,
        case:cases(number, type, status, client:clients(name))
      `)
      .eq('completed', false)
      .lte('due_date', nextWeek.toISOString())
      .order('due_date', { ascending: true });

    if (!deadlines || deadlines.length === 0) {
      return res.json({ success: true, analysis: 'Nenhum prazo crítico detectado para os próximos 15 dias.' });
    }

    const prompt = `Analise os seguintes prazos processuais e forneça recomendações:\n\n${
      deadlines.map((d: any) => `- ${d.description} (${d.case?.number}) - Vence em: ${new Date(d.due_date).toLocaleDateString('pt-BR')}`).join('\n')
    }\n\nForneça: 1) Prazos mais críticos, 2) Sugestão de priorização, 3) Riscos jurídicos.`;

    let analysis: string;
    try {
      if (aiConfig.provider.toLowerCase() === 'gemini') {
        analysis = await callGemini(aiConfig.api_key, aiConfig.model || 'gemini-pro', prompt);
      } else {
        analysis = await callOpenAI(aiConfig.api_key, aiConfig.model || 'gpt-4o-mini', prompt);
      }
    } catch {
      analysis = `ANÁLISE DE PRAZOS\n\n${deadlines.length} prazo(s) encontrado(s) para os próximos 15 dias.\n\nCRÍTICOS (menos de 5 dias):\n${
        deadlines.filter((d: any) => {
          const diff = new Date(d.due_date).getTime() - new Date().getTime();
          return diff / (1000*60*60*24) <= 5;
        }).map((d: any) => `- ${d.description} (${d.case?.number})`).join('\n')
      }\n\nPriorize estes prazos imediatamente.`;
    }

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao analisar prazos' });
  }
});

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) {
    const err: any = await response.json();
    throw new Error(`Gemini API error: ${JSON.stringify(err)}`);
  }

  const data: any = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA';
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    const err: any = await response.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(err)}`);
  }

  const data: any = await response.json();
  return data.choices?.[0]?.message?.content || 'Sem resposta da IA';
}

function buildAnalysisPrompt(caseData: CaseData): string {
  const movements = caseData.movements?.slice(0, 5) || [];
  const deadlines = caseData.deadlines?.filter(d => !d.completed) || [];

  return `Analise o seguinte processo jurídico e forneça insights estratégicos:

DADOS DO PROCESSO:
- Número: ${caseData.number}
- Tipo: ${caseData.type}
- Tribunal: ${caseData.court || 'N/A'}
- Status: ${caseData.status}
- Valor: R$ ${caseData.value || 'N/A'}
- Data de ajuizamento: ${caseData.filedDate ? new Date(caseData.filedDate).toLocaleDateString('pt-BR') : 'N/A'}
- Cliente: ${caseData.client?.name || 'N/A'}

MOVIMENTAÇÕES RECENTES:
${movements.map(m => `- ${new Date(m.date).toLocaleDateString('pt-BR')}: ${m.description}`).join('\n') || 'Nenhuma movimentação registrada'}

PRAZOS PENDENTES:
${deadlines.map(d => `- ${d.description} (Vence: ${new Date(d.dueDate).toLocaleDateString('pt-BR')})`).join('\n') || 'Nenhum prazo pendente'}

Por favor, forneça uma análise estruturada com:
1. SITUAÇÃO ATUAL DO PROCESSO
2. PONTOS DE ATENÇÃO E RISCOS
3. ESTRATÉGIAS RECOMENDADAS
4. PRAZOS CRÍTICOS (se houver)
5. PRÓXIMOS PASSOS SUGERIDOS

Use linguagem jurídica profissional e seja objetivo.`;
}

function generateLocalAnalysis(caseData: CaseData): string {
  const movements = caseData.movements?.slice(0, 3) || [];
  const deadlines = caseData.deadlines?.filter(d => !d.completed) || [];
  const urgentDeadlines = deadlines.filter(d => {
    const diff = new Date(d.dueDate).getTime() - new Date().getTime();
    return diff / (1000 * 60 * 60 * 24) <= 5;
  });

  return `ANÁLISE DO PROCESSO ${caseData.number}

SITUAÇÃO ATUAL:
- Processo do tipo ${caseData.type} em trâmite no ${caseData.court || 'tribunal não informado'}
- Status atual: ${caseData.status}
- Cliente: ${caseData.client?.name || 'N/A'}
- Valor da causa: R$ ${caseData.value?.toFixed(2) || 'Não informado'}

PONTOS DE ATENÇÃO:
${urgentDeadlines.length > 0 ? `⚠️ ${urgentDeadlines.length} prazo(s) crítico(s) detectado(s) para os próximos 5 dias!` : '✓ Nenhum prazo imediato crítico'}
${movements.length === 0 ? '- Nenhuma movimentação registrada recentemente. Verificar andamento no tribunal.' : ''}

MOVIMENTAÇÕES RECENTES:
${movements.map(m => `- ${new Date(m.date).toLocaleDateString('pt-BR')}: ${m.description}`).join('\n') || 'Nenhuma movimentação registrada'}

PRAZOS PENDENTES:
${deadlines.map(d => `- ${d.description} (Vence: ${new Date(d.dueDate).toLocaleDateString('pt-BR')})`).join('\n') || 'Nenhum prazo pendente'}

ESTRATÉGIAS RECOMENDADAS:
1. Monitorar prazos processuais diariamente
2. Consultar andamentos no DataJud/CNJ regularmente
3. Preparar defesa preventiva para audiências
4. Manter cliente informado sobre andamentos

PRÓXIMOS PASSOS:
- Verificar intimações pendentes
- Atualizar movimentações no sistema
- Agendar audiências com antecedência
- Revisar documentos juntados

---
ℹ️ Análise gerada localmente. Configure uma IA (Gemini/OpenAI) para análise avançada.`;
}

export default router;
