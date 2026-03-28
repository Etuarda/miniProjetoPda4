/**
 * Wrapper para handlers assíncronos do Express.
 * Captura rejeições de Promise e as converte em erros para o middleware de erro.
 */
export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
