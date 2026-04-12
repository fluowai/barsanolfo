import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { httpLogger, logger } from './lib/logger';
import contactRoutes from './routes/contact.routes';
import clientRoutes from './routes/clients.routes';
import datajudRoutes from './routes/datajud.routes';
import caseRoutes from './routes/cases.routes';
import teamRoutes from './routes/team.routes';
import authRoutes from './routes/auth.routes';
import aiConfigRoutes from './routes/ai_config.routes';
import petitionRoutes from './routes/petition.routes';
import financialRoutes from './routes/financial.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import whatsappInstanceRoutes from './routes/whatsapp.instance.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5032;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// LOGGING - PINO
// ============================================
app.use(httpLogger);

// ============================================
// SECURITY - HELMET.JS
// ============================================
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

// ============================================
// RATE LIMITING - Geral
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// CORS - CONFIGURADO COM SEGURANÇA
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || 
  ['http://localhost:5032', 'http://localhost:5033', 'http://localhost:5034', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS não permitido para este origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================================
// MIDDLEWARE - BODY PARSER
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', clientRoutes);
app.use('/api', datajudRoutes);
app.use('/api', caseRoutes);
app.use('/api', teamRoutes);
app.use('/api', aiConfigRoutes);
app.use('/api', petitionRoutes);
app.use('/api', financialRoutes);
app.use('/api', whatsappRoutes);
app.use('/api', whatsappInstanceRoutes);

// ============================================
// STATIC FILES - PAINEL
// ============================================
app.use('/painel', express.static(path.join(__dirname, '../../frontend-painel/dist')));

// Fallback para SPA (Painel) - usar middleware em vez de route
app.use('/painel', (req, res, next) => {
  if (req.url === '/painel' || req.url === '/') {
    const filePath = path.join(__dirname, '../../frontend-painel/dist/index.html');
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: 'Painel não encontrado' });
      }
    });
  } else {
    // Para rotas nested, também enviar index.html para SPA routing
    const filePath = path.join(__dirname, '../../frontend-painel/dist/index.html');
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ success: false, message: 'Painel não encontrado' });
      }
    });
  }
});

// ============================================
// STATIC FILES - SITE PRINCIPAL
// ============================================
app.use(express.static(path.join(__dirname, '../../dist')));

// Fallback para SPA (Site)
app.use((req, res, next) => {
  const filePath = path.join(__dirname, '../../dist/index.html');
  res.sendFile(filePath, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ success: false, message: 'Página não encontrada' });
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    err,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }, 'Erro na requisição');
  
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: NODE_ENV === 'development' ? err.message : undefined,
    requestId: req.id,
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  logger.info(`Servidor Barsa Advocacia iniciando...`);
  logger.info(`🚀 Site: http://localhost:${PORT}`);
  logger.info(`📊 Painel: http://localhost:${PORT}/painel`);
  logger.info(`🔍 Health: http://localhost:${PORT}/api/health`);
  logger.info(`📝 Ambiente: ${NODE_ENV}`);
  logger.info(`✅ Servidor rodando com sucesso!`);
});

export default app;
