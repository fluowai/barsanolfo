import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const hearingSchema = z.object({
  title: z.string().min(1),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  type: z.string().default('HEARING'),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  responsibleId: z.string(),
  participants: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('SCHEDULED'),
  reminderBefore: z.number().default(60),
});

router.get('/hearings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const hearings = await prisma.hearing.findMany({
      include: {
        case: { select: { id: true, number: true, internalTitle: true } },
        responsible: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, hearings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar audiências' });
  }
});

router.post('/hearings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = hearingSchema.parse(req.body);
    const hearing = await prisma.hearing.create({
      data: {
        organizationId: req.user!.organizationId,
        title: data.title,
        caseId: data.caseId,
        clientId: data.clientId,
        type: data.type,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        meetingLink: data.meetingLink,
        responsibleId: data.responsibleId,
        participants: data.participants,
        description: data.description,
        notes: data.notes,
        status: data.status,
        reminderBefore: data.reminderBefore,
      },
    });
    res.json({ success: true, hearing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar audiência' });
  }
});

router.get('/hearings/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const hearing = await prisma.hearing.findUnique({
      where: { id },
      include: {
        case: { select: { id: true, number: true, internalTitle: true } },
        responsible: { select: { id: true, name: true } },
      },
    });
    if (!hearing) {
      res.status(404).json({ success: false, message: 'Audiência não encontrada' });
      return;
    }
    res.json({ success: true, hearing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar audiência' });
  }
});

router.put('/hearings/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = hearingSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    const hearing = await prisma.hearing.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, hearing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar audiência' });
  }
});

router.delete('/hearings/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.hearing.delete({ where: { id } });
    res.json({ success: true, message: 'Audiência removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover audiência' });
  }
});

export default router;
