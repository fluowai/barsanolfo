# 🚀 GUIA DE INÍCIO RÁPIDO

## Primeiros Passos para Implementação

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter instalado:

- ✅ **Node.js** (v18 ou superior) - [Download](https://nodejs.org/)
- ✅ **PostgreSQL** (v14 ou superior) - [Download](https://www.postgresql.org/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **VS Code** (recomendado) - [Download](https://code.visualstudio.com/)
- ✅ **Conta no GitHub** (para versionamento)

---

## 🎯 OPÇÃO 1: MELHORIAS RÁPIDAS NO SITE ATUAL (1-2 semanas)

### Passo 1: Criar Backend Básico

```bash
# Criar pasta do backend
mkdir backend
cd backend

# Inicializar projeto Node.js
npm init -y

# Instalar dependências essenciais
npm install express cors dotenv nodemailer
npm install -D typescript @types/express @types/node nodemon ts-node

# Criar estrutura básica
mkdir src
mkdir src/routes
mkdir src/services
```

### Passo 2: Configurar TypeScript

```bash
# Criar tsconfig.json
npx tsc --init
```

Editar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Passo 3: Criar Servidor Básico

Criar `backend/src/server.ts`:

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor funcionando!" });
});

// Rota de contato
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, type, message } = req.body;

    // TODO: Salvar no banco de dados
    // TODO: Enviar email

    console.log("Novo contato:", { name, email, phone, type, message });

    res.json({
      success: true,
      message: "Contato recebido com sucesso!",
    });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao processar contato",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
```

### Passo 4: Configurar Scripts

Editar `backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Passo 5: Conectar Frontend ao Backend

Atualizar `frontend/components/Contact.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isFormValid) return;

  setIsSubmitting(true);

  try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      setIsSubmitted(true);
      setFormData({ name: "", phone: "", email: "", type: "", message: "" });
    } else {
      alert("Erro ao enviar formulário. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro de conexão. Verifique se o servidor está rodando.");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Passo 6: Testar

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse `http://localhost:5173` e teste o formulário!

---

## 🎯 OPÇÃO 2: SISTEMA COMPLETO (6-9 meses)

### Fase 1: Setup do Projeto Completo

#### 1.1 Criar Estrutura de Pastas

```bash
# Criar projeto raiz
mkdir barsa-advocacia-system
cd barsa-advocacia-system

# Criar subpastas
mkdir frontend
mkdir backend
mkdir docs
mkdir shared
```

#### 1.2 Inicializar Git

```bash
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "uploads/" >> .gitignore
```

#### 1.3 Setup Frontend (React + Vite)

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Instalar dependências principais
npm install react-router-dom zustand axios react-hook-form zod @hookform/resolvers
npm install date-fns lucide-react

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar componentes UI (opcional)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

#### 1.4 Setup Backend (Node.js + Express + Prisma)

```bash
cd ../backend
npm init -y

# Dependências principais
npm install express @prisma/client jsonwebtoken bcrypt zod cors dotenv
npm install multer nodemailer node-cron

# Dependências de desenvolvimento
npm install -D typescript @types/express @types/node @types/bcrypt @types/jsonwebtoken
npm install -D @types/cors @types/multer @types/nodemailer
npm install -D nodemon ts-node prisma

# Inicializar Prisma
npx prisma init
```

#### 1.5 Configurar Banco de Dados

Editar `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/barsa_advocacia"
JWT_SECRET="sua_chave_secreta_super_segura_aqui"
PORT=3000

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"

# WhatsApp (opcional)
WHATSAPP_API_URL="https://api.whatsapp.com"
WHATSAPP_TOKEN="seu-token"
```

#### 1.6 Criar Schema do Prisma

Editar `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(LAWYER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

enum Role {
  SUPER_ADMIN
  LAWYER
  SECRETARY
}

model Lead {
  id        String     @id @default(uuid())
  name      String
  email     String
  phone     String
  source    String     @default("WEBSITE")
  status    String     @default("NEW")
  notes     String?
  createdAt DateTime   @default(now())

  @@map("leads")
}
```

