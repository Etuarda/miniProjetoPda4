// Eixos de conhecimento avaliados no diagnóstico de backend Node.js
const AXES = ['http', 'node', 'api', 'database', 'architecture'];

/**
 * Cria mapa otimizado para busca rápida de questões por ID.
 * Performance: O(1) lookup ao invés de O(n) busca linear.
 */
export function buildQuestionMap(questions) {
  return new Map(questions.map((question) => [question.id, question]));
}

/**
 * Calcula pontuações médias por eixo considerando pesos das questões.
 * Regra de negócio: média ponderada por importância da competência.
 */
export function calculateScores(questions, answers) {
  const questionMap = buildQuestionMap(questions);

  // Inicializa acumuladores para cada eixo
  const totals = Object.fromEntries(AXES.map((axis) => [axis, 0]));
  const counts = Object.fromEntries(AXES.map((axis) => [axis, 0]));

  // Processa cada resposta, acumulando valores ponderados
  answers.forEach((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) return; // Ignora respostas para questões não encontradas

    // Aplica peso da questão (padrão 1 se não especificado)
    totals[question.axis] += answer.value * (question.weight ?? 1);
    counts[question.axis] += question.weight ?? 1;
  });

  // Calcula médias por eixo, evitando divisão por zero
  return AXES.reduce((acc, axis) => {
    const count = counts[axis];
    acc[axis] = count === 0 ? 0 : Number((totals[axis] / count).toFixed(1));
    return acc;
  }, {});
}
