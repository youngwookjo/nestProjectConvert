import { Response } from 'express';
import { ResNotificationDto } from '@modules/notification/dto/notificationDTO';

interface Connection {
  res: Response;
  heartbeatInterval: NodeJS.Timeout;
}

class NotificationServer {
  private connections: Map<string, Connection> = new Map();

  /**
   * SSE 연결 등록
   */
  connect = (userId: string, res: Response) => {
    // 이미 연결되어 있으면 기존 연결 종료
    if (this.connections.has(userId)) {
      this.disconnect(userId);
    }

    // 30초마다 heartbeat 전송 (연결 유지)
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (error) {
        this.disconnect(userId);
      }
    }, 30000);

    // 연결 저장
    this.connections.set(userId, { res, heartbeatInterval });

    // 연결 종료 시 자동 정리
    res.on('close', () => {
      this.disconnect(userId);
    });
  };

  /**
   * SSE 연결 해제
   */
  disconnect = (userId: string) => {
    const connection = this.connections.get(userId);
    if (connection) {
      clearInterval(connection.heartbeatInterval);
      this.connections.delete(userId);
    }
  };

  /**
   * 특정 사용자에게 알림 전송
   */
  send = (userId: string, event: string, data: ResNotificationDto) => {
    const connection = this.connections.get(userId);
    if (connection) {
      try {
        connection.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        this.disconnect(userId);
      }
    }
  };

  /**
   * 연결 여부 확인
   */
  isConnected = (userId: string): boolean => {
    return this.connections.has(userId);
  };
}

export default new NotificationServer();
