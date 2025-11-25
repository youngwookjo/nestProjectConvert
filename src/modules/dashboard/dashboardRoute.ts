import express from 'express';
import dashboardController from '@modules/dashboard/dashboardController';
import dashboardValidator from '@modules/dashboard/dashboardValidator';
import { authMiddleware } from '@middlewares/authMiddleware';

const dashboardRouter = express.Router();

// GET /api/dashboard - 대시보드 조회 (인증 필요)
dashboardRouter
  .route('/')
  .get(authMiddleware, dashboardValidator.validateGetDashboard, dashboardController.getDashboard);

export default dashboardRouter;
