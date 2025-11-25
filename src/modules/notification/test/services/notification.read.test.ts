import { afterEach, describe, test, expect, jest } from '@jest/globals';
import notificationService from '@modules/notification/notificationService';
import notificationRepository from '@modules/notification/notificationRepo';
import userRepository from '@modules/user/userRepo';
import { MOCK_CONSTANTS, MOCK_DATA } from './mock';

describe('markAsRead 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('markAsRead 메소드 테스트', () => {
    test('알림 읽음 처리 성공', async () => {
      const notificationId = MOCK_CONSTANTS.NOTIFICATION_ID;
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };
      const mockUnreadNotification = MOCK_DATA.unreadNotification;

      jest
        .spyOn(notificationRepository, 'getNotificationById')
        .mockResolvedValue(mockUnreadNotification);
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);
      const markAsReadMock = jest
        .spyOn(notificationRepository, 'markAsRead')
        .mockResolvedValue(MOCK_DATA.readNotification);

      await notificationService.markAsRead(notificationId, userId);

      expect(notificationRepository.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(markAsReadMock).toHaveBeenCalledWith(notificationId);
    });

    test('알림 읽음 처리 실패 - 존재하지 않는 알림', async () => {
      const notificationId = MOCK_CONSTANTS.NOTIFICATION_ID;
      const userId = MOCK_CONSTANTS.USER_ID;

      jest.spyOn(notificationRepository, 'getNotificationById').mockResolvedValue(null);

      await expect(notificationService.markAsRead(notificationId, userId)).rejects.toMatchObject({
        code: 404,
        message: '알림을 찾을 수 없습니다.',
      });
    });

    test('알림 읽음 처리 실패 - 존재하지 않는 사용자', async () => {
      const notificationId = MOCK_CONSTANTS.NOTIFICATION_ID;
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUnreadNotification = MOCK_DATA.unreadNotification;

      jest
        .spyOn(notificationRepository, 'getNotificationById')
        .mockResolvedValue(mockUnreadNotification);
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);

      await expect(notificationService.markAsRead(notificationId, userId)).rejects.toMatchObject({
        code: 404,
        message: '사용자를 찾을 수 없습니다.',
      });
    });

    test('알림 읽음 처리 실패 - 다른 사용자의 알림', async () => {
      const notificationId = MOCK_CONSTANTS.NOTIFICATION_ID;
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };
      const mockOtherUserNotification = MOCK_DATA.otherUserNotification;

      jest
        .spyOn(notificationRepository, 'getNotificationById')
        .mockResolvedValue(mockOtherUserNotification);
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);

      await expect(notificationService.markAsRead(notificationId, userId)).rejects.toMatchObject({
        code: 403,
        message: '본인의 알림만 읽음 처리할 수 있습니다.',
      });
    });

    test('알림 읽음 처리 실패 - prisma 업데이트 에러', async () => {
      const notificationId = MOCK_CONSTANTS.NOTIFICATION_ID;
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };
      const mockUnreadNotification = MOCK_DATA.unreadNotification;

      jest
        .spyOn(notificationRepository, 'getNotificationById')
        .mockResolvedValue(mockUnreadNotification);
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);
      jest
        .spyOn(notificationRepository, 'markAsRead')
        .mockRejectedValue(new Error('Prisma Client Error'));

      await expect(notificationService.markAsRead(notificationId, userId)).rejects.toThrow(
        'Prisma Client Error',
      );
    });
  });
});
