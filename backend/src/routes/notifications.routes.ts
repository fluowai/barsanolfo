import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/notifications', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        organizationId: req.user!.organizationId,
        OR: [
          { userId: req.user!.id },
          { userId: null },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar notificações' });
  }
});

router.get('/notifications/unread-count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: {
        organizationId: req.user!.organizationId,
        read: false,
        OR: [
          { userId: req.user!.id },
          { userId: null },
        ],
      },
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar contagem' });
  }
});

router.put('/notifications/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao marcar como lida' });
  }
});

router.put('/notifications/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: {
        organizationId: req.user!.organizationId,
        read: false,
        OR: [
          { userId: req.user!.id },
          { userId: null },
        ],
      },
      data: { read: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao marcar todas como lidas' });
  }
});

export default router;
