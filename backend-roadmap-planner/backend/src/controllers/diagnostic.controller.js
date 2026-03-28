import { createDiagnostic } from '../services/diagnostic.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Controller HTTP para criação de resultados de diagnóstico.
 * Recebe dados do frontend e delega validação e processamento para o serviço de domínio.
 */
export async function createDiagnosticResultController(req, res) {
  const result = await createDiagnostic(req.body);
  return sendSuccess(res, 201, result);
}
