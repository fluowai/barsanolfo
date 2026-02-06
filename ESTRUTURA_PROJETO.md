# 📁 ESTRUTURA DO PROJETO - SISTEMA COMPLETO

## 🏗️ Arquitetura de Pastas

```
barsa-advocacia-system/
│
├── 📁 frontend/                    # Aplicação React
│   ├── 📁 public/
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── manifest.json
│   │
│   ├── 📁 src/
│   │   ├── 📁 assets/              # Imagens, fontes, ícones
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── icons/
│   │   │
│   │   ├── 📁 components/          # Componentes reutilizáveis
│   │   │   ├── 📁 common/          # Componentes genéricos
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Loading.tsx
│   │   │   │
│   │   │   ├── 📁 layout/          # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Dashboard.tsx
│   │   │   │
│   │   │   └── 📁 forms/           # Formulários específicos
│   │   │       ├── LeadForm.tsx
│   │   │       ├── ClientForm.tsx
│   │   │       └── CaseForm.tsx
│   │   │
│   │   ├── 📁 pages/               # Páginas da aplicação
│   │   │   ├── 📁 public/          # Site público
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── About.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── Team.tsx
│   │   │   │   ├── Contact.tsx
│   │   │   │   └── Blog.tsx
│   │   │   │
│   │   │   ├── 📁 auth/            # Autenticação
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ForgotPassword.tsx
│   │   │   │
│   │   │   ├── 📁 dashboard/       # Dashboard principal
│   │   │   │   └── Dashboard.tsx
│   │   │   │
│   │   │   ├── 📁 crm/             # Módulo CRM
│   │   │   │   ├── Leads.tsx
│   │   │   │   ├── LeadDetail.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   ├── ClientDetail.tsx
│   │   │   │   └── Pipeline.tsx
│   │   │   │
│   │   │   ├── 📁 cases/           # Gestão de processos
│   │   │   │   ├── Cases.tsx
│   │   │   │   ├── CaseDetail.tsx
│   │   │   │   ├── Calendar.tsx
│   │   │   │   └── Deadlines.tsx
│   │   │   │
│   │   │   ├── 📁 financial/       # Financeiro
│   │   │   │   ├── Invoices.tsx
│   │   │   │   ├── Contracts.tsx
│   │   │   │   ├── Expenses.tsx
│   │   │   │   └── Reports.tsx
│   │   │   │
│   │   │   ├── 📁 documents/       # Documentos
│   │   │   │   ├── Library.tsx
│   │   │   │   ├── Templates.tsx
│   │   │   │   └── Editor.tsx
│   │   │   │
│   │   │   ├── 📁 team/            # Gestão de equipe
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Tasks.tsx
│   │   │   │   └── Timesheet.tsx
│   │   │   │
│   │   │   ├── 📁 cms/             # Editor de site
│   │   │   │   ├── PageEditor.tsx
│   │   │   │   ├── BlogEditor.tsx
│   │   │   │   └── Settings.tsx
│   │   │   │
│   │   │   └── 📁 client-portal/   # Portal do cliente
│   │   │       ├── MyCases.tsx
│   │   │       ├── Documents.tsx
│   │   │       └── Messages.tsx
│   │   │
│   │   ├── 📁 hooks/               # Custom React Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useForm.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── 📁 services/            # API Services
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── crmService.ts
│   │   │   ├── caseService.ts
│   │   │   └── financialService.ts
│   │   │
│   │   ├── 📁 store/               # Estado global (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── crmStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── 📁 types/               # TypeScript types
│   │   │   ├── user.types.ts
│   │   │   ├── crm.types.ts
│   │   │   ├── case.types.ts
│   │   │   └── financial.types.ts
│   │   │
│   │   ├── 📁 utils/               # Utilitários
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── 📁 styles/              # Estilos globais
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── themes.css
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   │
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── 📁 backend/                     # API Node.js
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configurações
│   │   │   ├── database.ts
│   │   │   ├── email.ts
│   │   │   ├── storage.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── 📁 controllers/         # Controladores
│   │   │   ├── authController.ts
│   │   │   ├── crmController.ts
│   │   │   ├── caseController.ts
│   │   │   ├── financialController.ts
│   │   │   └── cmsController.ts
│   │   │
│   │   ├── 📁 services/            # Lógica de negócio
│   │   │   ├── authService.ts
│   │   │   ├── crmService.ts
│   │   │   ├── caseService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── whatsappService.ts
│   │   │   └── pdfService.ts
│   │   │
│   │   ├── 📁 models/              # Modelos (se não usar Prisma)
│   │   │   └── (Prisma gerencia isso)
│   │   │
│   │   ├── 📁 routes/              # Rotas da API
│   │   │   ├── auth.routes.ts
│   │   │   ├── crm.routes.ts
│   │   │   ├── case.routes.ts
│   │   │   ├── financial.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   └── cms.routes.ts
│   │   │
│   │   ├── 📁 middlewares/         # Middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   │
│   │   ├── 📁 validators/          # Validações Zod
│   │   │   ├── auth.validator.ts
│   │   │   ├── crm.validator.ts
│   │   │   └── case.validator.ts
│   │   │
│   │   ├── 📁 utils/               # Utilitários
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   ├── logger.ts
│   │   │   └── helpers.ts
│   │   │
│   │   ├── 📁 jobs/                # Tarefas agendadas
│   │   │   ├── deadlineReminder.ts
│   │   │   ├── emailQueue.ts
│   │   │   └── backup.ts
│   │   │
│   │   ├── app.ts                  # Configuração Express
│   │   └── server.ts               # Servidor
│   │
│   ├── 📁 prisma/                  # Prisma ORM
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── 📁 migrations/
│   │
│   ├── 📁 uploads/                 # Arquivos enviados
│   │   ├── documents/
│   │   ├── avatars/
│   │   └── temp/
│   │
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── 📁 shared/                      # Código compartilhado
│   ├── 📁 types/                   # Types compartilhados
│   └── 📁 constants/               # Constantes compartilhadas
│
├── 📁 docs/                        # Documentação
│   ├── API.md
│   ├── SETUP.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── .gitignore
├── README.md
└── docker-compose.yml              # Docker (opcional)
```

