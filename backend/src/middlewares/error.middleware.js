import { ZodError } from 'zod';

/**
 * Middleware global de tratamento de erros.
 * Estratégia: erros específicos primeiro (Zod, AppError), genéricos por último.
 * Nunca expõe detalhes internos em produção.
 */
export function errorMiddleware(error, req, res, next) {
  // Tratamento específico para erros de validação do Zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      code: 400,
      message: 'Validation failed.',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  // Tratamento para erros customizados da aplicação (AppError)
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      status: 'error',
      code: error.statusCode,
      message: error.message
    });
  }

  // Loga erro não tratado para debugging (não expõe para cliente)
  console.error(error);

  // Resposta genérica para erros inesperados
  return res.status(500).json({
    status: 'error',
    code: 500,
    message: 'Internal server error.'
  });
}
