import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/clients', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes' });
  }
});

router.get('/clients/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const client = await prisma.client.findUnique({
      where: { id },
    });
    if (!client) {
      res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      return;
    }
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar cliente' });
  }
});

router.post('/clients', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.create({
      data,
    });
    res.json({ success: true, client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar cliente' });
  }
});

router.put('/clients/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = clientSchema.parse(req.body);
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar cliente' });
  }
});

router.patch('/clients/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = clientSchema.partial().parse(req.body);
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar cliente' });
  }
});

router.delete('/clients/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.client.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Cliente removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover cliente' });
  }
});

export default router;
