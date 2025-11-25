import { afterEach, describe, test, expect, jest } from '@jest/globals';
import userService from '@modules/user/userService';
import userRepository from '@modules/user/userRepo';
import { MOCK_CONSTANTS, MOCK_DATA } from '@modules/user/test/services/mock';

describe('getFavoriteStoreList 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getFavoriteStoreList 메소드 테스트', () => {
    test('getFavoriteStoreList 성공 테스트 - 찜한 상점이 있는 경우', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const mockFavoriteStores = MOCK_DATA.favoriteStoreList;

      // Repository 메소드를 mock
      const getFavoriteStoreListMock = jest
        .spyOn(userRepository, 'getFavoriteStoreList')
        .mockResolvedValue(mockFavoriteStores);

      const result = await userService.getFavoriteStoreList(userId);

      // Mock된 메소드가 올바른 인자와 함께 호출되었는지 확인
      expect(getFavoriteStoreListMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFavoriteStores);
      expect(result).toHaveLength(2);
      expect(result[0].storeId).toBe(MOCK_CONSTANTS.STORE_ID_1);
      expect(result[0].store.name).toBe(MOCK_CONSTANTS.STORE_NAME_1);
      expect(result[1].storeId).toBe(MOCK_CONSTANTS.STORE_ID_2);
      expect(result[1].store.name).toBe(MOCK_CONSTANTS.STORE_NAME_2);
    });

    test('getFavoriteStoreList 성공 테스트 - 찜한 상점이 없는 경우', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;
      const emptyList = MOCK_DATA.emptyFavoriteStoreList;

      // Repository 메소드를 mock
      const getFavoriteStoreListMock = jest
        .spyOn(userRepository, 'getFavoriteStoreList')
        .mockResolvedValue(emptyList);

      const result = await userService.getFavoriteStoreList(userId);

      // Mock된 메소드가 올바른 인자와 함께 호출되었는지 확인
      expect(getFavoriteStoreListMock).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('getFavoriteStoreList 실패 테스트 - prisma 조회 에러', async () => {
      const userId = MOCK_CONSTANTS.USER_ID;

      // Prisma 조회 실패를 시뮬레이션
      jest
        .spyOn(userRepository, 'getFavoriteStoreList')
        .mockRejectedValue(new Error('Prisma Client Error'));

      await expect(userService.getFavoriteStoreList(userId)).rejects.toThrow('Prisma Client Error');
    });
  });
});
