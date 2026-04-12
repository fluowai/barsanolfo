import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const caseSchema = z.object({
  number: z.string(),
  type: z.string(),
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
        type: data.type,
        court: data.court,
        status: data.status || 'ACTIVE',
        value: data.value,
        filedDate: data.filedDate ? new Date(data.filedDate) : null,
        clientId: data.clientId,
        lawyerId: data.lawyerId,
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
        type: tipo || 'TRABALHISTA',
        court: tribunal,
        status: 'ACTIVE',
        value: valor,
        clientId: clienteId,
        lawyerId: advogadoId,
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
