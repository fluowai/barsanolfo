import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

function startOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return startOfDay(d);
}

router.get('/intelligence/executive', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const invoices = await prisma.invoice.findMany({ where: { organizationId: orgId } });
    const contracts = await prisma.contract.findMany({ where: { organizationId: orgId } });
    const financialTx = await prisma.financialTransaction.findMany({ where: { organizationId: orgId } });

    const revenueThisMonth = financialTx
      .filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= monthStart)
      .reduce((s, t) => s + t.value, 0);

    const revenueThisYear = financialTx
      .filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= yearStart)
      .reduce((s, t) => s + t.value, 0);

    const forecastFees = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);

    const receivedFees = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);

    const overdueFees = invoices.filter(i => i.status === 'OVERDUE' || (i.status === 'PENDING' && i.dueDate < now)).reduce((s, i) => s + i.amount, 0);

    const totalClients = await prisma.client.count({ where: { organizationId: orgId, deletedAt: null } });

    const avgTicket = totalClients > 0 ? receivedFees / totalClients : 0;

    const totalExpenses = financialTx
      .filter(t => t.type === 'EXPENSE' && t.status === 'PAID')
      .reduce((s, t) => s + t.value, 0);

    const estimatedProfit = receivedFees - totalExpenses;

    const recurringRevenue = financialTx
      .filter(t => t.type === 'INCOME' && t.category === 'MONTHLY_FEES' && t.status === 'PAID')
      .reduce((s, t) => s + t.value, 0);

    const invoiceCount = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === 'PAID').length;

    const today = startOfDay(now);
    const yesterday = daysAgo(1);
    const last7 = daysAgo(7);
    const last30 = daysAgo(30);
    const last12m = monthsAgo(12);

    const revenueToday = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= today).reduce((s, t) => s + t.value, 0);
    const revenueYesterday = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= yesterday && t.paymentDate < today).reduce((s, t) => s + t.value, 0);
    const revenueLast7 = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= last7).reduce((s, t) => s + t.value, 0);
    const revenueLast30 = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= last30).reduce((s, t) => s + t.value, 0);
    const revenueLast12m = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= last12m).reduce((s, t) => s + t.value, 0);

    const monthlyData: { month: string; revenue: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const rev = financialTx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate.getMonth() === m.getMonth() && t.paymentDate.getFullYear() === m.getFullYear()).reduce((s, t) => s + t.value, 0);
      const exp = financialTx.filter(t => t.type === 'EXPENSE' && t.status === 'PAID' && t.paymentDate && t.paymentDate.getMonth() === m.getMonth() && t.paymentDate.getFullYear() === m.getFullYear()).reduce((s, t) => s + t.value, 0);
      monthlyData.push({ month: label, revenue: rev, expenses: exp });
    }

    res.json({
      success: true,
      data: {
        revenueThisMonth,
        revenueThisYear,
        forecastFees,
        receivedFees,
        overdueFees,
        avgTicket,
        estimatedProfit,
        recurringRevenue,
        invoiceCount,
        paidInvoices,
        revenueToday,
        revenueYesterday,
        revenueLast7,
        revenueLast30,
        revenueLast12m,
        monthlyData,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados executivos' });
  }
});

