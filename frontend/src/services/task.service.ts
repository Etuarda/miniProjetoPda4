import { api } from './api';
import { ApiResponse, Task } from '../types';
export async function updateTask(id:string,payload:{status?:'pending'|'in_progress'|'completed';explanation?:string;experiment?:string;notes?:string;}):Promise<Task>{const response=await api.patch<ApiResponse<Task>>(`/tasks/${id}`,payload);return response.data.data;}
export async function deleteTask(id:string):Promise<void>{await api.delete(`/tasks/${id}`);}
