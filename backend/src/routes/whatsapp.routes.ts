import { Router, Request, Response } from 'express';
import { z } from 'zod';
import WhatsAppService from '../services/whatsapp.service';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

const sendMessageSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1),
});

const sendTemplateSchema = z.object({
  to: z.string().min(1),
  templateId: z.string().min(1),
  variables: z.record(z.string()).optional(),
});

// WhatsApp config schema
const whatsappConfigSchema = z.object({
  autoReply: z.boolean().optional(),
  welcomeMessage: z.string().optional(),
  reminderHours: z.number().optional(),
});

// GET /api/whatsapp/status - Status da conexão
router.get('/whatsapp/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const status = await WhatsAppService.getConnectionStatus();
    
    // Buscar config
    const config = await prisma.whatsAppConfig.findFirst();
    
    res.json({
      success: true,
      status: {
        ...status,
        config: config || null
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/connect - Conectar WhatsApp
router.post('/whatsapp/connect', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { qrCode } = await WhatsAppService.getConnectionStatus();
    
    if (qrCode) {
      res.json({
        success: true,
        message: 'QR Code disponível',
        qrCode
      });
    } else {
      // Iniciar conexão
      await WhatsAppService.connect();
      
      // Aguardar QR
      setTimeout(async () => {
        const status = await WhatsAppService.getConnectionStatus();
        if (status.qrCode) {
          // QR disponível via callback
        }
      }, 1000);
      
      res.json({
        success: true,
        message: 'Conectando...'
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/disconnect - Desconectar WhatsApp
router.post('/whatsapp/disconnect', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await WhatsAppService.disconnect();
    res.json({ success: true, message: 'Desconectado' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/send - Enviar mensagem
router.post('/whatsapp/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { to, message } = sendMessageSchema.parse(req.body);
    
    const result = await WhatsAppService.sendMessage(to, message);
    
    // Salvar no histórico
    await prisma.whatsAppMessage.create({
      data: {
        phone: to,
        message,
        direction: 'OUTGOING',
        status: result.success ? 'DELIVERED' : 'FAILED',
        messageId: result.messageId,
      }
    });
    
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/send-template - Enviar template
router.post('/whatsapp/send-template', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { to, templateId, variables } = sendTemplateSchema.parse(req.body);
    
    const template = await prisma.whatsAppTemplate.findUnique({
      where: { id: templateId }
    });
    
    if (!template) {
      res.status(404).json({ success: false, message: 'Template não encontrado' });
      return;
    }
    
    const result = await WhatsAppService.sendTemplateMessage(
      to, 
      template.content, 
      variables
    );
    
    // Salvar no histórico
    await prisma.whatsAppMessage.create({
      data: {
        phone: to,
        message: template.content,
        direction: 'OUTGOING',
        status: result.success ? 'DELIVERED' : 'FAILED',
        templateId: template.id,
      }
    });
    
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/whatsapp/messages - Histórico de mensagens
router.get('/whatsapp/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    res.json({ success: true, messages });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/whatsapp/templates - Listar templates
router.get('/whatsapp/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    
    res.json({ success: true, templates });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/templates - Criar template
router.post('/whatsapp/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, content, type } = req.body;
    
    const template = await prisma.whatsAppTemplate.create({
      data: { name, content, type: type || 'CUSTOM' }
    });
    
    res.status(201).json({ success: true, template });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/whatsapp/templates/:id - Remover template
router.delete('/whatsapp/templates/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.whatsAppTemplate.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, message: 'Template removido' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/whatsapp/contacts - Listar contatos
router.get('/whatsapp/contacts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await prisma.whatsAppContact.findMany({
      orderBy: { lastMessage: 'desc' },
    });
    
    res.json({ success: true, contacts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/whatsapp/contacts - Adicionar contato
router.post('/whatsapp/contacts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { phone, name, clientId } = req.body;
    
    const contact = await prisma.whatsAppContact.create({
      data: { phone, name, clientId }
    });
    
    res.status(201).json({ success: true, contact });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/whatsapp/config - Atualizar configuração
router.put('/whatsapp/config', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = whatsappConfigSchema.parse(req.body);
    
    let config = await prisma.whatsAppConfig.findFirst();
    
    if (config) {
      config = await prisma.whatsAppConfig.update({
        where: { id: config.id },
        data,
      });
    } else {
      config = await prisma.whatsAppConfig.create({
        data,
      });
    }
    
    res.json({ success: true, config });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Configurar callbacks do WhatsApp
WhatsAppService.onQRCodeUpdate((qr) => {
  console.log('📱 QR Code atualizado:', qr.substring(0, 50) + '...');
});

WhatsAppService.onConnectionUpdate((update) => {
  console.log('📱 WhatsApp status:', update.connection);
});

export default router;
