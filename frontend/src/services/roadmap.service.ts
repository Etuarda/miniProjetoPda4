import { api } from './api';
import { ApiResponse, Roadmap, Task } from '../types';
export async function createRoadmap(diagnosticResultId:string):Promise<Roadmap>{const response=await api.post<ApiResponse<Roadmap>>('/roadmaps',{diagnosticResultId});return response.data.data;}
export async function getRoadmapById(id:string):Promise<Roadmap>{const response=await api.get<ApiResponse<Roadmap>>(`/roadmaps/${id}`);return response.data.data;}
export async function getRoadmapTasks(id:string):Promise<Task[]>{const response=await api.get<ApiResponse<Task[]>>(`/roadmaps/${id}/tasks`);return response.data.data;}
