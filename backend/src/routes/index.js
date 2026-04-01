import { Router } from 'express';
import { questionRouter } from './v1/question.routes.js';
import { diagnosticRouter } from './v1/diagnostic.routes.js';
import { roadmapRouter } from './v1/roadmap.routes.js';
import { taskRouter } from './v1/task.routes.js';

/**
 * Router principal da API versionada.
 * Organiza endpoints por domínio: questões, diagnósticos, roadmaps e tarefas.
 */
export const router = Router();

// Prefixo v1 para versionamento da API - permite evoluções futuras
router.use('/api/v1', questionRouter);
router.use('/api/v1', diagnosticRouter);
router.use('/api/v1', roadmapRouter);
router.use('/api/v1', taskRouter);
