import { readDatabase, writeDatabase } from '../utils/file-db.js';

export async function createRoadmap(roadmap) {
  const database = await readDatabase();

  database.roadmaps.push(roadmap);

  await writeDatabase(database);

  return roadmap;
}

export async function findRoadmapById(id) {
  const database = await readDatabase();

  return database.roadmaps.find((roadmap) => roadmap.id === id) ?? null;
}

export async function findRoadmapByDiagnosticResultId(diagnosticResultId) {
  const database = await readDatabase();

  return (
    database.roadmaps.find(
      (roadmap) => roadmap.diagnosticResultId === diagnosticResultId
    ) ?? null
  );
}

export async function updateRoadmapStatus(id, status) {
  const database = await readDatabase();

  const roadmapIndex = database.roadmaps.findIndex((roadmap) => roadmap.id === id);

  if (roadmapIndex === -1) {
    return null;
  }

  database.roadmaps[roadmapIndex] = {
    ...database.roadmaps[roadmapIndex],
    status,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);

  return database.roadmaps[roadmapIndex];
}