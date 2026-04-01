import { AppError } from '../utils/app-error.js';
import { generateId } from '../utils/id.js';
import { createDiagnosticResultSchema } from '../schemas/diagnostic.schema.js';
import { getQuestions } from '../repositories/question.repository.js';
import { createDiagnosticResult } from '../repositories/diagnostic.repository.js';
import { calculateScores } from './score.service.js';

/**
 * Cria um novo resultado de diagnóstico validando respostas e calculando pontuações.
 * Regra de negócio: todas as perguntas devem ser respondidas para gerar diagnóstico válido.
 */
export async function createDiagnostic(payload) {
  // Valida entrada usando schema do Zod para garantir integridade dos dados
  const parsed = createDiagnosticResultSchema.parse(payload);

  // Carrega questões para validação de completude das respostas
  const questions = await getQuestions();

  // Validação de negócio: diagnóstico só é válido com todas as perguntas respondidas
  if (parsed.answers.length !== questions.length) {
    throw new AppError('All questions must be answered before creating a diagnostic result.', 400);
  }

  // Calcula pontuações por eixo baseado nas respostas do usuário
  const scores = calculateScores(questions, parsed.answers);

  // Cria resultado do diagnóstico com dados essenciais
  const result = {
    id: generateId(),
    userName: parsed.userName,
    scores,
    createdAt: new Date().toISOString(),
  };

  // Persiste resultado no repositório de dados
  return createDiagnosticResult(result);
}
