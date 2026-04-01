import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { deleteTaskController, updateTaskController } from '../../controllers/task.controller.js';
export const taskRouter=Router();
taskRouter.patch('/tasks/:id',asyncHandler(updateTaskController));
taskRouter.delete('/tasks/:id',asyncHandler(deleteTaskController));
