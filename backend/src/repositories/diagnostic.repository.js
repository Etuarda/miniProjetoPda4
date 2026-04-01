import { readDatabase, writeDatabase } from '../utils/file-db.js';

/**
 * Repositório para resultados de diagnóstico.
 * Usa persistência em arquivo JSON para desenvolvimento - em produção migraria para banco de dados.
 */
export async function createDiagnosticResult(diagnosticResult) {
  const database = await readDatabase();

  database.diagnosticResults.push(diagnosticResult);

  await writeDatabase(database);

  return diagnosticResult;
}

/**
 * Busca resultado de diagnóstico por ID único.
 * Retorna null se não encontrado, seguindo convenção de repositórios.
 */
export async function findDiagnosticResultById(id) {
  const database = await readDatabase();

  return (
    database.diagnosticResults.find((diagnosticResult) => diagnosticResult.id === id) ??
    null
  );
}