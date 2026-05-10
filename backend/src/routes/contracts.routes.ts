import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const contractSchema = z.object({
  clientId: z.string(),
  caseId: z.string().optional(),
  legalArea: z.string().optional(),
  type: z.string().default('FIXED_FEE'),
  templateId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  totalValue: z.number().optional(),
  upfrontPayment: z.number().optional(),
  installmentCount: z.number().optional(),
  contingencyPercent: z.number().optional(),
  paymentMethod: z.string().optional(),
  dueDay: z.number().optional(),
  penalty: z.number().default(0),
  interest: z.number().default(0),
  clauses: z.string().optional(),
  content: z.string().optional(),
  status: z.string().default('DRAFT'),
  validUntil: z.string().optional(),
  responsibleId: z.string().optional(),
});

router.get('/contracts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        client: { select: { id: true, name: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
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
        organizationId: req.user!.organizationId,
        clientId: data.clientId,
        caseId: data.caseId,
        legalArea: data.legalArea,
        type: data.type,
        templateId: data.templateId,
        title: data.title,
        description: data.description,
        totalValue: data.totalValue,
        upfrontPayment: data.upfrontPayment,
        installmentCount: data.installmentCount,
        contingencyPercent: data.contingencyPercent,
        paymentMethod: data.paymentMethod,
        dueDay: data.dueDay,
        penalty: data.penalty,
        interest: data.interest,
        clauses: data.clauses,
        content: data.content,
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        responsibleId: data.responsibleId,
      },
    });
    res.json({ success: true, contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar contrato' });
  }
});

router.get('/contracts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, cpfCnpj: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
        invoices: true,
      },
    });
    if (!contract) {
      res.status(404).json({ success: false, message: 'Contrato não encontrado' });
      return;
    }
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar contrato' });
  }
});

router.put('/contracts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = contractSchema.partial().parse(req.body);
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...data,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
    });
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar contrato' });
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

router.get('/contracts/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.contractTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar modelos' });
  }
});

export default router;
