import { api } from './api';
import { ApiResponse, Question } from '../types';

/**
 * Busca lista de questões do diagnóstico do backend.
 * Usado para popular o questionário interativo.
 */
export async function getQuestions(): Promise<Question[]> {
  const response = await api.get<ApiResponse<Question[]>>('/questions');
  return response.data.data;
}
