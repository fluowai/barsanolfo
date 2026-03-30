import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import contactRoutes from './routes/contact.routes';
import clientRoutes from './routes/clients.routes';
import datajudRoutes from './routes/datajud.routes';
import caseRoutes from './routes/cases.routes';
import teamRoutes from './routes/team.routes';
import authRoutes from './routes/auth.routes';
import aiConfigRoutes from './routes/ai_config.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5032;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: ['http://localhost:5032', 'http://localhost:5033', 'http://localhost:5034', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

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
  console.error(`❌ Erro em ${req.method} ${req.path}:`, err);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Servidor Barsa Advocacia rodando!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🚀 Site: http://localhost:${PORT}`);
  console.log(`📊 Painel: http://localhost:${PORT}/painel`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(60)}\n`);
});

export default app;
