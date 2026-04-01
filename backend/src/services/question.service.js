import { getQuestions } from '../repositories/question.repository.js';

/**
 * Serviço de domínio para questões do diagnóstico.
 * Abstrai acesso aos dados, permitindo futuras validações ou regras de negócio.
 */
export async function listQuestions() {
  return getQuestions();
}
