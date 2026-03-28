import { readFile } from 'fs/promises';

// Caminho para arquivo JSON estático com questões do diagnóstico
const filePath = new URL('../data/questions.json', import.meta.url);

/**
 * Repositório para acesso às questões do diagnóstico.
 * Implementação baseada em arquivo para desenvolvimento - em produção usaria banco de dados.
 */
export async function getQuestions() {
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data);
}