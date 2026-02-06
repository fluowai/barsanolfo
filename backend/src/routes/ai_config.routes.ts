import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

const aiConfigSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  model: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/ai-config - Listar configurações de IA
router.get('/ai-config', async (req: Request, res: Response) => {
  try {
    const { data: configs, error } = await supabase
      .from('ai_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Mascarar a API Key para segurança
    const maskedConfigs = configs?.map(c => ({
      ...c,
      api_key: c.api_key.slice(0, 6) + '...' + c.api_key.slice(-4)
    }));
    res.json({ success: true, configs: maskedConfigs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar configurações' });
  }
});

// POST /api/ai-config - Criar nova configuração
router.post('/ai-config', async (req: Request, res: Response) => {
  try {
    const data = aiConfigSchema.parse(req.body);
    const { data: config, error } = await supabase
      .from('ai_configs')
      .insert({
        provider: data.provider,
        api_key: data.apiKey,
        model: data.model,
        is_active: data.isActive ?? true
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, config: { id: config.id, provider: config.provider, model: config.model } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao salvar configuração' });
  }
});

// PUT /api/ai-config/:id - Atualizar configuração
router.put('/ai-config/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = aiConfigSchema.parse(req.body);
    const { data: config, error } = await supabase
      .from('ai_configs')
      .update({
        provider: data.provider,
        api_key: data.apiKey,
        model: data.model,
        is_active: data.isActive
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar configuração' });
  }
});

// DELETE /api/ai-config/:id - Remover configuração
router.delete('/ai-config/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('ai_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Configuração removida' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover configuração' });
  }
});

export default router;
