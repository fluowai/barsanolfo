import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  deadlineId: z.string().optional(),
  assignedToId: z.string(),
  reviewerId: z.string().optional(),
  priority: z.string().default('MEDIUM'),
  status: z.string().default('TODO'),
  dueDate: z.string().optional(),
  estimatedTime: z.number().optional(),
  spentTime: z.number().optional(),
  tags: z.string().optional(),
});

router.get('/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
        checklist: true,
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar tarefas' });
  }
});

router.post('/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = taskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        organizationId: req.user!.organizationId,
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        caseId: data.caseId,
        deadlineId: data.deadlineId,
        createdById: req.user!.id,
        assignedToId: data.assignedToId,
        reviewerId: data.reviewerId,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedTime: data.estimatedTime,
        spentTime: data.spentTime,
        tags: data.tags,
      },
    });
    res.json({ success: true, task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar tarefa' });
  }
});

router.get('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
        checklist: { orderBy: { order: 'asc' } },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!task) {
      res.status(404).json({ success: false, message: 'Tarefa não encontrada' });
      return;
    }
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar tarefa' });
  }
});

router.put('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = taskSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar tarefa' });
  }
});

router.delete('/tasks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Tarefa removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover tarefa' });
  }
});

router.post('/tasks/:id/checklist', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const taskId = String(req.params.id);
    const { content } = req.body;
    const item = await prisma.taskChecklistItem.create({
      data: { taskId, content },
    });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao adicionar item' });
  }
});

router.put('/tasks/checklist/:itemId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const itemId = String(req.params.itemId);
    const { completed } = req.body;
    const item = await prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: { completed },
    });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar item' });
  }
});

router.delete('/tasks/checklist/:itemId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const itemId = String(req.params.itemId);
    await prisma.taskChecklistItem.delete({ where: { id: itemId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover item' });
  }
});

router.post('/tasks/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const taskId = String(req.params.id);
    const { content } = req.body;
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: req.user!.id,
        content,
      },
    });
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao adicionar comentário' });
  }
});

export default router;
