import { deleteTaskById, updateTaskById } from '../services/task.service.js';
import { sendSuccess } from '../utils/response.js';
export async function updateTaskController(req,res){const task=await updateTaskById(req.params.id,req.body);return sendSuccess(res,200,task);}
export async function deleteTaskController(req,res){const result=await deleteTaskById(req.params.id);return sendSuccess(res,200,result);}
