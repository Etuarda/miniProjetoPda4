import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { createDiagnosticResultController } from '../../controllers/diagnostic.controller.js';
export const diagnosticRouter=Router();
diagnosticRouter.post('/diagnostic-results',asyncHandler(createDiagnosticResultController));
