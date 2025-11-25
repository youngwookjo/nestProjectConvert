import { Request, Response } from 'express';
import { metadataService } from './metadataService';

/**
 * Metadata Controller
 * 메타데이터 관련 HTTP 요청 처리
 */
class MetadataController {
  /**
   * 등급 목록 조회
   * GET /api/metadata/grades
   */
  getGradeList = async (req: Request, res: Response) => {
    const grades = await metadataService.getGradeList();
    res.status(200).json(grades);
  };
}

export const metadataController = new MetadataController();
