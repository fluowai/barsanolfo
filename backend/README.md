# 🚀 Backend - Barsa Advocacia

## ✅ O QUE FOI IMPLEMENTADO

### Servidor Express

- ✅ Servidor Node.js + Express rodando na porta 3000
- ✅ TypeScript configurado
- ✅ CORS habilitado para o frontend (localhost:5173)
- ✅ Middleware de logging de requisições
- ✅ Tratamento de erros global

### API de Contato

- ✅ **POST /api/contact** - Recebe formulários do site
  - Validação com Zod
  - Armazenamento em memória (temporário)
  - Logs detalhados no console
- ✅ **GET /api/leads** - Lista todos os leads
- ✅ **GET /api/leads/:id** - Busca lead específico
- ✅ **GET /api/health** - Health check do servidor

## 📊 STATUS ATUAL

### ✅ Funcionando

- [x] Servidor rodando
- [x] Formulário de contato salvando dados
- [x] Validação de dados
- [x] CORS configurado
- [x] Logs no console

### 🚧 Próximos Passos

- [ ] Integrar banco de dados (Prisma + SQLite/PostgreSQL)
- [ ] Envio de emails automáticos
- [ ] Integração com WhatsApp
- [ ] Sistema de autenticação
- [ ] Dashboard administrativo

## 🛠️ Como Usar

### Iniciar o servidor

```bash
cd backend
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

### Testar a API

#### Health Check

```bash
curl http://localhost:3000/api/health
```

#### Enviar contato

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 98765-4321",
    "type": "rescisao",
    "message": "Preciso de ajuda com rescisão indireta"
  }'
```

#### Listar leads

```bash
curl http://localhost:3000/api/leads
```

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── routes/
│   │   └── contact.routes.ts    # Rotas de contato
│   └── server.ts                # Servidor principal
├── .env                         # Variáveis de ambiente
├── .env.example                 # Exemplo de variáveis
├── package.json                 # Dependências
├── tsconfig.json                # Config TypeScript
└── nodemon.json                 # Config Nodemon
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
```

## 📝 Logs

O servidor mostra logs detalhados no console:

- 📩 Quando um novo contato é recebido
- ✅ Quando um lead é salvo com sucesso
- 📊 Total de leads armazenados
- ❌ Erros de validação ou processamento

## 🎯 Próxima Implementação

1. **Banco de Dados**

   - Configurar Prisma
   - Criar migração inicial
   - Persistir leads no banco

2. **Email**

   - Configurar Nodemailer
   - Template de email
   - Enviar notificação para o escritório

3. **WhatsApp**

   - Integrar API do WhatsApp
   - Mensagem automática para o cliente

4. **Autenticação**
   - JWT
   - Login/Registro
   - Proteção de rotas

## 🐛 Troubleshooting

### Erro de CORS

Se o frontend não conseguir conectar, verifique se o CORS está configurado corretamente em `src/server.ts`:

```typescript
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
```

### Porta já em uso

Se a porta 3000 estiver em uso, altere no arquivo `.env`:

```env
PORT=3001
```

E atualize a URL no frontend (`components/Contact.tsx`).

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa no arquivo raiz do projeto.

---

**Status:** ✅ Funcional (armazenamento em memória)  
**Versão:** 1.0.0  
**Última atualização:** 14/01/2026
