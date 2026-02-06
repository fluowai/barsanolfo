import { Router, Request, Response } from 'express';
import { z } from 'zod';
import supabase from '../lib/supabase';

const router = Router();

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'LAWYER', 'SECRETARY']).default('LAWYER'),
  avatar: z.string().optional(),
});

// GET /api/team - Listar membros da equipe
router.get('/team', async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, created_at')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao buscar equipe' });
  }
});

// POST /api/team - Criar novo membro
router.post('/team', async (req: Request, res: Response) => {
  try {
    const data = userSchema.parse(req.body);
    // Senha hash simples para demonstração (usar bcrypt em produção)
    const passwordHash = Buffer.from(data.password).toString('base64');
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        role: data.role,
        avatar: data.avatar,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'Email já cadastrado' });
      }
      throw error;
    }
    
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao criar membro' });
  }
});

// PUT /api/team/:id - Atualizar membro
router.put('/team/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, email, role, avatar })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar membro' });
  }
});

// DELETE /api/team/:id - Remover membro
router.delete('/team/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Membro removido' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao remover membro' });
  }
});

export default router;
