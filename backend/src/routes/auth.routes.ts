import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { loginLimiter } from '../middleware/rateLimit.middleware';

const router = Router();
const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

async function ensureBootstrapAdmin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@woojuris.com.br';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== adminEmail || password !== adminPassword) {
    return;
  }

  const organizationName = process.env.ORGANIZATION_NAME || 'Woojuris';
  const organization = await prisma.organization.findFirst()
    || await prisma.organization.create({
      data: { name: organizationName },
    });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        role: 'ADMIN',
        organizationId: existingAdmin.organizationId || organization.id,
      },
    });
    return;
  }

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });
}

// ============================================
// LOGIN - COM RATE LIMITING
// ============================================
router.post('/auth/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    await ensureBootstrapAdmin(email, password);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos',
      });
    }

    const token = generateToken(user.id, user.email, user.role, user.organizationId);

    res.json({
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
    });
  }
});

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const org = await prisma.organization.create({
      data: { name: `${name}'s Organization` },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'LAWYER',
        organizationId: org.id,
      },
    });

    const token = generateToken(user.id, user.email, user.role, user.organizationId);

    res.status(201).json({
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues,
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
    });
  }
});

router.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
    });
  }
});

router.post('/auth/logout', authMiddleware, async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

export default router;
