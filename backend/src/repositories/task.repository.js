import { readDatabase, writeDatabase } from '../utils/file-db.js';

export async function createManyTasks(tasks) {
  const database = await readDatabase();

  database.tasks.push(...tasks);

  await writeDatabase(database);

  return tasks;
}

export async function findTasksByRoadmapId(roadmapId) {
  const database = await readDatabase();

  return database.tasks.filter((task) => task.roadmapId === roadmapId);
}

export async function findTaskById(id) {
  const database = await readDatabase();

  return database.tasks.find((task) => task.id === id) ?? null;
}

export async function updateTask(id, payload) {
  const database = await readDatabase();

  const taskIndex = database.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  database.tasks[taskIndex] = {
    ...database.tasks[taskIndex],
    ...payload,
    updatedAt: new Date().toISOString()
  };

  await writeDatabase(database);

  return database.tasks[taskIndex];
}

export async function deleteTask(id) {
  const database = await readDatabase();

  const taskIndex = database.tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return false;
  }

  database.tasks.splice(taskIndex, 1);

  await writeDatabase(database);

  return true;
}