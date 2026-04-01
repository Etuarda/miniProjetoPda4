import { listQuestions } from '../services/question.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Controller HTTP para endpoint de listagem de questões.
 * Adaptador entre protocolo HTTP e lógica de domínio.
 */
export async function getQuestionsController(req, res) {
  const questions = await listQuestions();
  return sendSuccess(res, 200, questions);
}
