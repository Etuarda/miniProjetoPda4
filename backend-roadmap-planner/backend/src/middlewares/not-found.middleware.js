/**
 * Middleware para tratamento de rotas não encontradas.
 * Deve ser registrado após todas as rotas da aplicação.
 */
export function notFoundMiddleware(req, res) {
  return res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Route not found.'
  });
}
