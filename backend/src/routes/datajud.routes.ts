import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DatajudService } from '../services/datajud.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const searchSchema = z.object({
  processNumber: z.string().min(1, { message: 'Número do processo é obrigatório' })
});

const jurisprudenceSchema = z.object({
  query: z.string().min(3, { message: 'Consulta deve ter pelo menos 3 caracteres' }),
  court: z.string().optional(),
  theme: z.string().optional(),
  page: z.number().optional().default(0),
  size: z.number().optional().default(10)
});

// POST /api/datajud/search - Buscar processo
router.post('/datajud/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { processNumber } = searchSchema.parse(req.body);
    const result = await DatajudService.searchProcess(processNumber);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Erro na rota Datajud:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao consultar processo'
    });
  }
});

// GET /api/datajud/movements/:processNumber - Buscar movimentações
router.get('/datajud/movements/:processNumber', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const processNumber = String(req.params.processNumber);
    const movements = await DatajudService.getMovements(processNumber);

    res.json({
      success: true,
      movements
    });

  } catch (error: any) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar movimentações'
    });
  }
});

// POST /api/datajud/jurisprudence - Buscar jurisprudência
router.post('/datajud/jurisprudence', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { query, court, theme, page, size } = jurisprudenceSchema.parse(req.body);
    
    const result = await DatajudService.searchJurisprudence(query, court, theme, page, size);

    res.json({
      success: true,
      ...result
    });

  } catch (error: any) {
    console.error('Erro na busca de jurisprudência:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar jurisprudência'
    });
  }
});

// GET /api/datajud/courts - Listar tribunais disponíveis
router.get('/datajud/courts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const courts = await DatajudService.getAvailableCourts();

    res.json({
      success: true,
      courts
    });

  } catch (error: any) {
    console.error('Erro ao buscar tribunais:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar tribunais'
    });
  }
});

// GET /api/datajud/judges/:court - Listar magistrados
router.get('/datajud/judges/:court', authMiddleware, async (req: Request, res: Response) => {
  try {
    const court = String(req.params.court);
    const judges = await DatajudService.getJudges(court);

    res.json({
      success: true,
      judges
    });

  } catch (error: any) {
    console.error('Erro ao buscar magistrados:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao buscar magistrados'
    });
  }
});

export default router;
