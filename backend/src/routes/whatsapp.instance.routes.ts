import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import whatsappInstance from '../services/whatsapp.instance';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'barsa-secret-key-2024';

function sseAuth(req: any, res: any, next: any) {
  const token = req.query.token as string;
  if (!token) {
    res.status(401).json({ error: 'Token required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/instances', sseAuth, async (req: any, res: Response) => {
  try {
    const instances = whatsappInstance.getAllInstances();
    res.json({ success: true, instances });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/instances', sseAuth, async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Nome é obrigatório' });
      return;
    }
    const instance = await whatsappInstance.createInstance(name);
    res.json({ success: true, instance });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/instances/:id', sseAuth, async (req: any, res: Response) => {
  try {
    await whatsappInstance.deleteInstance(req.params.id);
    res.json({ success: true, message: 'Instância removida' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/instances/:id/status', sseAuth, async (req: any, res: Response) => {
  try {
    const instance = whatsappInstance.getInstance(req.params.id);
    if (!instance) {
      res.status(404).json({ success: false, message: 'Instância não encontrada' });
      return;
    }
    res.json({ success: true, instance });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/instances/:id/connect', sseAuth, async (req: any, res: Response) => {
  try {
    const instance = await whatsappInstance.connectInstance(req.params.id);
    res.json({ success: true, instance });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/instances/:id/disconnect', sseAuth, async (req: any, res: Response) => {
  try {
    await whatsappInstance.disconnectInstance(req.params.id);
    res.json({ success: true, message: 'Desconectado' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/instances/:id/send', sseAuth, async (req: any, res: Response) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      res.status(400).json({ success: false, message: 'Telefone e mensagem são obrigatórios' });
      return;
    }
    const result = await whatsappInstance.sendMessage(req.params.id, to, message);
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/instances/:id/messages', sseAuth, async (req: any, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await whatsappInstance.getMessages(req.params.id, limit);
    res.json({ success: true, messages });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/instances/:id/contacts', sseAuth, async (req: any, res: Response) => {
  try {
    const contacts = await whatsappInstance.getContacts(req.params.id);
    res.json({ success: true, contacts });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/instances/:id/events', sseAuth, async (req: any, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const instanceId = req.params.id;

  const onMessage = (data: any) => {
    if (data.instanceId === instanceId) {
      res.write(`event: message\ndata: ${JSON.stringify(data.message)}\n\n`);
    }
  };

  const onQRCode = (data: any) => {
    if (data.instanceId === instanceId) {
      res.write(`event: qrcode\ndata: ${data.qr}\n\n`);
    }
  };

  const onConnected = (data: any) => {
    if (data.instanceId === instanceId) {
      res.write(`event: connected\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };

  const onDisconnected = (data: any) => {
    if (data.instanceId === instanceId) {
      res.write(`event: disconnected\ndata: ${JSON.stringify(data)}\n\n`);
    }
  };

  whatsappInstance.on('message', onMessage);
  whatsappInstance.on('qrcode', onQRCode);
  whatsappInstance.on('connected', onConnected);
  whatsappInstance.on('disconnected', onDisconnected);

  res.on('close', () => {
    whatsappInstance.off('message', onMessage);
    whatsappInstance.off('qrcode', onQRCode);
    whatsappInstance.off('connected', onConnected);
    whatsappInstance.off('disconnected', onDisconnected);
    res.end();
  });
});

export default router;
