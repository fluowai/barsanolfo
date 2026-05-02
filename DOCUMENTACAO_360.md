# Sistema Advogados 360 - Documentação Final

## Visão Geral
Sistema completo de gestão jurídica 360º com Dashboard unificada, Agentes de IA, Notificações em Tempo Real e Gateway de Pagamentos.

## Funcionalidades Implementadas

### 1. Dashboard 360 (Tela Única)
- Estatísticas em tempo real (processos, clientes, leads, receita)
- Lista de processos recentes com análise de IA
- Prazos críticos com alertas visuais
- Tarefas pendentes com toggle de conclusão
- Leads recentes com conversão rápida
- Insights automáticos da IA
- WhatsApp recente
- Resumo financeiro
- Ações rápidas (Nova petição, Cliente, Processo, Jurisprudência)

### 2. Agente de IA para Análise de Processos
- **Rota:** `POST /api/ai/analyze-case`
- Análise automática usando Gemini ou OpenAI
- Fallback local caso IA não configurada
- Estrutura: Situação atual, Pontos de atenção, Estratégias, Prazos, Próximos passos

### 3. Geração de Petições com IA
- **Rota:** `POST /api/ai/generate-petition`
- Gera petições iniciais estruturadas
- Baseado nos fatos e fundamentos jurídicos fornecidos

### 4. Análise Inteligente de Prazos
- **Rota:** `POST /api/ai/analyze-deadlines`
- Analisa prazos dos próximos 15 dias
- Identifica criticos e sugere priorização

### 5. Notificações em Tempo Real (WebSocket)
- **Tecnologia:** Socket.IO
- Notificações de prazos (a cada 1 hora verifica prazos em 24h)
- Sino de notificações no header do painel
- Badge com contagem de não lidos
- Som de notificação
- Marcar como lida/remover notificações

### 6. Gateway de Pagamento Asaas
- **Rotas:**
  - `POST /api/payments/create` - Criar cobrança (Boleto, PIX, Cartão)
  - `POST /api/payments/customer` - Criar cliente no Asaas
  - `GET /api/payments/status/:id` - Consultar status
  - `POST /api/payments/webhook` - Receber notificações de pagamento
- Integração com tabela local `invoices`

## Como Executar

### 1. Configurar Variáveis de Ambiente

**Backend (`backend/.env`):**
```env
PORT=5032
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=sua_chave_jwt_secreta
ASAAS_API_KEY=sua_chave_asaas
ASAAS_BASE_URL=https://www.asaas.com/api/v3
ALLOWED_ORIGINS=http://localhost:5032,http://localhost:5033,http://localhost:5173
```

### 2. Instalar Dependências
```bash
# Backend
cd backend && npm install

# Frontend Principal
cd .. && npm install

# Frontend Painel
cd frontend-painel && npm install
```

### 3. Configurar Banco de Dados
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Configurar IA (Opcional)
No painel: `http://localhost:5032/painel/configuracoes`
- Adicione sua chave da API Gemini ou OpenAI
- Ative a configuração

### 5. Iniciar os Serviços

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Site Principal:**
```bash
npm run dev
# Acesse: http://localhost:5033
```

**Terminal 3 - Painel 360:**
```bash
cd frontend-painel
npm run dev
# Acesse: http://localhost:5173
# Ou via: http://localhost:5032/painel
```

## Estrutura de Arquivos Criados/Modificados

### Frontend (Painel 360)
- `frontend-painel/src/pages/Dashboard.tsx` - Dashboard 360 completo
- `frontend-painel/src/pages/Dashboard.css` - Estilos da Dashboard 360
- `frontend-painel/src/components/NotificationBell.tsx` - Sino de notificações
- `frontend-painel/src/components/NotificationBell.css` - Estilos das notificações
- `frontend-painel/src/components/Header.tsx` - Header com notificações integradas
- `frontend-painel/src/hooks/useNotifications.ts` - Hook WebSocket

### Backend
- `backend/src/routes/ai.routes.ts` - Rotas de IA (análise, petições, prazos)
- `backend/src/routes/payment.routes.ts` - Integração Asaas
- `backend/src/server.ts` - Servidor com WebSocket/Socket.IO

## Testes Recomendados

1. **Dashboard 360:** Acesse o painel e verifique todos os widgets
2. **Análise de IA:** Clique em um processo e clique em "Analisar"
3. **Notificações:** Verifique o sino no header (se houver prazos próximos)
4. **Pagamentos:** Configure a chave Asaas e teste criar uma cobrança

## Próximos Passos Sugeridos

1. Configurar autenticação de 2º fator
2. Implementar Portal do Cliente (área do cliente)
3. Integrar mais APIs de tribunais (TJGO, TST, STF)
4. Implementar assinatura digital de documentos
5. Criar relatórios gerenciais avançados
6. Implementar integração com Google Calendar para audiências
