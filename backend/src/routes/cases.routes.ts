import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const caseSchema = z.object({
  number: z.string(),
  legalArea: z.string(),
  court: z.string().optional(),
  status: z.string().optional(),
  value: z.number().optional(),
  filedDate: z.string().optional(),
  clientId: z.string(),
  lawyerId: z.string(),
});

router.get('/cases', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const cases = await prisma.case.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, cases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar processos' });
  }
});

router.post('/cases', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = caseSchema.parse(req.body);
    const newCase = await prisma.case.create({
      data: {
        number: data.number,
        legalArea: data.legalArea,
        court: data.court,
        status: data.status || 'ACTIVE',
        internalTitle: data.number || `Processo ${Date.now()}`,
        caseValue: data.value,
        filedDate: data.filedDate ? new Date(data.filedDate) : null,
        client: { connect: { id: data.clientId } },
        lawyer: { connect: { id: data.lawyerId } },
        organization: { connect: { id: req.user!.organizationId } },
      },
    });
    res.json({ success: true, case: newCase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar processo' });
  }
});

router.post('/cases/import', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { numero, tipo, tribunal, valor, clienteId, advogadoId } = req.body;
    
    const newCase = await prisma.case.create({
      data: {
        number: numero,
        legalArea: tipo || 'TRABALHISTA',
        court: tribunal,
        status: 'ACTIVE',
        internalTitle: `Importado ${Date.now()}`,
        caseValue: valor,
        client: clienteId ? { connect: { id: clienteId } } : undefined,
        lawyer: { connect: { id: advogadoId } },
        organization: { connect: { id: req.user!.organizationId } },
      },
    });
    res.json({ success: true, case: newCase, message: 'Processo importado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao importar processo' });
  }
});

router.patch('/cases/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = caseSchema.partial().parse(req.body);
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...data,
        filedDate: data.filedDate ? new Date(data.filedDate) : undefined,
      },
    });
    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar processo' });
  }
});

router.delete('/cases/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.case.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Processo removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover processo' });
  }
});

export default router;
