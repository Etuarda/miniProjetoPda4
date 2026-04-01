import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { router } from './routes/index.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

/**
 * Cria e configura a aplicação Express com middlewares essenciais.
 * Ordem dos middlewares é crítica: CORS primeiro, depois parsing, rotas, e tratamento de erros por último.
 */
export function createApp() {
  const app = express();

  const allowedOrigins = (env.corsOrigin || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  allowedOrigins.push(
    'https://miniprojetopda4.onrender.com',
    'https://miniprojetopda4-1.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174'
  );

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    }
  }));

  // Habilita parsing automático de JSON no body das requisições
  app.use(express.json());

  // Endpoint base para teste rápido de deploy / root
  app.get('/', (req, res) => res.status(200).json({
    status: 'success',
    message: 'Backend Roadmap Planner API está rodando',
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  }));

  // Endpoint de saúde para monitoramento e verificação de disponibilidade da API
  app.get('/health', (req, res) => res.status(200).json({
    status: 'success',
    data: { service: 'backend-roadmap-planner-api' }
  }));

  // Registra todas as rotas da API versionadas
  app.use(router);

  // Middleware para rotas não encontradas - deve vir antes do tratamento de erros
  app.use(notFoundMiddleware);

  // Middleware global de tratamento de erros - sempre por último para capturar tudo
  app.use(errorMiddleware);

  return app;
}
