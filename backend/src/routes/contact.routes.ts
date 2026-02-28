import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  type: z.string().min(1),
  message: z.string().min(1),
});

// GET /api/leads/stats - Estatísticas dos leads
router.get('/leads/stats', async (req: Request, res: Response) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, created_at');

    if (error) throw error;

    const total = leads.length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = leads.filter(l => new Date(l.created_at) > sevenDaysAgo).length;
    
    const byStatus = leads.reduce((acc: any, lead) => {
      const status = lead.status || 'NEW';
      const existing = acc.find((s: any) => s.status === status);
      if (existing) {
        existing._count++;
      } else {
        acc.push({ status, _count: 1 });
      }
      return acc;
    }, []);

    res.json({ 
      success: true, 
      stats: { total, recent, byStatus } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao gerar estatísticas' });
  }
});

// GET /api/leads - Listar leads
router.get('/leads', async (req: Request, res: Response) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, leads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar leads' });
  }
});

// POST /api/contact - Criar lead (formulário de contato)
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const data = leadSchema.parse(req.body);
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...data,
        source: 'WEBSITE',
        status: 'NEW'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, lead, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem' });
  }
});

// PUT /api/leads/:id/status - Atualizar status do lead
router.put('/leads/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data: lead, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

// DELETE /api/leads/:id - Remover lead
router.delete('/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Lead removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover lead' });
  }
});

export default router;
