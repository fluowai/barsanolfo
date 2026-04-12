import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
});

router.get('/leads/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      select: { status: true, createdAt: true },
    });

    const total = leads.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = leads.filter(l => l.createdAt > sevenDaysAgo).length;
    
    const byStatus = leads.reduce((acc: { status: string; _count: number }[], lead) => {
      const status = lead.status || 'NEW';
      const existing = acc.find(s => s.status === status);
      if (existing) {
        existing._count++;
      } else {
        acc.push({ status, _count: 1 });
      }
      return acc;
    }, []);

    res.json({ 
      success: true, 
      stats: { total, recent, byStatus } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao gerar estatísticas' });
  }
});

router.get('/leads', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, leads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar leads' });
  }
});

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const data = leadSchema.parse(req.body);
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        message: data.message,
        source: 'WEBSITE',
        status: 'NEW',
      },
    });
    res.json({ success: true, lead, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
  }
});

router.put('/leads/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    
    const lead = await prisma.lead.update({
      where: { id },
      data: { status },
    });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

router.delete('/leads/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.lead.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Lead removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover lead' });
  }
});

export default router;