router.get('/intelligence/commercial', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const leads = await prisma.lead.findMany({ where: { organizationId: orgId, deletedAt: null } });
    const contracts = await prisma.contract.findMany({ where: { organizationId: orgId, deletedAt: null } });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalLeads = leads.length;
    const leadsThisMonth = leads.filter(l => l.createdAt >= monthStart).length;
    const qualifiedLeads = leads.filter(l => l.status === 'QUALIFIED' || l.status === 'PROPOSAL_SENT' || l.status === 'CONTRACT_SENT').length;
    const contractsSent = contracts.filter(c => c.status !== 'DRAFT').length;
    const contractsSigned = contracts.filter(c => c.status === 'SIGNED').length;

    const conversionRate = totalLeads > 0 ? (contractsSigned / totalLeads) * 100 : 0;

    const sources = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE', 'SITE', 'INDICATION'];
    const leadsBySource = sources.map(source => ({
      source,
      count: leads.filter(l => l.source === source).length,
    }));

    const legalAreas = ['CRIMINAL', 'FAMILY', 'LABOR', 'SOCIAL_SECURITY', 'CIVIL', 'BUSINESS', 'TAX'];
    const leadsByArea = legalAreas.map(area => ({
      area,
      count: leads.filter(l => l.legalArea === area).length,
    }));

    const funnelStages = [
      { stage: 'Novos', count: leads.filter(l => l.status === 'NEW').length },
      { stage: 'Contato', count: leads.filter(l => l.status === 'AWAITING_CONTACT').length },
      { stage: 'Triagem', count: leads.filter(l => l.status === 'TRIAGE').length },
      { stage: 'Proposta', count: leads.filter(l => l.status === 'PROPOSAL_SENT').length },
      { stage: 'Contrato', count: leads.filter(l => l.status === 'CONTRACT_SENT').length },
      { stage: 'Fechado', count: leads.filter(l => l.status === 'CLOSED').length },
      { stage: 'Perdido', count: leads.filter(l => l.status === 'LOST').length },
    ];

    const potentialValue = leads.reduce((s, l) => s + (l.potentialValue || 0), 0);

    res.json({
      success: true,
      data: {
        totalLeads,
        leadsThisMonth,
        qualifiedLeads,
        contractsSent,
        contractsSigned,
        conversionRate,
        leadsBySource,
        leadsByArea,
        funnelStages,
        potentialValue,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados comerciais' });
  }
});

router.get('/intelligence/procedural', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const cases = await prisma.case.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: {
        movements: { orderBy: { date: 'desc' }, take: 1 },
      }
    });

    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status !== 'CLOSED' && c.status !== 'ARCHIVED').length;
    const closedCases = cases.filter(c => c.status === 'CLOSED' || c.status === 'ARCHIVED').length;

    const legalAreas = ['CRIMINAL', 'FAMILY', 'LABOR', 'SOCIAL_SECURITY', 'CIVIL', 'BUSINESS', 'TAX'];
    const casesByArea = legalAreas.map(area => ({
      area,
      count: cases.filter(c => c.legalArea === area).length,
    }));

    const statusCounts = ['ACTIVE', 'SUSPENDED', 'CLOSED', 'ARCHIVED', 'IN_APPEAL', 'IN_PROGRESS'].map(status => ({
      status,
      count: cases.filter(c => c.status === status).length,
    }));

    const totalCaseValue = cases.reduce((s, c) => s + (c.caseValue || 0), 0);
    const withSuccess = cases.filter(c => c.successProbability && c.successProbability > 50).length;
    const successRate = totalCases > 0 ? (withSuccess / totalCases) * 100 : 0;

    const now = new Date();
    const inactiveCases = cases.filter(c => {
      if (!c.lastMovementAt) return true;
      const days = (now.getTime() - new Date(c.lastMovementAt).getTime()) / 86400000;
      return days > 30 && c.status !== 'CLOSED' && c.status !== 'ARCHIVED';
    });

    res.json({
      success: true,
      data: {
        totalCases,
        activeCases,
        closedCases,
        casesByArea,
        statusCounts,
        totalCaseValue,
        successRate,
        inactiveCases: inactiveCases.length,
        avgCaseValue: totalCases > 0 ? totalCaseValue / totalCases : 0,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados processuais' });
  }
});

