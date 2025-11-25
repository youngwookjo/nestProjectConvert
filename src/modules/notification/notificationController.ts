import { Request, Response } from 'express';
import notificationService from '@modules/notification/notificationService';
import notificationServer from '@modules/notification/notificationServer';

class NotificationController {
  /**
   * @description SSE 연결 엔드포인트
   *
   * 알람을 실시간으로 수신하기 위한 SSE 연결을 설정합니다.
   * 클라이언트는 이 엔드포인트에 연결하여 서버로부터 푸시 알림을 받습니다.
   * @param req
   * @param res
   *
   */
  connectSSE = (req: Request, res: Response) => {
    const userId = req.user.id;

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.status(200);

    // SSE 연결 등록
    notificationServer.connect(userId, res);

    // 클라이언트 연결 종료 시 정리
    req.on('close', () => {
      notificationServer.disconnect(userId);
    });
  };

  /**
   * @description
   * 알림 목록 조회
   * 사용자가 받은 알림 목록을 조회합니다.
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} 알림 목록 (HTTP 200)
   *
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getNotificationList = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const notificationList = await notificationService.getNotificationList(userId);
    res.json(notificationList);
  };

  /**
   * @description
   * 알림 읽음 처리
   * 특정 알림을 읽음 처리합니다.
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} 읽음 처리된 알림 정보 (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 403 - 본인의 알림이 아닌 경우
   * @throws {ApiError} 500 - 서버 내부 오류
   *
   */
  markAsRead = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { alarmId } = req.params;

    await notificationService.markAsRead(alarmId, userId);
    res.sendStatus(204);
  };
}

export default new NotificationController();
