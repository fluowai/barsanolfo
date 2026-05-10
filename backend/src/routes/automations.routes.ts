import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.string().min(1),
  condition: z.string().optional(),
  action: z.string().min(1),
  actionConfig: z.string().optional(),
});

router.get('/automations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const automations = await prisma.automation.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, automations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar automações' });
  }
});

router.post('/automations', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const automation = await prisma.automation.create({
      data: {
        organizationId: req.user!.organizationId,
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        condition: data.condition,
        action: data.action,
        actionConfig: data.actionConfig,
      },
    });
    res.json({ success: true, automation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar automação' });
  }
});

router.put('/automations/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = createSchema.partial().parse(req.body);
    const automation = await prisma.automation.update({ where: { id }, data });
    res.json({ success: true, automation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar automação' });
  }
});

router.put('/automations/:id/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const current = await prisma.automation.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, message: 'Automação não encontrada' });
      return;
    }
    const automation = await prisma.automation.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
    res.json({ success: true, automation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao alternar automação' });
  }
});

router.delete('/automations/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.automation.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover automação' });
  }
});

router.get('/automations/logs', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.automationLog.findMany({
      include: { automation: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar logs' });
  }
});

export default router;
