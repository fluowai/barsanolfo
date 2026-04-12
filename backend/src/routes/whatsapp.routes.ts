import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/whatsapp/status - Status da conexão
router.get('/whatsapp/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.whatsAppConfig.findFirst();
    
    res.json({
      success: true,
      status: {
        connected: false,
        config: config || null
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/config - Salvar configuração
router.post('/whatsapp/config', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { autoReply, welcomeMessage, reminderHours } = req.body;
    
    let config = await prisma.whatsAppConfig.findFirst();
    
    if (config) {
      config = await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data: { autoReply, welcomeMessage, reminderHours }
      });
    } else {
      config = await prisma.whatsAppConfig.create({
        data: { autoReply, welcomeMessage, reminderHours }
      });
    }
    
    res.json({ success: true, config });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/whatsapp/messages - Histórico de mensagens
router.get('/whatsapp/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({ success: true, messages });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
