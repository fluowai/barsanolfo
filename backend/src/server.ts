import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { httpLogger, logger } from './lib/logger';
import contactRoutes from './routes/contact.routes';
import clientRoutes from './routes/clients.routes';
import datajudRoutes from './routes/datajud.routes';
import caseRoutes from './routes/cases.routes';
import teamRoutes from './routes/team.routes';
import authRoutes from './routes/auth.routes';
import aiConfigRoutes from './routes/ai_config.routes';
import aiRoutes from './routes/ai.routes';
import paymentRoutes from './routes/payment.routes';
import petitionRoutes from './routes/petition.routes';
import financialRoutes from './routes/financial.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import whatsappInstanceRoutes from './routes/whatsapp.instance.routes';
import deadlineRoutes from './routes/deadlines.routes';
import taskRoutes from './routes/tasks.routes';
import hearingRoutes from './routes/hearings.routes';
import documentRoutes from './routes/documents.routes';
import contractRoutes from './routes/contracts.routes';
import notificationRoutes from './routes/notifications.routes';
import marketingRoutes from './routes/marketing.routes';
import automationRoutes from './routes/automations.routes';
import supabase from './lib/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5032;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(httpLogger);

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    fontSrc: ["'self'", 'data:'],
  },
}));
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: NODE_ENV === 'production',
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisicoes deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5032',
  'http://localhost:5033',
  'http://localhost:5034',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS nao permitido para este origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: NODE_ENV });
});

app.use('/api', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', clientRoutes);
app.use('/api', datajudRoutes);
app.use('/api', caseRoutes);
app.use('/api', teamRoutes);
app.use('/api', aiConfigRoutes);
app.use('/api', aiRoutes);
app.use('/api', paymentRoutes);
app.use('/api', petitionRoutes);
app.use('/api', financialRoutes);
app.use('/api', whatsappRoutes);
app.use('/api', whatsappInstanceRoutes);
app.use('/api', deadlineRoutes);
app.use('/api', taskRoutes);
app.use('/api', hearingRoutes);
app.use('/api', documentRoutes);
app.use('/api', contractRoutes);
app.use('/api', notificationRoutes);
app.use('/api', marketingRoutes);
app.use('/api', automationRoutes);

app.use('/painel', express.static(path.join(__dirname, '../../frontend-painel/dist')));

app.get('/painel*', (req: express.Request, res: express.Response) => {
  const filePath = path.join(__dirname, '../../frontend-painel/dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ success: false, message: 'Painel nao encontrado' });
    }
  });
});

app.use(express.static(path.join(__dirname, '../../dist')));

app.get('*', (req: express.Request, res: express.Response) => {
  const filePath = path.join(__dirname, '../../dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ success: false, message: 'Pagina nao encontrada' });
    }
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({
    err,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }, 'Erro na requisicao');

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: NODE_ENV === 'development' ? err.message : undefined,
  });
});

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info(`Cliente conectado: ${socket.id}`);

  socket.on('join-lawyer', (lawyerId: string) => {
    socket.join(`lawyer-${lawyerId}`);
    logger.info(`Lawyer ${lawyerId} joined notification room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

export const notifyDeadline = (lawyerId: string, deadline: any) => {
  io.to(`lawyer-${lawyerId}`).emit('deadline-alert', {
    type: 'deadline',
    title: 'Prazo Proximo!',
    message: `O prazo "${deadline.description}" vence em ${new Date(deadline.dueDate).toLocaleDateString('pt-BR')}`,
    deadline
  });
};

setInterval(async () => {
  try {
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('id, description, due_date, case:cases(lawyer_id)')
      .eq('completed', false);

    if (!deadlines) return;

    const now = new Date();
    for (const d of deadlines as any[]) {
      const due = new Date(d.due_date);
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 24) {
        const lawyerId = d.case?.lawyer_id;
        if (lawyerId) {
          notifyDeadline(lawyerId, { id: d.id, description: d.description, dueDate: d.due_date });
        }
      }
    }
  } catch (err: any) {
    logger.error({ msg: 'Erro ao verificar prazos para notificacao', error: String(err) });
  }
}, 3600000);

httpServer.listen(PORT, () => {
  logger.info('Servidor Barsa Advocacia iniciando...');
  logger.info(`Site: http://localhost:${PORT}`);
  logger.info(`Painel: http://localhost:${PORT}/painel`);
  logger.info(`Health: http://localhost:${PORT}/api/health`);
  logger.info(`Ambiente: ${NODE_ENV}`);
  logger.info('Servidor rodando com sucesso (com WebSockets)!');
});

export default app;