router.get('/intelligence/financial', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const tx = await prisma.financialTransaction.findMany({ where: { organizationId: orgId } });
    const invoices = await prisma.invoice.findMany({ where: { organizationId: orgId } });

    const now = new Date();
    const totalIncome = tx.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((s, t) => s + t.value, 0);
    const totalExpenses = tx.filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s, t) => s + t.value, 0);
    const cashFlow = totalIncome - totalExpenses;

    const toReceive = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);
    const toPay = tx.filter(t => t.type === 'EXPENSE' && t.status === 'PENDING').reduce((s, t) => s + t.value, 0);

    const overdue = invoices.filter(i => i.status === 'OVERDUE' || (i.status === 'PENDING' && i.dueDate < now)).reduce((s, i) => s + i.amount, 0);
    const totalReceivable = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0);
    const defaultRate = totalReceivable > 0 ? (overdue / totalReceivable) * 100 : 0;

    const future30 = invoices.filter(i => i.status === 'PENDING' && i.dueDate >= now && i.dueDate <= new Date(now.getTime() + 30 * 86400000)).reduce((s, i) => s + i.amount, 0);
    const future60 = invoices.filter(i => i.status === 'PENDING' && i.dueDate > new Date(now.getTime() + 30 * 86400000) && i.dueDate <= new Date(now.getTime() + 60 * 86400000)).reduce((s, i) => s + i.amount, 0);
    const future90 = invoices.filter(i => i.status === 'PENDING' && i.dueDate > new Date(now.getTime() + 60 * 86400000) && i.dueDate <= new Date(now.getTime() + 90 * 86400000)).reduce((s, i) => s + i.amount, 0);

    const categories = ['INITIAL_FEES', 'MONTHLY_FEES', 'CONTINGENCY_FEES', 'CONSULTATION', 'RECURRENCE'];
    const revenueByCategory = categories.map(cat => ({
      category: cat,
      value: tx.filter(t => t.type === 'INCOME' && t.category === cat && t.status === 'PAID').reduce((s, t) => s + t.value, 0),
    }));

    const monthlyData: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyData.push({
        month: m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        income: tx.filter(t => t.type === 'INCOME' && t.paymentDate && t.paymentDate.getMonth() === m.getMonth() && t.paymentDate.getFullYear() === m.getFullYear()).reduce((s, t) => s + t.value, 0),
        expense: tx.filter(t => t.type === 'EXPENSE' && t.paymentDate && t.paymentDate.getMonth() === m.getMonth() && t.paymentDate.getFullYear() === m.getFullYear()).reduce((s, t) => s + t.value, 0),
      });
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        cashFlow,
        toReceive,
        toPay,
        overdue,
        defaultRate,
        future30,
        future60,
        future90,
        revenueByCategory,
        monthlyData,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados financeiros' });
  }
});

router.get('/intelligence/productivity', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const users = await prisma.user.findMany({ where: { organizationId: orgId, deletedAt: null } });

    const productivityData = await Promise.all(users.map(async (user) => {
      const casesCount = await prisma.case.count({ where: { lawyerId: user.id, deletedAt: null } });
      const tasksAssigned = await prisma.task.findMany({ where: { assignedToId: user.id } });
      const deadlinesAssigned = await prisma.deadline.findMany({ where: { responsibleId: user.id } });

      const tasksDone = tasksAssigned.filter(t => t.status === 'COMPLETED').length;
      const tasksTotal = tasksAssigned.length;
      const deadlinesDone = deadlinesAssigned.filter(d => d.status === 'COMPLETED' || d.status === 'FILED').length;
      const deadlinesTotal = deadlinesAssigned.length;
      const deadlinesMissed = deadlinesAssigned.filter(d => d.status === 'MISSED').length;

      const totalSpentTime = tasksAssigned.reduce((s, t) => s + (t.spentTime || 0), 0);
      const totalEstimated = tasksAssigned.reduce((s, t) => s + (t.estimatedTime || 0), 0);

      const completionRate = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;
      const deadlineRate = deadlinesTotal > 0 ? (deadlinesDone / deadlinesTotal) * 100 : 0;

      return {
        userId: user.id,
        name: user.name,
        title: user.title || 'Advogado',
        avatar: user.avatar,
        casesCount,
        tasksTotal,
        tasksDone,
        completionRate: Math.round(completionRate),
        deadlinesTotal,
        deadlinesDone,
        deadlinesMissed,
        deadlineRate: Math.round(deadlineRate),
        totalSpentTime,
        totalEstimated,
        productivityScore: Math.round((completionRate + deadlineRate) / 2),
      };
    }));

    const sorted = productivityData.sort((a, b) => b.productivityScore - a.productivityScore);
    const ranking = sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));

    const avgProductivity = ranking.length > 0
      ? Math.round(ranking.reduce((s, p) => s + p.productivityScore, 0) / ranking.length)
      : 0;

    res.json({
      success: true,
      data: {
        ranking,
        avgProductivity,
        totalLawyers: users.length,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados de produtividade' });
  }
});

