import { afterEach, describe, test, expect, jest } from '@jest/globals';
import userService from '@modules/user/userService';
import userRepository from '@modules/user/userRepo';
import { MOCK_CONSTANTS, MOCK_DATA } from '@modules/user/test/services/mock';

describe('userDelete 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('deleteUser 메소드 테스트', () => {
    test('deleteUser 성공 테스트 - 이미지 있는 경우', async () => {
      // 공통 mock 데이터 사용
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockExistingUser = MOCK_DATA.getUser;
      const mockDeletedUser = MOCK_DATA.deletedUser;

      // Repository 메소드들을 mock
      const getUserByIdMock = jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockExistingUser);
      const deleteUserMock = jest
        .spyOn(userRepository, 'deleteUser')
        .mockResolvedValue(mockDeletedUser);

      const result = await userService.deleteUser(userId);

      // Mock된 메소드들이 올바른 인자와 함께 호출되었는지 확인
      expect(getUserByIdMock).toHaveBeenCalledWith(userId);
      expect(deleteUserMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDeletedUser);
    });

    test('deleteUser 성공 테스트 - 이미지 없는 경우', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockExistingUser = { ...MOCK_DATA.getUser, image: null };
      const mockDeletedUser = MOCK_DATA.deletedUserWithoutImage;

      const getUserByIdMock = jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockExistingUser);
      const deleteUserMock = jest
        .spyOn(userRepository, 'deleteUser')
        .mockResolvedValue(mockDeletedUser);

      const result = await userService.deleteUser(userId);

      expect(getUserByIdMock).toHaveBeenCalledWith(userId);
      expect(deleteUserMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDeletedUser);
    });

    test('deleteUser 실패 테스트 - 존재하지 않는 사용자', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
      await expect(userService.deleteUser(userId)).rejects.toMatchObject({
        code: 404,
        message: '존재하지 않는 사용자입니다.',
      });
    });

    test('deleteUser 실패 테스트 - prisma 삭제 에러', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockExistingUser = MOCK_DATA.getUser;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockExistingUser);
      jest.spyOn(userRepository, 'deleteUser').mockRejectedValue(new Error('Prisma Delete Error'));

      await expect(userService.deleteUser(userId)).rejects.toThrow('Prisma Delete Error');
    });
  });
});
