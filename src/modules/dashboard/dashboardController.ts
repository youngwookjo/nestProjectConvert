import { Request, Response } from 'express';
import dashboardService from '@modules/dashboard/dashboardService';

class DashboardController {
  /**
   * 대시보드 데이터를 조회합니다.
   *
   * 판매자의 매출 통계, 최다 판매 상품, 가격 범위별 매출 등을 조회합니다.
   * 인증된 사용자(판매자)만 접근 가능하며, 본인의 스토어 데이터만 조회할 수 있습니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 대시보드 데이터 (HTTP 200)
   *
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 403 - 판매자가 아닌 사용자 (구매자는 접근 불가)
   * @throws {ApiError} 404 - 사용자를 찾을 수 없음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getDashboard = async (req: Request, res: Response) => {
    // 전달할 파라미터 정의
    const sellerId = req.user.id;

    // 대시보드 데이터 조회
    const dashboard = await dashboardService.getDashboard(sellerId);

    // response 반환
    res.status(200).json(dashboard);
  };
}

export default new DashboardController();
