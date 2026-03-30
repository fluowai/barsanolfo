# 🚀 Configuração de Portas - Site Barsanulfo & Martins

## Portas Configuradas

O projeto foi configurado para rodar nas seguintes portas:

| Serviço | Porta | URL |
|---------|-------|-----|
| **Backend API** | 5032 | `http://localhost:5032` |
| **Frontend Site** | 5033 | `http://localhost:5033` |
| **Frontend Painel** | 5034 | `http://localhost:5034/painel/` |

## Como Rodar os Servidores

### 1️⃣ Instalar Dependências (primeira vez)
```bash
npm install
cd backend && npm install && cd ..
cd frontend-painel && npm install && cd ..
```

### 2️⃣ Rodar em Desenvolvimento

**Opção 1: Todos os servidores juntos**
```bash
npm run dev
```

Isso vai rodar:
- Vite (Site) na porta 5033
- Vite (Painel) na porta 5034
- Você precisa rodar o backend em outro terminal

**Opção 2: Backend em terminal separado**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontends):
```bash
npm run dev
```

## URLs de Acesso

- **Site Principal**: http://localhost:5033
- **Painel Admin**: http://localhost:5034/painel/
- **API Backend**: http://localhost:5032/api/

## Variáveis de Ambiente

### `.env.local` (Root)
```
VITE_API_URL=http://localhost:5032
GEMINI_API_KEY=seu_api_key_aqui
```

### `backend/.env`
```
PORT=5032
NODE_ENV=development
DATABASE_URL=file:./dev.db
```

## Troubleshooting

### Porta já em uso
Se alguma porta estiver em uso:
1. Windows: `netstat -ano | findstr :5032`
2. Identifique o PID
3. Mate o processo: `taskkill /PID <PID> /F`

### Erros de conexão CORS
- Verifique se o backend está rodando na porta 5032
- Verifique se o arquivo `backend/src/server.ts` tem as portas corretas na configuração CORS
- As portas no frontend devem estar na lista de `origin` permitidas

## Histórico de Mudança de Portas

**Anterior:**
- Backend: 3000
- Frontend Site: 3003
- Frontend Painel: 3001

**Atual:**
- Backend: 5032
- Frontend Site: 5033
- Frontend Painel: 5034

Mudança realizada em: 30/03/2026

