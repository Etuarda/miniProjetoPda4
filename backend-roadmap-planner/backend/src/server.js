// Inicializa e configura a aplicação Express com middlewares e rotas
import { createApp } from './app.js';
// Carrega configurações de ambiente (porta, CORS, etc.)
import { env } from './config/env.js';

// Cria instância da aplicação com todas as configurações necessárias
const app = createApp();

// Inicia servidor na porta definida, permitindo conexões externas para desenvolvimento
app.listen(env.port, () => {
  console.log(`Backend Roadmap Planner API running on port ${env.port}`);
});
