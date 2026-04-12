import { WhatsAppBaileys } from './whatsapp.baileys';

class WhatsAppService {
  private static instance: WhatsAppService;
  private baileys: WhatsAppBaileys;

  private constructor() {
    this.baileys = WhatsAppBaileys.getInstance();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async getConnectionStatus(): Promise<{
    connected: boolean;
    qrCode?: string;
    phone?: string;
  }> {
    return this.baileys.getConnectionStatus();
  }

  async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.baileys.sendMessage(to, message);
  }

  async sendTemplateMessage(to: string, template: string, variables?: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    let message = template;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }
    return this.baileys.sendMessage(to, message);
  }

  async sendMediaMessage(to: string, mediaUrl: string, caption?: string, mimeType?: string): Promise<{ success: boolean; error?: string }> {
    return this.baileys.sendMediaMessage(to, mediaUrl, caption, mimeType);
  }

  async disconnect(): Promise<void> {
    return this.baileys.disconnect();
  }

  onQRCodeUpdate(callback: (qr: string) => void): void {
    this.baileys.onQRCodeUpdate(callback);
  }

  onConnectionUpdate(callback: (update: any) => void): void {
    this.baileys.onConnectionUpdate(callback);
  }

  onMessageReceived(callback: (message: any) => void): void {
    this.baileys.onMessageReceived(callback);
  }
}

export default WhatsAppService.getInstance();