---

## 🔧 CONFIGURAÇÕES PRINCIPAIS

### package.json (Frontend)

```json
{
  "name": "barsa-advocacia-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "@tanstack/react-table": "^8.10.7",
    "recharts": "^2.10.3",
    "react-quill": "^2.0.0",
    "@fullcalendar/react": "^6.1.10"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### package.json (Backend)

```json
{
  "name": "barsa-advocacia-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "node-cron": "^3.0.3",
    "pdfkit": "^0.14.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "@types/nodemailer": "^6.4.14",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}
```

### Prisma Schema (Exemplo Simplificado)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// USUÁRIOS
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          Role     @default(LAWYER)
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relações
  assignedLeads Lead[]   @relation("AssignedTo")
  cases         Case[]   @relation("LawyerCases")
  tasks         Task[]   @relation("AssignedTasks")

  @@map("users")
}

enum Role {
  SUPER_ADMIN
  PARTNER
  LAWYER
  INTERN
  SECRETARY
  FINANCIAL
}

// CRM - LEADS
model Lead {
  id          String     @id @default(uuid())
  name        String
  email       String
  phone       String
  source      LeadSource
  status      LeadStatus @default(NEW)
  score       Int        @default(0)
  assignedTo  String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relações
  assignedUser User?     @relation("AssignedTo", fields: [assignedTo], references: [id])
  client       Client?

  @@map("leads")
}

enum LeadSource {
  WEBSITE
  REFERRAL
  SOCIAL_MEDIA
  PHONE
  EMAIL
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST
}

// CRM - CLIENTES
model Client {
  id        String   @id @default(uuid())
  leadId    String?  @unique
  name      String
  cpf       String   @unique
  rg        String?
  email     String
  phone     String
  address   String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relações
  lead      Lead?    @relation(fields: [leadId], references: [id])
  cases     Case[]
  contracts Contract[]

  @@map("clients")
}

// PROCESSOS
model Case {
  id           String     @id @default(uuid())
  number       String     @unique
  type         CaseType
  court        String
  clientId     String
  lawyerId     String
  status       CaseStatus @default(ACTIVE)
  value        Decimal?
  filedDate    DateTime
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relações
  client       Client     @relation(fields: [clientId], references: [id])
  lawyer       User       @relation("LawyerCases", fields: [lawyerId], references: [id])
  movements    CaseMovement[]
  deadlines    Deadline[]
  hearings     Hearing[]
  documents    Document[]

  @@map("cases")
}

enum CaseType {
  LABOR
  CIVIL
  CRIMINAL
  FAMILY
  OTHER
}

enum CaseStatus {
  ACTIVE
  SUSPENDED
  ARCHIVED
  CLOSED
}

// PRAZOS
model Deadline {
  id          String   @id @default(uuid())
  caseId      String
  description String
  dueDate     DateTime
  completed   Boolean  @default(false)
  reminded    Boolean  @default(false)
  createdAt   DateTime @default(now())

  // Relações
  case        Case     @relation(fields: [caseId], references: [id])

  @@map("deadlines")
}

// AUDIÊNCIAS
model Hearing {
  id        String   @id @default(uuid())
  caseId    String
  date      DateTime
  location  String
  type      String
  notes     String?
  createdAt DateTime @default(now())

  // Relações
  case      Case     @relation(fields: [caseId], references: [id])

  @@map("hearings")
}

// DOCUMENTOS
model Document {
  id         String   @id @default(uuid())
  name       String
  type       String
  path       String
  size       Int
  caseId     String?
  clientId   String?
  uploadedBy String
  createdAt  DateTime @default(now())

  // Relações
  case       Case?    @relation(fields: [caseId], references: [id])

  @@map("documents")
}

// FINANCEIRO - CONTRATOS
model Contract {
  id            String         @id @default(uuid())
  clientId      String
  type          ContractType
  value         Decimal
  paymentMethod PaymentMethod
  signedDate    DateTime
  createdAt     DateTime       @default(now())

  // Relações
  client        Client         @relation(fields: [clientId], references: [id])
  invoices      Invoice[]

  @@map("contracts")
}

enum ContractType {
  FIXED_FEE
  PERCENTAGE
  HOURLY
  SUCCESS_FEE
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  BANK_TRANSFER
  PIX
  INSTALLMENT
}

// FATURAS
model Invoice {
  id         String        @id @default(uuid())
  contractId String
  amount     Decimal
  dueDate    DateTime
  paidDate   DateTime?
  status     InvoiceStatus @default(PENDING)
  createdAt  DateTime      @default(now())

  // Relações
  contract   Contract      @relation(fields: [contractId], references: [id])

  @@map("invoices")
}

enum InvoiceStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

// TAREFAS
model Task {
  id          String       @id @default(uuid())
  title       String
  description String?
  assignedTo  String
  caseId      String?
  dueDate     DateTime
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(TODO)
  createdAt   DateTime     @default(now())

  // Relações
  assignedUser User        @relation("AssignedTasks", fields: [assignedTo], references: [id])

  @@map("tasks")
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  CANCELLED
}

// CMS - MOVIMENTAÇÕES
model CaseMovement {
  id          String   @id @default(uuid())
  caseId      String
  date        DateTime
  description String
  type        String
  createdAt   DateTime @default(now())

  // Relações
  case        Case     @relation(fields: [caseId], references: [id])

  @@map("case_movements")
}
```

---

## 🎨 EXEMPLO DE COMPONENTES

### Button.tsx (Componente Reutilizável)

```tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "font-bold uppercase tracking-widest transition-all";

  const variants = {
    primary: "bg-[#d4af37] text-black hover:brightness-110",
    secondary: "border border-white/20 text-white hover:bg-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        sizes[size]
      } ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
};
```

### useAuth.ts (Hook de Autenticação)

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
```

---

## 🚀 COMANDOS DE SETUP

### Instalação Inicial

```bash
# Clone ou crie o projeto
mkdir barsa-advocacia-system
cd barsa-advocacia-system

# Frontend
mkdir frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom zustand axios react-hook-form zod @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Backend
cd ..
mkdir backend
cd backend
npm init -y
npm install express @prisma/client jsonwebtoken bcrypt zod cors dotenv multer nodemailer
npm install -D typescript @types/express @types/node nodemon ts-node prisma
npx prisma init
```

### Desenvolvimento

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Prisma Studio (visualizar DB)
cd backend
npx prisma studio
```

---

Este documento fornece a estrutura completa e exemplos práticos para iniciar o desenvolvimento! 🚀
