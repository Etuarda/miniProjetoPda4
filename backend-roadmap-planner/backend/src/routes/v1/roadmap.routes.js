import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { createRoadmapController, getRoadmapByIdController, getRoadmapTasksController } from '../../controllers/roadmap.controller.js';
export const roadmapRouter=Router();
roadmapRouter.post('/roadmaps',asyncHandler(createRoadmapController));
roadmapRouter.get('/roadmaps/:id',asyncHandler(getRoadmapByIdController));
roadmapRouter.get('/roadmaps/:id/tasks',asyncHandler(getRoadmapTasksController));
