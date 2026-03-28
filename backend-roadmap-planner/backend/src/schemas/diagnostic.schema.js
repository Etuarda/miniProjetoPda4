import { z } from 'zod';

/**
 * Schema para validação de resposta individual no diagnóstico.
 * Garante que cada resposta tenha ID válido e valor entre 1-5.
 */
const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(1).max(5)
});

/**
 * Schema para criação de resultado de diagnóstico.
 * Valida nome do usuário e array de respostas obrigatórias.
 */
export const createDiagnosticResultSchema = z.object({
  userName: z.string().trim().min(2).max(60),
  answers: z.array(answerSchema).min(1)
});
