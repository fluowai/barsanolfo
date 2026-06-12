# 🚀 GUIA DE EXECUÇÃO - WOOJURIS

## Versão: 2.0 - Melhorado e Otimizado
**Data:** 30 de Março de 2026

---

## 📋 PRÉ-REQUISITOS

- ✅ Node.js v22.17.1
- ✅ npm v10.9.2
- ✅ Git

---

## 🎯 RÁPIDO: Começar em 5 Minutos

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend Site
```bash
npm run dev
```

### Terminal 3: Frontend Painel
```bash
cd frontend-painel
npm run dev
```

Pronto! Acesse:
- **Site:** http://localhost:3003
- **Painel:** http://localhost:3001
- **API:** http://localhost:3000
- **Health:** http://localhost:3000/api/health

---

## 📦 ESTRUTURA DE PORTAS

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend Painel | 3001 | http://localhost:3001 |
| Frontend Site | 3003 | http://localhost:3003 |

---

## 🔧 MODIFICAÇÕES IMPLEMENTADAS

### ✅ CRÍTICAS (Segurança)
- [x] Autenticação com JWT (novo endpoint /api/auth)
- [x] Validação de senha (Base64 → TODO: bcrypt em produção)
- [x] CORS configurado corretamente
- [x] Logging de requisições

### ✅ IMPORTANTES (Funcionalidade)
- [x] Adicionado suporte PATCH em clientes
- [x] Mantém suporte PUT
- [x] Error boundaries implementados
- [x] Validação centralizada em hooks

### ✅ MELHORIAS (Código)
- [x] Types centralizados em types.ts
- [x] Constants consolidadas
- [x] Custom hooks: useApi, useContactForm, useAuth
- [x] Melhor tratamento de erros
- [x] Request logging no backend

---

## 🧪 TESTAR API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123456"
  }'
```

### Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123456"
  }'
```

### Enviar Formulário de Contato
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria",
    "email": "maria@example.com",
    "phone": "(11) 98765-4321",
    "type": "rescisao",
    "message": "Preciso de ajuda com rescisão indireta"
  }'
```

### Listar Leads
```bash
curl http://localhost:3000/api/leads
```

### Listar Clientes
```bash
curl http://localhost:3000/api/clients
```

---

## 📝 VARIÁVEIS DE AMBIENTE

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=file:./dev.db
SUPABASE_URL=sua-url-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
SUPABASE_ANON_KEY=sua-chave-anon
DATAJUD_API_KEY=sua-api-key-datajud
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
```

---

## 🐛 TROUBLESHOOTING

### Porta já em uso
```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou usar porta diferente
PORT=3001 npm run dev
```

### Erro de dependências
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
Verificar se as URLs estão configuradas em server.ts:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
  credentials: true,
}));
```

### Database locked
```bash
# Deletar banco SQLite e recriar
rm backend/dev.db
npm run dev
```

---

## 📂 ARQUIVOS CRIADOS/MODIFICADOS

### Novos Arquivos
- ✅ `hooks/useApi.ts` - Hook para requisições API
- ✅ `hooks/useContactForm.ts` - Hook para formulário
- ✅ `hooks/useAuth.ts` - Hook para autenticação
- ✅ `backend/src/routes/auth.routes.ts` - Rotas de autenticação

### Modificados
- ✅ `types.ts` - Types centralizados (Ampliado)
- ✅ `constants.tsx` - Constants (Ampliado com validações, endpoints, etc)
- ✅ `components/Contact.tsx` - Usa hooks e constants
- ✅ `backend/src/server.ts` - Melhorado com middleware
- ✅ `backend/src/routes/clients.routes.ts` - Adicionado PATCH
- ✅ `.env.local` - Adicionado VITE_API_URL

---

## 🚀 PRÓXIMOS PASSOS

### Imediato (Esta Semana)
- [ ] Implementar bcrypt para senha
- [ ] Adicionar JWT com refresh tokens
- [ ] Criar testes automatizados
- [ ] Setup de deploy (Vercel)

### Curto Prazo (Próximas 2 Semanas)
- [ ] Portal do cliente
- [ ] Integração WhatsApp
- [ ] Email automático
- [ ] Relatórios PDF

### Médio Prazo (Próximo Mês)
- [ ] Backup automático
- [ ] Notificações real-time
- [ ] Mobile app
- [ ] Analytics completo

---

## 📚 DOCUMENTAÇÃO

- 📖 **ESTRUTURA_PROJETO.md** - Arquitetura do sistema
- 📖 **STATUS_IMPLEMENTACAO.md** - Status atual
- 📖 **RESUMO_EXECUTIVO.md** - Visão estratégica

---

## ⚠️ NOTAS IMPORTANTES

1. **Senha:** Atualmente usa Base64. Em produção, usar bcrypt
2. **JWT:** Token simples em Base64. Em produção, usar jsonwebtoken + secret
3. **Database:** SQLite em dev. Usar PostgreSQL em produção
4. **API Keys:** Não fazer commit de chaves reais em .env

---

## 🎯 SUPORTE

Para dúvidas ou problemas, abra uma issue no GitHub ou consulte a documentação.

---

**Última Atualização:** 30/03/2026  
**Status:** ✅ Pronto para Desenvolvimento
