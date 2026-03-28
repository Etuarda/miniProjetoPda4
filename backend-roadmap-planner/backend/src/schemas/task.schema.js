import { z } from 'zod';

/**
 * Schema para atualização parcial de tarefas.
 * Permite modificar apenas campos específicos com validação de tamanho.
 * Regra de negócio: pelo menos um campo deve ser fornecido.
 */
export const updateTaskSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  explanation: z.string().max(4000).optional(),
  experiment: z.string().max(4000).optional(),
  notes: z.string().max(4000).optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field must be provided for update.'
});
