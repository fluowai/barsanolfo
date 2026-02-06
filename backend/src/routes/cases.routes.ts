import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

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

// GET /api/cases - Listar processos
router.get('/cases', async (req: Request, res: Response) => {
  try {
    const { data: cases, error } = await supabase
      .from('cases')
      .select(`
        *,
        clients (id, name, email),
        users (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, cases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar processos' });
  }
});

// POST /api/cases - Criar processo
router.post('/cases', async (req: Request, res: Response) => {
  try {
    const data = caseSchema.parse(req.body);
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        number: data.number,
        type: data.type,
        court: data.court,
        status: data.status || 'ACTIVE',
        value: data.value,
        filed_date: data.filedDate,
        client_id: data.clientId,
        lawyer_id: data.lawyerId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Número de processo já cadastrado' });
      }
      throw error;
    }
    res.json({ success: true, case: newCase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar processo' });
  }
});

// POST /api/cases/import - Importar processo do Datajud
router.post('/cases/import', async (req: Request, res: Response) => {
  try {
    const { numero, tipo, tribunal, valor, clienteId, advogadoId } = req.body;
    
    const { data: newCase, error } = await supabase
      .from('cases')
      .insert({
        number: numero,
        type: tipo || 'TRABALHISTA',
        court: tribunal,
        status: 'ACTIVE',
        value: valor,
        client_id: clienteId,
        lawyer_id: advogadoId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Processo já importado' });
      }
      throw error;
    }
    res.json({ success: true, case: newCase, message: 'Processo importado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao importar processo' });
  }
});

// DELETE /api/cases/:id - Remover processo
router.delete('/cases/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Processo removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover processo' });
  }
});

export default router;
