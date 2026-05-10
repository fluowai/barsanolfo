import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const deadlineSchema = z.object({
  title: z.string().min(1),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  type: z.string().default('OTHER'),
  notificationDate: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  daysCount: z.number().optional(),
  businessDays: z.boolean().default(false),
  responsibleId: z.string(),
  reviewerId: z.string().optional(),
  status: z.string().default('NOT_STARTED'),
  priority: z.string().default('NORMAL'),
  description: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/deadlines', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const deadlines = await prisma.deadline.findMany({
      include: {
        case: { select: { id: true, number: true, internalTitle: true } },
        responsible: { select: { id: true, name: true } },
      },
      orderBy: { endDate: 'asc' },
    });
    res.json({ success: true, deadlines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar prazos' });
  }
});

router.post('/deadlines', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = deadlineSchema.parse(req.body);
    const deadline = await prisma.deadline.create({
      data: {
        organizationId: req.user!.organizationId,
        title: data.title,
        caseId: data.caseId,
        clientId: data.clientId,
        type: data.type,
        notificationDate: data.notificationDate ? new Date(data.notificationDate) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        daysCount: data.daysCount,
        businessDays: data.businessDays,
        responsibleId: data.responsibleId,
        reviewerId: data.reviewerId,
        status: data.status,
        priority: data.priority,
        description: data.description,
        notes: data.notes,
      },
    });
    res.json({ success: true, deadline });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar prazo' });
  }
});

router.get('/deadlines/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: {
        case: { select: { id: true, number: true, internalTitle: true } },
        responsible: { select: { id: true, name: true } },
      },
    });
    if (!deadline) {
      res.status(404).json({ success: false, message: 'Prazo não encontrado' });
      return;
    }
    res.json({ success: true, deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar prazo' });
  }
});

router.put('/deadlines/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = deadlineSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.notificationDate) updateData.notificationDate = new Date(data.notificationDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const deadline = await prisma.deadline.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, deadline });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar prazo' });
  }
});

router.delete('/deadlines/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.deadline.delete({ where: { id } });
    res.json({ success: true, message: 'Prazo removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover prazo' });
  }
});

export default router;
