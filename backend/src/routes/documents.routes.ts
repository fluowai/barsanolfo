import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const documentSchema = z.object({
  name: z.string().min(1),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  category: z.string().default('OTHER'),
  status: z.string().default('PENDING'),
  visibleToClient: z.boolean().default(false),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});

router.get('/documents', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        client: { select: { id: true, name: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar documentos' });
  }
});

router.post('/documents', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = documentSchema.parse(req.body);
    const document = await prisma.document.create({
      data: {
        organizationId: req.user!.organizationId,
        name: data.name,
        clientId: data.clientId,
        caseId: data.caseId,
        category: data.category,
        status: data.status,
        visibleToClient: data.visibleToClient,
        notes: data.notes,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        uploadedById: req.user!.id,
      },
    });
    res.json({ success: true, document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar documento' });
  }
});

router.get('/documents/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        case: { select: { id: true, number: true, internalTitle: true } },
        versions: { orderBy: { version: 'desc' } },
      },
    });
    if (!document) {
      res.status(404).json({ success: false, message: 'Documento não encontrado' });
      return;
    }
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar documento' });
  }
});

router.put('/documents/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = documentSchema.partial().parse(req.body);
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...data,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
    });
    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar documento' });
  }
});

router.delete('/documents/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.document.delete({ where: { id } });
    res.json({ success: true, message: 'Documento removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover documento' });
  }
});

export default router;
