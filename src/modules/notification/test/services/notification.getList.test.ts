import { afterEach, describe, test, expect, jest } from '@jest/globals';
import notificationService from '@modules/notification/notificationService';
import notificationRepository from '@modules/notification/notificationRepo';
import userRepository from '@modules/user/userRepo';
import { MOCK_CONSTANTS, MOCK_DATA } from './mock';

describe('getNotificationList 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNotificationList 메소드 테스트', () => {
    test('알림 목록 조회 성공 - 알림이 있는 경우', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };
      const mockNotifications = MOCK_DATA.notificationList;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);
      const getNotificationListMock = jest
        .spyOn(notificationRepository, 'getNotificationList')
        .mockResolvedValue(mockNotifications);

      const result = await notificationService.getNotificationList(userId);

      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(getNotificationListMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockNotifications);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(MOCK_CONSTANTS.NOTIFICATION_ID);
      expect(result[1].id).toBe(MOCK_CONSTANTS.NOTIFICATION_ID_2);
    });

    test('알림 목록 조회 성공 - 알림이 없는 경우', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };
      const emptyList = MOCK_DATA.emptyNotificationList;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);
      const getNotificationListMock = jest
        .spyOn(notificationRepository, 'getNotificationList')
        .mockResolvedValue(emptyList);

      const result = await notificationService.getNotificationList(userId);

      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(getNotificationListMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('알림 목록 조회 실패 - 존재하지 않는 사용자', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);

      await expect(notificationService.getNotificationList(userId)).rejects.toMatchObject({
        code: 404,
        message: '사용자를 찾을 수 없습니다.',
      });
    });

    test('알림 목록 조회 실패 - prisma 조회 에러', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockUser = { id: userId, name: '테스트유저' };

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockUser as any);
      jest
        .spyOn(notificationRepository, 'getNotificationList')
        .mockRejectedValue(new Error('Prisma Client Error'));

      await expect(notificationService.getNotificationList(userId)).rejects.toThrow(
        'Prisma Client Error',
      );
    });
  });
});
