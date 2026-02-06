
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { DatajudService } from '../services/datajud.service';

const router = Router();

// Schema de validação
const searchSchema = z.object({
  processNumber: z.string().min(1, { message: 'Número do processo é obrigatório' })
});

// POST /api/datajud/search - Buscar processo
router.post('/datajud/search', async (req: Request, res: Response) => {
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

    // Erros conhecidos do serviço
    if (error.message && error.message.includes('Não foi possível identificar')) {
       return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao consultar processo'
    });
  }
});

export default router;
