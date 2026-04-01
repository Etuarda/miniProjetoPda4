import { readFile } from 'node:fs/promises';
import { generateId } from '../utils/id.js';

const ROADMAP_RULES_PATH = new URL('../data/roadmap-rules.json', import.meta.url);
const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

/**
 * Lê as regras de roadmap do arquivo JSON.
 * Mantém as regras externas ao código para facilitar manutenção.
 */
async function readRoadmapRules() {
  const fileContent = await readFile(ROADMAP_RULES_PATH, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Garante que o score seja convertido para um nível válido entre 1 e 5.
 * Exemplo:
 * 1.0 -> 1
 * 2.7 -> 2
 * 4.9 -> 4
 * 5.0 -> 5
 */
export function normalizeScoreToLevel(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return MIN_LEVEL;
  }

  const normalizedLevel = Math.floor(score);

  if (normalizedLevel < MIN_LEVEL) {
    return MIN_LEVEL;
  }

  if (normalizedLevel > MAX_LEVEL) {
    return MAX_LEVEL;
  }

  return normalizedLevel;
}

/**
 * Gera título padronizado do roadmap.
 */
export function buildRoadmapTitle(userName) {
  return `Roadmap Backend Node.js - ${userName}`;
}

/**
 * Retorna as tarefas do nível atual até o nível 5.
 * Isso garante que todos os perfis recebam um roadmap.
 */
export function getProgressiveTasksForAxis(axisRule, score) {
  const currentLevel = normalizeScoreToLevel(score);
  const tasks = [];

  for (let level = currentLevel; level <= MAX_LEVEL; level += 1) {
    const levelTasks = axisRule.levels?.[String(level)] ?? [];

    for (const task of levelTasks) {
      tasks.push({
        axis: axisRule.axis,
        targetLevel: level,
        title: task.title,
        description: task.description
      });
    }
  }

  return tasks;
}

/**
 * Gera tarefas do roadmap com base nos scores do diagnóstico.
 * Cada eixo sempre produz uma trilha progressiva do nível atual até o avançado.
 */
export async function buildRoadmapTasks(roadmapId, scores) {
  const roadmapRules = await readRoadmapRules();
  const tasks = [];

  for (const axisRule of roadmapRules) {
    const axisScore = scores[axisRule.axis];
    const progressiveTasks = getProgressiveTasksForAxis(axisRule, axisScore);

    for (const task of progressiveTasks) {
      tasks.push({
        id: generateId(),
        roadmapId,
        axis: task.axis,
        targetLevel: task.targetLevel,
        title: task.title,
        description: task.description,
        status: 'pending',
        explanation: '',
        experiment: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: null
      });
    }
  }

  return tasks;
}
