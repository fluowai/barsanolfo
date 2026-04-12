import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const contractSchema = z.object({
  clientId: z.string(),
  type: z.string(),
  value: z.number().positive(),
  paymentMethod: z.string().optional(),
  signedDate: z.string().optional(),
});

const invoiceSchema = z.object({
  contractId: z.string(),
  clientId: z.string(),
  title: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  notes: z.string().optional(),
});

const expenseSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
  category: z.string().optional(),
  date: z.string(),
});

// Dashboard Financeiro
router.get('/financial/dashboard', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        }
      }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        }
      }
    });

    const totalReceivable = invoices
      .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalReceived = invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const overdueInvoices = invoices.filter(i => 
      i.status === 'PENDING' && new Date(i.dueDate) < new Date()
    ).length;

    const thisMonthRevenue = invoices
      .filter(i => i.status === 'PAID' && i.paidDate)
      .reduce((sum, i) => {
        const paidMonth = new Date(i.paidDate!).getMonth();
        const currentMonth = new Date().getMonth();
        return paidMonth === currentMonth ? sum + i.amount : sum;
      }, 0);

    res.json({
      success: true,
      dashboard: {
        totalReceivable,
        totalReceived,
        totalExpenses,
        thisMonthRevenue,
        overdueInvoices,
        pendingInvoices: invoices.filter(i => i.status === 'PENDING').length,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados' });
  }
});

// Contratos
router.get('/contracts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        invoices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, contracts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar contratos' });
  }
});

router.post('/contracts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = contractSchema.parse(req.body);
    const contract = await prisma.contract.create({
      data: {
        ...data,
        signedDate: data.signedDate ? new Date(data.signedDate) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ success: true, contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar contrato' });
  }
});

router.delete('/contracts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.contract.delete({ where: { id } });
    res.json({ success: true, message: 'Contrato removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover contrato' });
  }
});

// Faturas
router.get('/invoices', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        contract: {
          include: { client: { select: { id: true, name: true } } }
        }
      },
      orderBy: { dueDate: 'asc' },
    });
    res.json({ success: true, invoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar faturas' });
  }
});

router.post('/invoices', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = invoiceSchema.parse(req.body);
    
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, invoice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar fatura' });
  }
});

router.patch('/invoices/:id/pay', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao marcar como pago' });
  }
});

router.patch('/invoices/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao cancelar fatura' });
  }
});

router.delete('/invoices/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.invoice.delete({ where: { id } });
    res.json({ success: true, message: 'Fatura removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover fatura' });
  }
});

// Despesas
router.get('/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar despesas' });
  }
});

router.post('/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = expenseSchema.parse(req.body);
    const expense = await prisma.expense.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
    res.status(201).json({ success: true, expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar despesa' });
  }
});

router.delete('/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.expense.delete({ where: { id } });
    res.json({ success: true, message: 'Despesa removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover despesa' });
  }
});

// Funções auxiliares para gerar códigos (placeholder)
function generatePIXCode(amount: number, dueDate: string): string {
  return `00020126580014br.gov.bcb.spi0126email@exemplo.com.br520400005303986540${amount.toFixed(2).replace('.', '')}53080058GOIANIA550700BARSA ADVOCACIA6008GOIANIA62070503***6304`;
}

function generateBarcode(): string {
  const nums = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10));
  return nums.join('');
}

export default router;
