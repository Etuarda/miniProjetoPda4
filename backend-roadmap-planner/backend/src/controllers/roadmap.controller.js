import { createRoadmapFromDiagnostic, getRoadmapWithProgress, listRoadmapTasks } from '../services/roadmap.service.js';
import { sendSuccess } from '../utils/response.js';
export async function createRoadmapController(req,res){const roadmap=await createRoadmapFromDiagnostic(req.body);return sendSuccess(res,201,roadmap);}
export async function getRoadmapByIdController(req,res){const roadmap=await getRoadmapWithProgress(req.params.id);return sendSuccess(res,200,roadmap);}
export async function getRoadmapTasksController(req,res){const tasks=await listRoadmapTasks(req.params.id);return sendSuccess(res,200,tasks);}
