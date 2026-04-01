import { readFileSync } from 'fs';
import { generateId } from '../utils/id.js';

// Carrega regras de negócio para geração de roadmap a partir de arquivo JSON estático
const roadmapRules = JSON.parse(
  readFileSync(new URL('../data/roadmap-rules.json', import.meta.url), 'utf8')
);

/**
 * Limite padrão para considerar uma competência como "lacuna" no diagnóstico.
 * Valores menores indicam maior rigidez na identificação de gaps.
 */
export const DEFAULT_GAP_THRESHOLD = 2;

/**
 * Identifica lacunas no conhecimento baseado nas pontuações do diagnóstico.
 * Regra de negócio: pontuações baixas indicam necessidade de aprendizado.
 */
export function identifyGaps(scores) {
  return roadmapRules.filter((rule) => {
    const score = scores[rule.axis];
    const threshold = rule.threshold ?? DEFAULT_GAP_THRESHOLD;
    return score <= threshold;
  });
}

/**
 * Gera título padronizado para roadmap personalizado.
 * Formato: "Roadmap Backend Node.js - [Nome do Usuário]"
 */
export function buildRoadmapTitle(userName) {
  return `Roadmap Backend Node.js - ${userName}`;
}

/**
 * Cria tarefas do roadmap baseado nas lacunas identificadas.
 * Cada regra de negócio pode gerar múltiplas tarefas relacionadas.
 */
export function buildRoadmapTasks(roadmapId, scores) {
  const matchedRules = identifyGaps(scores);
  return matchedRules.flatMap((rule) =>
    rule.tasks.map((task) => ({
      id: generateId(),
      roadmapId,
      axis: rule.axis,
      title: task.title,
      description: task.description,
      status: 'pending', // Estado inicial padrão para novas tarefas
      explanation: '',
      experiment: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: null, // Null indica tarefa nunca modificada
    }))
  );
}
