import { AppError } from '../utils/app-error.js';
import { updateTaskSchema } from '../schemas/task.schema.js';
import { deleteTask, findTaskById, updateTask } from '../repositories/task.repository.js';
export async function updateTaskById(taskId,payload){const parsed=updateTaskSchema.parse(payload);const existing=await findTaskById(taskId);if(!existing){throw new AppError('Task not found.',404);}return updateTask(taskId,parsed);}
export async function deleteTaskById(taskId){const existing=await findTaskById(taskId);if(!existing){throw new AppError('Task not found.',404);}await deleteTask(taskId);return {deleted:true,id:taskId};}