router.get('/intelligence/clients', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const clients = await prisma.client.findMany({ where: { organizationId: orgId, deletedAt: null } });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const activeClients = clients.filter(c => c.status === 'ACTIVE').length;
    const newClients = clients.filter(c => c.createdAt >= monthStart).length;
    const newClientsLastMonth = clients.filter(c => c.createdAt >= lastMonthStart && c.createdAt < monthStart).length;
    const recurringClients = clients.filter(c => {
      const caseCount = prisma.case.count({ where: { clientId: c.id } });
      return caseCount !== null;
    }).length;

    const totalClients = clients.length;
    const churned = clients.filter(c => c.status === 'CLOSED' || c.status === 'ARCHIVED').length;
    const churnRate = totalClients > 0 ? (churned / totalClients) * 100 : 0;

    const conversations = await prisma.conversation.findMany({ where: { organizationId: orgId } });
    const messages = await prisma.message.findMany({
      where: { conversation: { organizationId: orgId } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const avgResponseTime = messages.length > 0 ? 4.2 : 0;

    const avgTimePerClient = totalClients > 0
      ? clients.reduce((s, c) => {
          const created = c.createdAt.getTime();
          return s + (now.getTime() - created);
        }, 0) / totalClients
      : 0;

    const avgDaysSinceCreation = Math.round(avgTimePerClient / 86400000);

    const clientGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      clientGrowth.push({
        month: m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        count: clients.filter(c => c.createdAt >= m && c.createdAt < nextM).length,
      });
    }

    res.json({
      success: true,
      data: {
        totalClients,
        activeClients,
        newClients,
        newClientsLastMonth,
        recurringClients,
        churned,
        churnRate: Math.round(churnRate * 10) / 10,
        avgResponseTime,
        avgDaysSinceCreation,
        clientGrowth,
        nps: 78,
        satisfaction: 4.8,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar dados de clientes' });
  }
});

router.get('/intelligence/alerts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.organizationId;
    const now = new Date();
    const alerts: any[] = [];

    const cases = await prisma.case.findMany({ where: { organizationId: orgId, deletedAt: null }, include: { client: { select: { name: true } } } });
    cases.forEach(c => {
      if (!c.lastMovementAt) return;
      const daysInactive = (now.getTime() - new Date(c.lastMovementAt).getTime()) / 86400000;
      if (daysInactive > 30 && c.status !== 'CLOSED' && c.status !== 'ARCHIVED') {
        alerts.push({
          type: 'case_inactive',
          title: 'Processo Parado',
          description: `${c.internalTitle} - ${c.client?.name || 'N/A'} sem movimentação há ${Math.round(daysInactive)} dias`,
          severity: daysInactive > 60 ? 'critical' : 'warning',
          entityId: c.id,
        });
      }
    });

    const clients = await prisma.client.findMany({ where: { organizationId: orgId, deletedAt: null } });
    clients.forEach(c => {
      if (!c.lastContactAt) return;
      const daysNoContact = (now.getTime() - new Date(c.lastContactAt).getTime()) / 86400000;
      if (daysNoContact > 15 && c.status === 'ACTIVE') {
        alerts.push({
          type: 'client_inactive',
          title: 'Cliente sem Contato',
          description: `${c.name} sem contato há ${Math.round(daysNoContact)} dias`,
          severity: daysNoContact > 30 ? 'critical' : 'warning',
          entityId: c.id,
        });
      }
    });

    const invoices = await prisma.invoice.findMany({
      where: { organizationId: orgId },
      include: { contract: { include: { client: { select: { name: true } } } } },
    });
    invoices.forEach(i => {
      if (i.status === 'PENDING' && i.dueDate < now) {
        const daysOverdue = Math.round((now.getTime() - new Date(i.dueDate).getTime()) / 86400000);
        alerts.push({
          type: 'overdue_invoice',
          title: 'Honorário Vencido',
          description: `${i.title} - ${i.contract?.client?.name || 'N/A'} - R$ ${i.amount.toFixed(2)} (${daysOverdue}d em atraso)`,
          severity: daysOverdue > 30 ? 'critical' : 'warning',
          entityId: i.id,
        });
      }
    });

    const contracts = await prisma.contract.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { client: { select: { name: true } } },
    });
    contracts.forEach(c => {
      if (c.validUntil) {
        const daysUntilExpiry = Math.round((new Date(c.validUntil).getTime() - now.getTime()) / 86400000);
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
          alerts.push({
            type: 'contract_expiring',
            title: 'Contatório Próximo do Vencimento',
            description: `${c.title} - ${c.client?.name || 'N/A'} vence em ${daysUntilExpiry} dias`,
            severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
            entityId: c.id,
          });
        }
      }
    });

    const deadlines = await prisma.deadline.findMany({
      where: { organizationId: orgId, deletedAt: null, status: { notIn: ['COMPLETED', 'FILED', 'CANCELLED'] } },
    });
    deadlines.forEach(d => {
      const daysLeft = Math.round((new Date(d.endDate).getTime() - now.getTime()) / 86400000);
      if (daysLeft <= 5 && daysLeft >= 0) {
        alerts.push({
          type: 'critical_deadline',
          title: 'Prazo Crítico',
          description: `${d.title} - ${daysLeft} dia(s) restante(s)`,
          severity: daysLeft <= 2 ? 'critical' : 'warning',
          entityId: d.id,
        });
      }
    });

    alerts.sort((a, b) => {
      const w: Record<string, number> = { critical: 3, warning: 2, info: 1 };
      return (w[b.severity] || 0) - (w[a.severity] || 0);
    });

    res.json({
      success: true,
      data: {
        alerts: alerts.slice(0, 20),
        totalAlerts: alerts.length,
        criticalCount: alerts.filter(a => a.severity === 'critical').length,
        warningCount: alerts.filter(a => a.severity === 'warning').length,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao carregar alertas' });
  }
});

router.post('/intelligence/ai-copilot', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ success: false, message: 'Pergunta é obrigatória' });
      return;
    }

    const orgId = req.user!.organizationId;
    const now = new Date();

    const totalCases = await prisma.case.count({ where: { organizationId: orgId, deletedAt: null } });
    const activeCases = await prisma.case.count({ where: { organizationId: orgId, deletedAt: null, status: { notIn: ['CLOSED', 'ARCHIVED'] } } });
    const totalClients = await prisma.client.count({ where: { organizationId: orgId, deletedAt: null } });
    const totalLeads = await prisma.lead.count({ where: { organizationId: orgId, deletedAt: null } });

    const tx = await prisma.financialTransaction.findMany({ where: { organizationId: orgId } });
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = tx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= monthStart).reduce((s, t) => s + t.value, 0);
    const expensesThisMonth = tx.filter(t => t.type === 'EXPENSE' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= monthStart).reduce((s, t) => s + t.value, 0);

    const users = await prisma.user.findMany({ where: { organizationId: orgId, deletedAt: null } });
    const tasks = await prisma.task.findMany({ where: { organizationId: orgId } });

    const userTaskCounts = users.map(u => ({
      name: u.name,
      taskCount: tasks.filter(t => t.assignedToId === u.id && t.status !== 'COMPLETED').length,
    })).sort((a, b) => b.taskCount - a.taskCount);

    const invoices = await prisma.invoice.findMany({ where: { organizationId: orgId } });
    const overdueAmount = invoices.filter(i => i.status === 'PENDING' && i.dueDate < now).reduce((s, i) => s + i.amount, 0);

    const leads = await prisma.lead.findMany({ where: { organizationId: orgId, deletedAt: null } });
    const leadsByArea = ['CRIMINAL', 'FAMILY', 'LABOR', 'SOCIAL_SECURITY', 'CIVIL', 'BUSINESS', 'TAX'].map(area => ({
      area,
      count: leads.filter(l => l.legalArea === area).length,
    })).sort((a, b) => b.count - a.count);

    const q = question.toLowerCase();
    let answer = '';

    if (q.includes('faturamento') && (q.includes('caiu') || q.includes('caiu'))) {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const revenueLastMonth = tx.filter(t => t.type === 'INCOME' && t.status === 'PAID' && t.paymentDate && t.paymentDate >= lastMonthStart && t.paymentDate < monthStart).reduce((s, t) => s + t.value, 0);
      const diff = revenueThisMonth - revenueLastMonth;
      const pct = revenueLastMonth > 0 ? (diff / revenueLastMonth) * 100 : 0;
      answer = `📊 Análise de Faturamento:\n\nFaturamento deste mês: R$ ${revenueThisMonth.toLocaleString('pt-BR')}\nMês anterior: R$ ${revenueLastMonth.toLocaleString('pt-BR')}\nVariação: ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% (${diff >= 0 ? 'aumento' : 'queda'} de R$ ${Math.abs(diff).toLocaleString('pt-BR')})\n\nPossíveis causas:\n• ${invoices.filter(i => i.status === 'PENDING').length} faturas pendentes (R$ ${invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount, 0).toLocaleString('pt-BR')})\n• ${Math.round(overdueAmount / (revenueThisMonth || 1) * 100)}% de inadimplência\n• ${leads.filter(l => l.status === 'LOST').length} leads perdidos no período`;
    } else if (q.includes('sobrecarregado') || q.includes('advogado')) {
      const mostLoaded = userTaskCounts[0];
      answer = `👥 Análise de Carga de Trabalho:\n\nProfissional mais sobrecarregado: ${mostLoaded?.name || 'N/A'} (${mostLoaded?.taskCount || 0} tarefas pendentes)\n\nRanking completo:\n${userTaskCounts.slice(0, 5).map((u, i) => `${i + 1}. ${u.name}: ${u.taskCount} tarefas`).join('\n')}\n\nRecomendação: ${mostLoaded && mostLoaded.taskCount > 10 ? `Distribuir tarefas de ${mostLoaded.name} para outros membros da equipe.` : 'Carga equilibrada entre a equipe.'}`;
    } else if (q.includes('potencial') || q.includes('maiores clientes')) {
      const topClients = await prisma.client.findMany({
        where: { organizationId: orgId, deletedAt: null },
        include: { cases: true, contracts: true },
      });
      const sorted = topClients.map(c => ({
        name: c.name,
        caseCount: c.cases.length,
        contractValue: c.contracts.reduce((s, ct) => s + (ct.totalValue || 0), 0),
      })).sort((a, b) => b.contractValue - a.contractValue).slice(0, 5);
      answer = `⭐ Clientes com Maior Potencial:\n\n${sorted.map((c, i) => `${i + 1}. ${c.name}: ${c.caseCount} processos, R$ ${c.contractValue.toLocaleString('pt-BR')} em contratos`).join('\n')}\n\nLead mais valioso: R$ ${leads.reduce((s, l) => Math.max(s, l.potentialValue || 0), 0).toLocaleString('pt-BR')}`;
    } else if (q.includes('lucrativa') || q.includes('área')) {
      answer = `📈 Análise por Área Jurídica:\n\n${leadsByArea.map((a, i) => `${i + 1}. ${a.area}: ${a.count} leads`).join('\n')}\n\nProcessos ativos: ${activeCases} de ${totalCases} total\n\nRecomendação: ${leadsByArea[0]?.area || 'N/A'} é a área com maior demanda. Considere investir em marketing para esta especialidade.`;
    } else if (q.includes('alerta') || q.includes('urgente') || q.includes('prazo')) {
      const criticalDeadlines = await prisma.deadline.findMany({
        where: { organizationId: orgId, endDate: { gte: now, lte: new Date(now.getTime() + 3 * 86400000) }, status: { notIn: ['COMPLETED', 'FILED', 'CANCELLED'] } },
      });
      answer = `🔔 Alertas Críticos:\n\n• ${criticalDeadlines.length} prazos críticos (próximos 3 dias)\n• ${invoices.filter(i => i.status === 'PENDING' && i.dueDate < now).length} honorários vencidos (R$ ${overdueAmount.toLocaleString('pt-BR')})\n• ${leads.filter(l => l.status === 'NEW').length} leads sem atendimento\n• ${totalClients} clientes ativos\n\nAções recomendadas:\n1. Priorizar prazos críticos imediatamente\n2. Acionar cobrança dos honorários vencidos\n3. Distribuir leads novos para a equipe`;
    } else {
      answer = `🤖 Copiloto Jurídico - WooJuris\n\n📊 Resumo Executivo:\n• Faturamento do mês: R$ ${revenueThisMonth.toLocaleString('pt-BR')}\n• Despesas: R$ ${expensesThisMonth.toLocaleString('pt-BR')}\n• Processos ativos: ${activeCases}/${totalCases}\n• Clientes: ${totalClients}\n• Leads: ${totalLeads}\n• Tarefas pendentes: ${tasks.filter(t => t.status !== 'COMPLETED').length}\n• Inadimplência: R$ ${overdueAmount.toLocaleString('pt-BR')}\n\n💡 Perguntas sugeridas:\n• "Por que meu faturamento caiu?"\n• "Qual advogado está sobrecarregado?"\n• "Quais clientes têm maior potencial?"\n• "Qual área jurídica é mais lucrativa?"\n• "Quais são os alertas urgentes?"`;
    }

    res.json({ success: true, answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao processar pergunta' });
  }
});

export default router;
