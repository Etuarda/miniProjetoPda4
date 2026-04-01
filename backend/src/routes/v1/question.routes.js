import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { getQuestionsController } from '../../controllers/question.controller.js';

/**
 * Router para endpoints relacionados a questões do diagnóstico.
 * Agrupa operações de leitura de questões para o questionário.
 */
export const questionRouter = Router();

// Endpoint para buscar todas as questões disponíveis no diagnóstico
questionRouter.get('/questions', asyncHandler(getQuestionsController));
