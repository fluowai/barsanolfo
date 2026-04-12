import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, AnyMessageContent } from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

export interface InstanceInfo {
  id: string;
  name: string;
  phone?: string;
  connected: boolean;
  qrCode?: string;
  sessionDir: string;
}

export interface ChatMessage {
  id: string;
  key: string;
  from: string;
  fromName?: string;
  message: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  status?: string;
}

class WhatsAppInstanceManager extends EventEmitter {
  private static instance: WhatsAppInstanceManager;
  private instances: Map<string, {
    sock: any;
    info: InstanceInfo;
    reconnectTimer?: NodeJS.Timeout;
  }> = new Map();
  private authState: Map<string, any> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): WhatsAppInstanceManager {
    if (!WhatsAppInstanceManager.instance) {
      WhatsAppInstanceManager.instance = new WhatsAppInstanceManager();
    }
    return WhatsAppInstanceManager.instance;
  }

  async createInstance(name: string): Promise<InstanceInfo> {
    const id = `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionDir = path.join(process.cwd(), 'whatsapp-sessions', id);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const info: InstanceInfo = {
      id,
      name,
      sessionDir,
      connected: false,
    };

    this.instances.set(id, { sock: null, info });
    
    return info;
  }

  async connectInstance(instanceId: string): Promise<InstanceInfo> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    const { state, saveCreds } = await useMultiFileAuthState(instance.info.sessionDir);
    this.authState.set(instanceId, { state, saveCreds });

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
    });

    instance.sock = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        instance.info.qrCode = qr;
        this.emit('qrcode', { instanceId, qr });
      }

      if (connection === 'open') {
        instance.info.connected = true;
        instance.info.phone = sock.user?.id?.split(':')[0];
        instance.info.qrCode = undefined;
        this.emit('connected', { instanceId, phone: instance.info.phone });
      }

      if (connection === 'close') {
        const wasConnected = instance.info.connected;
        instance.info.connected = false;
        
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect && wasConnected) {
          this.emit('disconnected', { instanceId, reason: 'reconnecting' });
          instance.reconnectTimer = setTimeout(() => {
            this.connectInstance(instanceId);
          }, 3000);
        } else if (!shouldReconnect) {
          this.emit('disconnected', { instanceId, reason: 'logged_out' });
        } else {
          this.emit('disconnected', { instanceId, reason: 'closed' });
        }
      }

      this.emit('connection_update', { instanceId, update });
    });

    sock.ev.on('messages.upsert', async (m: any) => {
      const messages = m.messages || [];
      for (const msg of messages) {
        if (msg.message && msg.key) {
          const isIncoming = !msg.key.fromMe;
          const phone = isIncoming 
            ? msg.key.remoteJid?.split('@')[0] || ''
            : msg.key.remoteJid?.split('@')[0] || '';

          const messageText = this.extractMessageText(msg);
          
          if (messageText) {
            const chatMsg: ChatMessage = {
              id: msg.key.id || `msg_${Date.now()}`,
              key: msg.key.id || '',
              from: phone,
              fromName: msg.pushName || phone,
              message: messageText,
              timestamp: msg.messageTimestamp || Date.now() / 1000,
              direction: isIncoming ? 'incoming' : 'outgoing',
              status: isIncoming ? 'received' : 'sent',
            };

            await this.saveMessage(instanceId, chatMsg);
            this.emit('message', { instanceId, message: chatMsg });
          }
        }
      }
    });

    return instance.info;
  }

  private extractMessageText(msg: any): string {
    if (!msg.message) return '';
    
    const msgType = Object.keys(msg.message)[0];
    const content = msg.message[msgType];

    if (msgType === 'conversation') return content;
    if (msgType === 'extendedTextMessage') return content.text || '';
    if (msgType === 'imageMessage') return content.caption || '[Imagem]';
    if (msgType === 'documentMessage') return content.fileName || '[Documento]';
    if (msgType === 'videoMessage') return content.caption || '[Vídeo]';
    if (msgType === 'audioMessage') return '[Áudio]';
    if (msgType === 'stickerMessage') return '[Sticker]';
    
    return '';
  }

  private async saveMessage(instanceId: string, chatMsg: ChatMessage): Promise<void> {
    try {
      await prisma.whatsAppMessage.create({
        data: {
          phone: chatMsg.from,
          message: chatMsg.message,
          direction: chatMsg.direction.toUpperCase(),
          status: chatMsg.status?.toUpperCase() || 'RECEIVED',
          messageId: chatMsg.key,
        }
      });

      await prisma.whatsAppContact.upsert({
        where: { phone: chatMsg.from },
        update: { lastMessage: new Date() },
        create: {
          phone: chatMsg.from,
          name: chatMsg.fromName,
        }
      });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  async sendMessage(instanceId: string, to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const instance = this.instances.get(instanceId);
    if (!instance || !instance.sock || !instance.info.connected) {
      return { success: false, error: 'WhatsApp não conectado' };
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const result = await instance.sock.sendMessage(`${formattedNumber}@s.whatsapp.net`, { text: message });

      const chatMsg: ChatMessage = {
        id: result?.key?.id || `msg_${Date.now()}`,
        key: result?.key?.id || '',
        from: to,
        message,
        timestamp: Date.now() / 1000,
        direction: 'outgoing',
        status: 'sent',
      };

      await this.saveMessage(instanceId, chatMsg);
      this.emit('message', { instanceId, message: chatMsg });

      return { success: true, messageId: result?.key?.id };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnectInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    if (instance.reconnectTimer) {
      clearTimeout(instance.reconnectTimer);
    }

    if (instance.sock) {
      try {
        await instance.sock.logout();
      } catch (e) {}
      instance.sock = null;
    }

    instance.info.connected = false;
    instance.info.qrCode = undefined;
    
    this.emit('disconnected', { instanceId, reason: 'manual' });
  }

  async deleteInstance(instanceId: string): Promise<void> {
    await this.disconnectInstance(instanceId);
    this.instances.delete(instanceId);
    
    const sessionDir = path.join(process.cwd(), 'whatsapp-sessions', instanceId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }

  getInstance(instanceId: string): InstanceInfo | undefined {
    return this.instances.get(instanceId)?.info;
  }

  getAllInstances(): InstanceInfo[] {
    return Array.from(this.instances.values()).map(i => i.info);
  }

  async getMessages(instanceId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.whatsAppMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return messages.map(m => ({
        id: m.id,
        key: m.messageId || m.id,
        from: m.phone,
        message: m.message,
        timestamp: new Date(m.createdAt).getTime() / 1000,
        direction: m.direction.toLowerCase() as 'incoming' | 'outgoing',
        status: m.status.toLowerCase(),
      }));
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async getContacts(instanceId: string): Promise<any[]> {
    try {
      return await prisma.whatsAppContact.findMany({
        orderBy: { lastMessage: 'desc' },
      });
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('55') && formatted.length > 12) {
      formatted = formatted.substring(2);
    }
    return formatted;
  }
}

export default WhatsAppInstanceManager.getInstance();
