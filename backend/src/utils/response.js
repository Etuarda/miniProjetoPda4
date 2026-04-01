/**
 * Utilitário para padronizar respostas HTTP de sucesso.
 * Garante formato consistente: { status: 'success', data: ... }
 */
export function sendSuccess(response, statusCode, data) {
  return response.status(statusCode).json({
    status: 'success',
    data
  });
}