#### 1.7 Executar Migração

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

#### 1.8 Criar Estrutura Backend

```bash
cd backend/src
mkdir config controllers routes services middlewares utils
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Semana 1-2: Setup Inicial

- [ ] Instalar todas as dependências
- [ ] Configurar banco de dados PostgreSQL
- [ ] Criar schema inicial do Prisma
- [ ] Setup do servidor Express
- [ ] Configurar CORS e middlewares
- [ ] Criar rota de teste

### ✅ Semana 3-4: Autenticação

- [ ] Implementar registro de usuários
- [ ] Implementar login (JWT)
- [ ] Criar middleware de autenticação
- [ ] Criar tela de login no frontend
- [ ] Implementar proteção de rotas

### ✅ Semana 5-6: CRM Básico

- [ ] CRUD de Leads
- [ ] CRUD de Clientes
- [ ] Formulário de contato funcional
- [ ] Envio de emails
- [ ] Dashboard básico

### ✅ Semana 7-8: Gestão Processual

- [ ] CRUD de Processos
- [ ] Sistema de prazos
- [ ] Calendário
- [ ] Alertas de vencimento

### ✅ Semana 9-10: Financeiro

- [ ] Contratos
- [ ] Faturas
- [ ] Relatórios básicos

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### **Desenvolvimento**

- **VS Code** - Editor de código
- **Postman** - Testar APIs
- **Prisma Studio** - Visualizar banco de dados
- **Git** - Versionamento

### **Design**

- **Figma** - Protótipos e design
- **Canva** - Imagens e gráficos

### **Gestão de Projeto**

- **Trello** ou **Notion** - Kanban e tarefas
- **GitHub Projects** - Integrado com código

### **Comunicação**

- **Slack** ou **Discord** - Chat da equipe
- **Google Meet** - Reuniões

---

## 📚 RECURSOS DE APRENDIZADO

### **Documentação Oficial**

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

### **Tutoriais Recomendados**

- [Full Stack App com React + Node](https://www.youtube.com/results?search_query=full+stack+react+node)
- [Prisma Crash Course](https://www.youtube.com/results?search_query=prisma+crash+course)
- [JWT Authentication](https://www.youtube.com/results?search_query=jwt+authentication+node)

---

## 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### **Problema: Erro de CORS**

```typescript
// backend/src/server.ts
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### **Problema: Prisma não encontra o banco**

```bash
# Verificar se PostgreSQL está rodando
# Windows: Services → PostgreSQL
# Mac: brew services list

# Recriar banco
npx prisma migrate reset
npx prisma migrate dev
```

### **Problema: Frontend não conecta ao backend**

```typescript
// Verificar se o backend está rodando na porta correta
// Verificar a URL no fetch: http://localhost:3000
```

---

## 📞 SUPORTE

### **Dúvidas Técnicas**

- Stack Overflow
- GitHub Issues
- Discord da comunidade React/Node

### **Consultoria**

- Email: contato@exemplo.com
- WhatsApp: (11) 98765-4321

---

## ✅ PRÓXIMA AÇÃO

**Escolha seu caminho:**

### 🟢 **Opção A: Melhorias Rápidas (Recomendado para começar)**

1. Siga os passos da "Opção 1" acima
2. Implemente backend básico em 1-2 semanas
3. Teste e valide com usuários reais
4. Decida se continua para o sistema completo

### 🔵 **Opção B: Sistema Completo (Projeto de longo prazo)**

1. Monte equipe de desenvolvimento
2. Siga o roadmap de 6-9 meses
3. Implemente módulo por módulo
4. Lance em produção após testes

---

## 🎉 CONCLUSÃO

Você agora tem:

- ✅ Plano completo e detalhado
- ✅ Estrutura de arquivos definida
- ✅ Guia passo a passo
- ✅ Checklist de implementação
- ✅ Recursos de aprendizado

**Está pronto para começar! Boa sorte! 🚀**

---

**Criado em:** 14/01/2026  
**Versão:** 1.0  
**Autor:** Antigravity AI
