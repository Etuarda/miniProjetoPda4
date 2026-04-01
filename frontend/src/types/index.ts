/**
 * Eixos de conhecimento avaliados no diagnóstico de backend Node.js.
 */
export type Axis = 'http' | 'node' | 'api' | 'database' | 'architecture';

/**
 * Questão do diagnóstico com peso para cálculo de pontuação.
 */
export interface Question {
  id: string;
  axis: Axis;
  prompt: string;
  guidance: Record<'1' | '2' | '3' | '4' | '5', string>;
  weight: number;
}

/**
 * Resultado de um diagnóstico com pontuações por eixo.
 */
export interface DiagnosticResult {
  id: string;
  userName: string;
  scores: Record<Axis, number>;
  createdAt: string;
}

/**
 * Roadmap gerado baseado em diagnóstico, com progresso calculado.
 */
export interface Roadmap {
  id: string;
  diagnosticResultId: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
  progress: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
  };
}

/**
 * Tarefa do roadmap com status e campos para acompanhamento.
 */
export interface Task {
  id: string;
  roadmapId: string;
  axis: Axis | 'custom';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  explanation: string;
  experiment: string;
  notes: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Estrutura padrão de resposta da API.
 */
export interface ApiResponse<T> {
  status: 'success';
  data: T;
}
