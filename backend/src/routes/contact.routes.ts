import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  cpfCnpj: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  source: z.string().default('MANUAL'),
  channel: z.string().optional(),
  legalArea: z.string().optional(),
  description: z.string().optional(),
  urgency: z.string().default('NORMAL'),
  potentialValue: z.number().optional(),
  responsibleId: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = createLeadSchema.partial();

router.get('/leads/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      select: { status: true, urgency: true, createdAt: true, responsibleId: true },
    });

    const total = leads.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = leads.filter(l => l.createdAt > sevenDaysAgo).length;
    const urgent = leads.filter(l => l.urgency === 'URGENT' && l.status !== 'CLOSED' && l.status !== 'LOST').length;
    const converted = leads.filter(l => l.status === 'CLOSED').length;

    const byStatus = leads.reduce((acc: { status: string; _count: number }[], lead) => {
      const status = lead.status || 'NEW';
      const existing = acc.find(s => s.status === status);
      if (existing) existing._count++;
      else acc.push({ status, _count: 1 });
      return acc;
    }, []);

    res.json({
      success: true,
      stats: { total, recent, urgent, converted, byStatus }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao gerar estatísticas' });
  }
});

router.get('/leads', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, source, legalArea, urgency, responsibleId, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = status;
    if (source && source !== 'ALL') where.source = source;
    if (legalArea && legalArea !== 'ALL') where.legalArea = legalArea;
    if (urgency && urgency !== 'ALL') where.urgency = urgency;
    if (responsibleId && responsibleId !== 'ALL') where.responsibleId = responsibleId;
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { cpfCnpj: { contains: String(search) } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        interactions: { orderBy: { createdAt: 'desc' }, take: 5 },
        triages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, leads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar leads' });
  }
});

router.get('/leads/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        interactions: { orderBy: { createdAt: 'desc' } },
        triages: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead não encontrado' });
      return;
    }
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar lead' });
  }
});

router.post('/leads', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = createLeadSchema.parse(req.body);
    const lead = await prisma.lead.create({
      data: {
        organizationId: req.user!.organizationId,
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        city: data.city,
        state: data.state,
        source: data.source,
        channel: data.channel,
        legalArea: data.legalArea,
        description: data.description,
        urgency: data.urgency,
        potentialValue: data.potentialValue,
        responsibleId: data.responsibleId,
        tags: data.tags,
        notes: data.notes,
        status: 'NEW',
        score: 0,
      },
    });
    res.json({ success: true, lead });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar lead' });
  }
});

router.put('/leads/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = updateLeadSchema.parse(req.body);
    const lead = await prisma.lead.update({ where: { id }, data });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar lead' });
  }
});

router.put('/leads/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

router.delete('/leads/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.lead.delete({ where: { id } });
    res.json({ success: true, message: 'Lead removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover lead' });
  }
});

router.post('/leads/:id/convert', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead não encontrado' });
      return;
    }

    const client = await prisma.client.create({
      data: {
        organizationId: lead.organizationId,
        name: lead.name,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email || '',
        cpfCnpj: lead.cpfCnpj,
        city: lead.city,
        state: lead.state,
        source: lead.source,
        responsibleId: lead.responsibleId,
        notes: lead.notes,
        tags: lead.tags,
        status: 'ACTIVE',
      },
    });

    await prisma.lead.update({
      where: { id },
      data: { status: 'CLOSED', clientId: client.id },
    });

    res.json({ success: true, client, message: 'Lead convertido em cliente com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao converter lead' });
  }
});

router.post('/leads/:id/interactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const leadId = String(req.params.id);
    const { type, content } = req.body;
    const interaction = await prisma.leadInteraction.create({
      data: { leadId, type: type || 'NOTE', content, userId: req.user!.id },
    });
    res.json({ success: true, interaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao registrar interação' });
  }
});

router.post('/leads/:id/triage', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const leadId = String(req.params.id);
    const { legalArea, formData, urgency, riskLevel, summary, nextSteps, internalNote } = req.body;
    const triage = await prisma.leadTriage.create({
      data: {
        leadId, legalArea, formData: JSON.stringify(formData),
        urgency, riskLevel, summary, nextSteps, internalNote,
      },
    });
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'TRIAGE' } });
    res.json({ success: true, triage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao salvar triagem' });
  }
});

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      res.status(400).json({ success: false, message: 'Campos obrigatórios: name, email, phone, message' });
      return;
    }
    const lead = await prisma.lead.create({
      data: {
        name, email, phone,
        description: message,
        source: 'SITE',
        status: 'NEW',
        organizationId: req.body.organizationId || (await prisma.organization.findFirst())?.id || '',
      },
    });
    res.json({ success: true, lead, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
  }
});

export default router;
