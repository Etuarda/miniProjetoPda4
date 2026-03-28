import { readFile, writeFile } from 'fs/promises';

// Caminho para arquivo JSON que simula banco de dados
const databasePath = new URL('../data/db.json', import.meta.url);

// Estrutura inicial do banco de dados para desenvolvimento
const initialDatabase = {
  diagnosticResults: [],
  roadmaps: [],
  tasks: []
};

/**
 * Lê dados do "banco de dados" baseado em arquivo JSON.
 * Cria arquivo inicial se não existir - conveniência para desenvolvimento.
 */
export async function readDatabase() {
  try {
    const fileContent = await readFile(databasePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Inicializa banco de dados se arquivo não existir
    if (error.code === 'ENOENT') {
      await writeDatabase(initialDatabase);
      return initialDatabase;
    }

    throw error;
  }
}

/**
 * Persiste dados no "banco de dados" baseado em arquivo JSON.
 * Formatação com indentação para legibilidade em desenvolvimento.
 */
export async function writeDatabase(data) {
  await writeFile(databasePath, JSON.stringify(data, null, 2), 'utf-8');
}