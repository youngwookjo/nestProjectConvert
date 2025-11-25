import { afterEach, describe, test, expect, jest } from '@jest/globals';
import userService from '@modules/user/userService';
import userRepository from '@modules/user/userRepo';
import { MOCK_CONSTANTS, MOCK_DATA } from '@modules/user/test/services/mock';

describe('getUser 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUser 메소드 테스트', () => {
    test('getUser 성공 테스트', async () => {
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(MOCK_DATA.getUser);
      const result = await userService.getUser(MOCK_CONSTANTS.USER_ID);

      expect(userRepository.getUserById).toHaveBeenCalledWith(MOCK_CONSTANTS.USER_ID);
      expect(result).toEqual(MOCK_DATA.getUserResponse);
    });

    test('getUser 실패 테스트 - 존재하지 않는 사용자', async () => {
      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
      await expect(userService.getUser(MOCK_CONSTANTS.USER_ID)).rejects.toMatchObject({
        code: 404,
        message: '존재하지 않는 사용자입니다.',
      });
    });
  });
});
