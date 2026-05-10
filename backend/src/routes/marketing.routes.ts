import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/marketing/campaigns', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar campanhas' });
  }
});

router.post('/marketing/campaigns', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, description, startDate, endDate, budget, channel, status } = req.body;
    const campaign = await prisma.marketingCampaign.create({
      data: {
        organizationId: req.user!.organizationId,
        name, type, description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget, channel, status: status || 'DRAFT',
      },
    });
    res.json({ success: true, campaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar campanha' });
  }
});

router.put('/marketing/campaigns/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, type, description, startDate, endDate, budget, channel, status } = req.body;
    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name, type, description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budget, channel, status,
      },
    });
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar campanha' });
  }
});

router.delete('/marketing/campaigns/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.marketingCampaign.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover campanha' });
  }
});

router.get('/marketing/calendar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.contentCalendar.findMany({
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar calendário' });
  }
});

router.post('/marketing/calendar', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, date, status, content, platform, author } = req.body;
    const entry = await prisma.contentCalendar.create({
      data: {
        organizationId: req.user!.organizationId,
        title, type, date: new Date(date), status, content, platform, author,
      },
    });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar entrada' });
  }
});

router.put('/marketing/calendar/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { title, type, date, status, content, platform, author } = req.body;
    const entry = await prisma.contentCalendar.update({
      where: { id },
      data: {
        title, type,
        date: date ? new Date(date) : undefined,
        status, content, platform, author,
      },
    });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar entrada' });
  }
});

router.delete('/marketing/calendar/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.contentCalendar.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover entrada' });
  }
});

export default router;
