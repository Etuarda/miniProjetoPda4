import { api } from './api';
import { ApiResponse, DiagnosticResult } from '../types';

/**
 * Cria resultado de diagnóstico enviando respostas do questionário.
 * Processa pontuações e identifica lacunas no conhecimento.
 */
export async function createDiagnosticResult(payload: {
  userName: string;
  answers: { questionId: string; value: number; }[]
}): Promise<DiagnosticResult> {
  const response = await api.post<ApiResponse<DiagnosticResult>>('/diagnostic-results', payload);
  return response.data.data;
}
