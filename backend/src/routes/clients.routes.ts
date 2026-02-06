import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/clients - Listar clientes
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, clients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar clientes' });
  }
});

// GET /api/clients/:id - Buscar cliente por ID
router.get('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, client });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Cliente não encontrado' });
  }
});

// POST /api/clients - Criar cliente
router.post('/clients', async (req: Request, res: Response) => {
  try {
    const data = clientSchema.parse(req.body);
    const { data: client, error } = await supabase
      .from('clients')
      .insert(data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'CPF já cadastrado' });
      }
      throw error;
    }
    res.json({ success: true, client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar cliente' });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = clientSchema.parse(req.body);
    
    const { data: client, error } = await supabase
      .from('clients')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar cliente' });
  }
});

// DELETE /api/clients/:id - Remover cliente
router.delete('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Cliente removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover cliente' });
  }
});

export default router;
