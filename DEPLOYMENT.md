# 🚀 DEPLOYMENT PARA PRODUÇÃO - BARSA ADVOCACIA

## ⚠️ CHECKLIST PRÉ-DEPLOYMENT

Antes de fazer deploy em produção, certifique-se de:

### Segurança
- [ ] JWT_SECRET foi rotacionado e é forte (32+ caracteres)
- [ ] `.env` não está commitado no Git
- [ ] Variáveis de ambiente estão configuradas em Vercel/Heroku
- [ ] CORS apenas permite origins autorizados
- [ ] HTTPS está habilitado em produção

### Database
- [ ] Migrações foram executadas: `npm run prisma:migrate`
- [ ] Índices foram criados (confira `prisma/schema.prisma`)
- [ ] Backup automático está configurado
- [ ] PostgreSQL configurado em produção (recomendado)

### Build & Deploy
- [ ] Build teste passou: `npm run build`
- [ ] Testes passaram: `npm run test` (quando implementado)
- [ ] GitHub Actions workflows estão criados
- [ ] Secrets do GitHub estão configurados

### Monitoramento
- [ ] Logging está habilitado (Pino)
- [ ] Error Boundary está em produção
- [ ] Sentry pode ser integrado
- [ ] Health check endpoint está respondendo

---

## 📋 VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS

Crie um arquivo `.env` com:

```env
# SERVIDOR
PORT=5032
NODE_ENV=production
LOG_LEVEL=info

# DATABASE - PostgreSQL (RECOMENDADO)
DATABASE_URL=postgresql://user:password@host:5432/barsa_db

# OU DATABASE - SQLite (NÃO RECOMENDADO PARA PRODUÇÃO)
# DATABASE_URL=file:./dev.db

# AUTENTICAÇÃO
JWT_SECRET=GERAR_COM_CRYPTO (mínimo 32 caracteres)
JWT_EXPIRATION=24h

# SUPABASE (Opcional)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
SUPABASE_ANON_KEY=sua-chave-anon

# APIS EXTERNAS
DATAJUD_API_KEY=sua-chave-datajud
GEMINI_API_KEY=sua-chave-gemini

# EMAIL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-app-google
SMTP_FROM=noreply@barsaadvocacia.com.br

# CORS
ALLOWED_ORIGINS=https://seu-site.com,https://seu-painel.com

# VERCEL (se usar Vercel)
VERCEL_ENV=production
```

---

## 🐳 DEPLOYMENT COM DOCKER

### Build da Imagem
```bash
docker build -t barsa-advocacia:latest .
```

### Executar Localmente
```bash
docker run -p 5032:5032 \
  -e JWT_SECRET=seu-secret-gerado \
  -e DATABASE_URL=sua-database-url \
  barsa-advocacia:latest
```

### Com Docker Compose
```bash
# Copie o arquivo .env com as variáveis
cp .env.example .env
nano .env  # Edite com seus valores

# Suba os containers
docker-compose up -d

# Verifique logs
docker-compose logs -f api
```

---

## 🌐 DEPLOYMENT COM VERCEL

### 1. Configurar no Painel Vercel

1. Acesse https://vercel.com
2. Importe o repositório
3. Defina as variáveis de ambiente

### 2. Configurar Secrets
```bash
# No Painel Vercel > Settings > Environment Variables

JWT_SECRET                    # 32+ caracteres gerados
DATABASE_URL                  # PostgreSQL ou Supabase
SUPABASE_URL                  
SUPABASE_SERVICE_ROLE_KEY    
DATAJUD_API_KEY              
GEMINI_API_KEY               
SMTP_HOST                    
SMTP_PORT                    
SMTP_USER                    
SMTP_PASS                    
SMTP_FROM                    
ALLOWED_ORIGINS              
```

### 3. Deploy
```bash
git push origin main  # Trigger automático via GitHub Actions
```

---

## 🚀 DEPLOYMENT COM RAILWAY

### 1. Conectar Repository
```bash
railway login
railway init
```

### 2. Adicionar Plugin PostgreSQL
```bash
railway add postgres
```

### 3. Configurar Variáveis
```bash
railway variables set JWT_SECRET=seu-secret-gerado
railway variables set SMTP_HOST=smtp.gmail.com
# ... adicione outras variáveis
```

### 4. Deploy
```bash
railway up
```

---

## 📊 VERIFICAÇÕES PÓS-DEPLOYMENT

### Health Check
```bash
curl https://seu-site.com/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-04-12T10:30:00Z",
  "environment": "production"
}
```

### Verificar Logs
```bash
# Com Docker
docker-compose logs -f api

# Com Vercel
vercel logs

# Com Railway
railway logs
```

### Teste de Login
```bash
curl -X POST https://seu-site.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "sua-senha"
  }'
```

---

## 🔐 SEGURANÇA EM PRODUÇÃO

### Checklist de Segurança

- [ ] HTTPS está habilitado (redirecionamento de HTTP)
- [ ] Headers de segurança estão presentes (Helmet)
- [ ] CORS está restritivo
- [ ] Rate limiting está ativo
- [ ] Logs estão sendo registrados
- [ ] JWT_SECRET é forte
- [ ] Dados sensíveis (CPF, RG) estão encriptados
- [ ] Backups são realizados diariamente

### Testar Headers de Segurança
```bash
curl -I https://seu-site.com
```

Procure por:
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: ...`

---

## 📈 MONITORAMENTO

### Recomendações

1. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/react
   ```
   - Configure em `App.tsx`

2. **LogRocket (Session Replay)**
   ```bash
   npm install logrocket
   ```
   - Configure antes do React render

3. **Datadog/New Relic (APM)**
   - Para monitoramento de performance

4. **UptimeRobot (Uptime Monitoring)**
   - Configure alerts para health check

---

## 🔄 ATUALIZAÇÕES EM PRODUÇÃO

### Procedimento Seguro

1. Crie uma branch: `git checkout -b feature/atualização`
2. Faça as alterações
3. Teste localmente: `npm run dev`
4. Commit: `git commit -m "..."`
5. Push: `git push origin feature/atualização`
6. GitHub Actions testa automaticamente
7. Merge para `main` (aprove PR)
8. Deploy automático via Vercel/Railway

---

## 🆘 TROUBLESHOOTING

### "JWT_SECRET não está definido"
```bash
# Verifique as variáveis de ambiente
echo $JWT_SECRET  # Deve retornar um valor

# Se vazio, defina manualmente
export JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### "Conexão com banco de dados falhou"
```bash
# Teste a conexão
npm run prisma:migrate -- --dry-run

# Verifique DATABASE_URL
echo $DATABASE_URL
```

### "Rate limiting bloqueando requisições"
- Verifique se está em modo development
- Ajuste limites em `backend/src/middleware/rateLimit.middleware.ts`

### "Erro 500 sem detalhes"
- Verifique logs: `docker-compose logs api`
- Altere NODE_ENV=development para ver erros
- Habilite Pino em modo verbose: LOG_LEVEL=debug

---

## 📞 SUPORTE

- Documentação: Veja `docs/` folder
- Issues: GitHub Issues
- Logs: Verifique Sentry/LogRocket/Vercel Dashboard

---

**Status: Pronto para Produção ✅**

Versão: 1.0.0  
Data: 12/04/2026  
Última Atualização: Deploy Checklist
