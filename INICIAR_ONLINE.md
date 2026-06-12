# 🚀 GUIA RÁPIDO - COLOCANDO ONLINE

## 📋 Portas Disponíveis

| Serviço | Porta | URL |
|---------|-------|-----|
| 🔙 Backend API | **5032** | http://localhost:5032 |
| 📊 Painel Admin | **5032/painel** | http://localhost:5032/painel |
| 🔍 Health Check | **5032/api/health** | http://localhost:5032/api/health |

---

## ⚡ Início Rápido

### Opção 1: PowerShell (Recomendado)

```powershell
# Execute no PowerShell como Administrator
cd "C:\Users\paulo\OneDrive\Área de Trabalho\NÃO APAGAR\woojuris"

# Primeira vez: compilar backend
cd backend
npm run build
cd ..

# Iniciar backend
cd backend
node dist/server.js
```

**Resultado esperado:**
```
{"level":30,"msg":"✅ Servidor rodando com sucesso!"}
{"level":30,"msg":"🚀 Site: http://localhost:5032"}
```

### Opção 2: Arquivo Batch

```batch
# No Explorer, clique 2x em:
iniciar-backend.bat
```

### Opção 3: Docker

```bash
# Build
docker build -t woojuris:latest .

# Run
docker run -p 5032:5032 \
  -e JWT_SECRET=dev-secret-key \
  -e DATABASE_URL=file:./dev.db \
  -e SUPABASE_URL=https://placeholder.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=placeholder \
  woojuris:latest
```

---

## 🧪 Testar Endpoints

### Health Check
```bash
# PowerShell
Invoke-WebRequest http://localhost:5032/api/health | Select-Object StatusCode, Content

# Resultado esperado:
# StatusCode: 200
# {"status":"ok","timestamp":"2026-04-12T...","environment":"development"}
```

### Submeter Formulário de Contato
```bash
$body = @{
  name = "João Silva"
  email = "joao@example.com"
  phone = "11987654321"
  type = "trabalhista"
  message = "Preciso de ajuda"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5032/api/contact `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## 📊 Monitorar Logs

O backend usa **Pino Logger**. Observar em tempo real:

```bash
# Os logs aparecem no console em tempo real
# Formato: 
# {"level":30,"time":"2026-04-12T18:32:08.449Z","msg":"..."}

# Level 30 = INFO
# Level 40 = WARN
# Level 50 = ERROR
```

---

## 🔗 URLs Importantes

| URL | Descrição |
|-----|-----------|
| http://localhost:5032 | Site principal (frontend) |
| http://localhost:5032/api/health | Verificar se está online |
| http://localhost:5032/api/contact | Formulário de contato |
| http://localhost:5032/painel | Painel administrativo |

---

## ⚙️ Variáveis de Ambiente

Arquivo: `backend/.env`

```env
PORT=5032                                    # Porta do servidor
NODE_ENV=development                         # Ambiente
DATABASE_URL=file:./dev.db                   # Database SQLite
JWT_SECRET=a5495096a04b0a0921...             # Token JWT
SUPABASE_URL=https://placeholder.supabase.co # Supabase (opcional)
```

---

## 🛑 Parar o Servidor

```bash
# No PowerShell onde está rodando:
Ctrl + C

# Ou feche a janela do terminal
```

---

## 🐛 Troubleshooting

### "Porta 5032 já está em uso"
```bash
# Encontre o processo usando a porta
netstat -ano | findstr "5032"

# Mate o processo (substitua PID)
taskkill /PID <PID> /F

# Ou use outra porta
# Edite: backend/.env
# PORT=5033
```

### "JWT_SECRET não está definido"
✅ Já foi definido com 32 caracteres seguros

### "SUPABASE_URL é obrigatório"
✅ Já foi configurado com placeholder no .env

### "Erro de compilação TypeScript"
```bash
npm run build  # Recompile
```

---

## 📈 Próximos Passos

1. ✅ Backend rodando localmente
2. ⏳ Configurar frontend (React)
3. ⏳ Deploy em Vercel/Railway
4. ⏳ Integrar com banco de dados real
5. ⏳ Configurar domínio customizado

---

## 🎯 Status

| Item | Status |
|------|--------|
| Backend build | ✅ Compilando |
| Backend porta | ✅ 5032 disponível |
| Logging | ✅ Pino funcionando |
| Segurança | ✅ Helmet + Rate limit |
| JWT | ✅ Secret configurado |
| Database | ✅ SQLite dev |

**🟢 PRONTO PARA USAR!**

---

**Data:** 12/04/2026  
**Versão:** 1.0.0  
**Status:** Online Local ✅
