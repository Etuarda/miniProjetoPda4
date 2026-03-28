import { z } from 'zod';

/**
 * Schema para criação de roadmap baseado em resultado de diagnóstico.
 * Garante que o ID do diagnóstico seja um UUID válido.
 */
export const createRoadmapSchema = z.object({
  diagnosticResultId: z.string().uuid()
});
