import express from 'express';
import { metadataController } from './metadataController';

const metadataRouter = express.Router();

/**
 * GET /api/metadata/grades
 * 등급 목록 조회
 */
metadataRouter.get('/grades', metadataController.getGradeList);

export default metadataRouter;
