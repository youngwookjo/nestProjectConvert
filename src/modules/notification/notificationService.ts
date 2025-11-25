import notificationRepository from '@modules/notification/notificationRepo';
import notificationServer from '@modules/notification/notificationServer';
import userRepository from '@modules/user/userRepo';
import {
  CreateNotificationDto,
  ResNotificationDto,
  ResnotifyOutOfStockDto,
} from '@modules/notification/dto/notificationDTO';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';

class NotificationService {
  createNotification = async (data: CreateNotificationDto): Promise<ResNotificationDto> => {
    const notification = await notificationRepository.createNotification(data);

    // 2. SSE로 실시간 전송 (연결되어 있는 경우에만)
    if (notificationServer.isConnected(data.userId)) {
      notificationServer.send(data.userId, 'notification', notification);
    }

    return notification;
  };

  //판매자에게 상품 품절 알림 및 장바구니에 담은 구매자들에게도 알림
  notifyOutOfStock = async (resnotifyOutOfStockDto: ResnotifyOutOfStockDto) => {
    await this.createNotification({
      userId: resnotifyOutOfStockDto.sellerId,
      content: `${resnotifyOutOfStockDto.storeName}의 '${resnotifyOutOfStockDto.productName} ${resnotifyOutOfStockDto.sizeName} 사이즈' 상품이 품절되었습니다.`,
    });

    // 장바구니에 담은 구매자들에게 알림
    for (const userId of resnotifyOutOfStockDto.cartUserIds) {
      await this.createNotification({
        userId,
        content: `장바구니의 '${resnotifyOutOfStockDto.productName} ${resnotifyOutOfStockDto.sizeName} 사이즈' 상품이 품절되었습니다.`,
      });
    }
  };

  notifyInquiryAnswered = async (buyerId: string, inquiryTitle: string) => {
    await this.createNotification({
      userId: buyerId,
      content: `등록한 문의:"${inquiryTitle}"에 답변이 달렸습니다.`,
    });
  };

  notifyNewInquiry = async (sellerId: string, productName: string) => {
    await this.createNotification({
      userId: sellerId,
      content: `등록된 상품:${productName}에 새로운 문의가 등록되었습니다.`,
    });
  };

  getNotificationList = async (userId: string): Promise<ResNotificationDto[]> => {
    const existingUser = await userRepository.getUserById(userId);
    assert(existingUser, ApiError.notFound('사용자를 찾을 수 없습니다.'));
    return notificationRepository.getNotificationList(userId);
  };

  markAsRead = async (notificationId: string, userId: string): Promise<void> => {
    const notification = await notificationRepository.getNotificationById(notificationId);
    assert(notification, ApiError.notFound('알림을 찾을 수 없습니다.'));
    const existingUser = await userRepository.getUserById(userId);
    assert(existingUser, ApiError.notFound('사용자를 찾을 수 없습니다.'));
    assert(
      notification.userId === userId,
      ApiError.forbidden('본인의 알림만 읽음 처리할 수 있습니다.'),
    );
    await notificationRepository.markAsRead(notificationId);
  };
}

export default new NotificationService();
