import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.string().default('LAWYER'),
  title: z.string().optional(),
  oab: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().default('ACTIVE'),
});

router.get('/team', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true, name: true, email: true, role: true,
        title: true, oab: true, phone: true, avatar: true,
        status: true, createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar equipe' });
  }
});

router.post('/team', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = userSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email já cadastrado' });
      return;
    }

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 10)
      : await bcrypt.hash('123456', 10);

    const user = await prisma.user.create({
      data: {
        organizationId: req.user!.organizationId,
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        title: data.title,
        oab: data.oab,
        phone: data.phone,
        status: data.status,
      },
      select: { id: true, name: true, email: true, role: true, title: true, oab: true, phone: true, status: true, createdAt: true },
    });

    res.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar membro' });
  }
});

router.put('/team/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, email, role, title, oab, phone, status } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, title, oab, phone, status },
      select: { id: true, name: true, email: true, role: true, title: true, oab: true, phone: true, status: true },
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar membro' });
  }
});

router.delete('/team/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Membro removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover membro' });
  }
});

export default router;
