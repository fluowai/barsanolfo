import { default as makeWASocket, useMultiFileAuthState, DisconnectReason, AnyMessageContent, downloadContentFromMessage, MessageType, proto } from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

interface QRCodeCallback {
  (qr: string): void;
}

interface ConnectionCallback {
  (update: any): void;
}

interface MessageCallback {
  (message: any): void;
}

export class WhatsAppBaileys {
  private static instance: WhatsAppBaileys;
  private sock: any = null;
  private authState: any = null;
  private qrCallbacks: QRCodeCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private messageCallbacks: MessageCallback[] = [];
  private isConnected: boolean = false;
  private phoneNumber: string | undefined;
  private qrCode: string | undefined;

  private constructor() {}

  public static getInstance(): WhatsAppBaileys {
    if (!WhatsAppBaileys.instance) {
      WhatsAppBaileys.instance = new WhatsAppBaileys();
    }
    return WhatsAppBaileys.instance;
  }

  async connect(): Promise<void> {
    const sessionDir = path.join(process.cwd(), 'whatsapp-session');
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    this.authState = state;

    this.sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCode = qr;
        this.qrCallbacks.forEach(cb => cb(qr));
      }

      if (connection === 'open') {
        this.isConnected = true;
        this.phoneNumber = this.sock.user?.id?.split(':')[0];
      }

      if (connection === 'close') {
        this.isConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          this.connect();
        }
      }

      this.connectionCallbacks.forEach(cb => cb(update));
    });

    this.sock.ev.on('messages.upsert', async (m: any) => {
      const messages = m.messages || m;
      messages.forEach((message: any) => {
        if (message.message && !message.key.fromMe) {
          this.messageCallbacks.forEach(cb => cb(message));
        }
      });
    });
  }

  async getConnectionStatus(): Promise<{
    connected: boolean;
    qrCode?: string;
    phone?: string;
  }> {
    return {
      connected: this.isConnected,
      qrCode: this.qrCode,
      phone: this.phoneNumber,
    };
  }

  async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.sock || !this.isConnected) {
        return { success: false, error: 'WhatsApp não conectado' };
      }

      const formattedNumber = this.formatPhoneNumber(to);
      const id = this.sock.user?.id?.split(':')[0];

      const result = await this.sock.sendMessage(`${formattedNumber}@s.whatsapp.net`, { text: message });

      return { 
        success: true, 
        messageId: result?.key?.id 
      };
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMediaMessage(
    to: string, 
    mediaUrl: string, 
    caption?: string, 
    mimeType: string = 'image/jpeg'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.sock || !this.isConnected) {
        return { success: false, error: 'WhatsApp não conectado' };
      }

      const formattedNumber = this.formatPhoneNumber(to);
      const mediaData = await this.downloadMediaFromUrl(mediaUrl);

      let message: AnyMessageContent;

      if (mimeType.startsWith('image/')) {
        message = { image: mediaData, caption };
      } else if (mimeType.startsWith('video/')) {
        message = { video: mediaData, caption };
      } else {
        message = { document: mediaData, caption, mimetype: mimeType };
      }

      const result = await this.sock.sendMessage(`${formattedNumber}@s.whatsapp.net`, message);

      return { success: true, messageId: result?.key?.id };
    } catch (error: any) {
      console.error('Erro ao enviar mídia:', error);
      return { success: false, error: error.message };
    }
  }

  private async downloadMediaFromUrl(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\D/g, '');
    
    if (formatted.startsWith('55') && formatted.length > 12) {
      formatted = formatted.substring(2);
    }
    
    if (!formatted.endsWith('@s.whatsapp.net')) {
      formatted = formatted + '@s.whatsapp.net';
    }
    
    return formatted;
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
    }
  }

  onQRCodeUpdate(callback: QRCodeCallback): void {
    this.qrCallbacks.push(callback);
  }

  onConnectionUpdate(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  onMessageReceived(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }
}
