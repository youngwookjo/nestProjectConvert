import type { RequestHandler } from 'express';

class DashboardValidator {
  /**
   * 대시보드 조회 요청 검증
   * 현재는 파라미터가 없으므로 빈 validator
   * 향후 쿼리 파라미터(날짜 범위 등) 추가 시 확장 가능
   */
  validateGetDashboard: RequestHandler = async (req, res, next) => {
    // 현재는 검증할 파라미터 없음
    next();
  };
}

export default new DashboardValidator();
