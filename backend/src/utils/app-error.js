/**
 * Classe para erros customizados da aplicação.
 * Permite definir códigos HTTP específicos para diferentes tipos de erro de negócio.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
