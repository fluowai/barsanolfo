import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import contactRoutes from './routes/contact.routes';
import clientRoutes from './routes/clients.routes';
import datajudRoutes from './routes/datajud.routes';
import caseRoutes from './routes/cases.routes';
import teamRoutes from './routes/team.routes';
import aiConfigRoutes from './routes/ai_config.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', contactRoutes);
app.use('/api', clientRoutes);
app.use('/api', datajudRoutes);
app.use('/api', caseRoutes);
app.use('/api', teamRoutes);
app.use('/api', aiConfigRoutes);

// Servir arquivos estáticos do Painel
app.use('/painel', express.static(path.join(__dirname, '../public/painel')));

// Fallback para SPA (Painel)
app.get('/painel/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/painel/index.html'));
});

// Tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
