import { Router, Request, Response } from 'express';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://www.asaas.com/api/v3';

const createChargeSchema = z.object({
  customerId: z.string().min(1),
  value: z.number().positive(),
  dueDate: z.string().min(10),
  description: z.string().optional(),
  billingType: z.enum(['BOLETO', 'PIX', 'CREDIT_CARD', 'UNDEFINED']).default('UNDEFINED'),
  clientId: z.string().optional(),
  caseId: z.string().optional(),
});

interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCode?: any;
}

interface AsaasCustomer {
  id: string;
  name: string;
}

router.post('/payments/create', async (req: Request, res: Response) => {
  try {
    const data = createChargeSchema.parse(req.body);

    if (!ASAAS_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Asaas API Key não configurada. Defina ASAAS_API_KEY no .env'
      });
    }

    const asaasPayload = {
      customer: data.customerId,
      billingType: data.billingType,
      value: data.value,
      dueDate: data.dueDate,
      description: data.description || 'Serviços advocatícios',
      externalReference: data.caseId || data.clientId || '',
    };

    const response = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify(asaasPayload),
    });

    const result = await response.json() as any;

    if (!response.ok) {
      console.error('Erro Asaas:', result);
      return res.status(response.status).json({
        success: false,
        message: `Erro ao criar cobrança: ${result.errors?.[0]?.description || 'Erro desconhecido'}`,
        details: result
      });
    }

    const payment = result as AsaasPayment;

    if (data.clientId) {
      const { supabase } = require('../lib/supabase');
      await supabase.from('invoices').insert({
        client_id: data.clientId,
        amount: data.value,
        due_date: data.dueDate,
        status: 'PENDING',
        payment_method: data.billingType === 'PIX' ? 'PIX' :
                        data.billingType === 'BOLETO' ? 'BOLETO' : 'OTHER',
        title: data.description || 'Serviços advocatícios',
        external_id: payment.id,
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        dueDate: payment.dueDate,
        invoiceUrl: payment.invoiceUrl || null,
        bankSlipUrl: payment.bankSlipUrl || null,
        pixQrCode: payment.pixQrCode || null,
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar cobrança:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: 'Erro interno ao processar pagamento' });
  }
});

router.post('/payments/customer', async (req: Request, res: Response) => {
  try {
    const customerSchema = z.object({
      name: z.string().min(1),
      cpfCnpj: z.string().min(11),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      clientId: z.string().optional(),
    });

    const data = customerSchema.parse(req.body);

    if (!ASAAS_API_KEY) {
      return res.status(400).json({ success: false, message: 'Asaas API Key não configurada' });
    }

    const response = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name: data.name,
        cpfCnpj: data.cpfCnpj,
        email: data.email,
        mobilePhone: data.phone,
        address: data.address,
        externalReference: data.clientId,
      }),
    });

    const result = await response.json() as any;

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Erro ao criar cliente: ${result.errors?.[0]?.description || 'Erro desconhecido'}`,
      });
    }

    const customer = result as AsaasCustomer;

    res.json({ success: true, customerId: customer.id, customer: result });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

router.get('/payments/status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ASAAS_API_KEY) {
      return res.status(400).json({ success: false, message: 'Asaas API Key não configurada' });
    }

    const response = await fetch(`${ASAAS_BASE_URL}/payments/${id}`, {
      headers: { 'access_token': ASAAS_API_KEY },
    });

    const result = await response.json() as any;

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Erro ao consultar pagamento' });
    }

    res.json({
      success: true,
      status: result.status,
      value: result.value,
      netValue: result.netValue,
      paymentDate: result.paymentDate || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno' });
  }
});

router.post('/payments/webhook', async (req: Request, res: Response) => {
  try {
    const { event, payment } = req.body as { event: string; payment?: { id?: string } };

    console.log('Asaas Webhook:', event, payment?.id);

    if (event === 'PAYMENT_RECEIVED' && payment?.id) {
      const { supabase } = require('../lib/supabase');

      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'PAID',
          paid_date: new Date().toISOString(),
          external_id: payment.id,
        })
        .eq('external_id', payment.id);

      if (error) {
        console.error('Erro ao atualizar invoice:', error);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ success: false });
  }
});

export default router;
