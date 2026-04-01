// Carrega variáveis de ambiente do arquivo .env para desenvolvimento local
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configurações de ambiente centralizadas.
 * Valores padrão otimizados para desenvolvimento local com Vite (portas 5173/5174).
 */
export const env = {
  // Porta do servidor - permite override via variável de ambiente para deploy
  port: Number(process.env.PORT ?? 3000),
  // Origem permitida para CORS - aceita múltiplas origens separadas por vírgula
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174',
};
