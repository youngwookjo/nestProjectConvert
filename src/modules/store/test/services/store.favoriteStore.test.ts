import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import storeService from '@modules/store/storeService';
import storeRepository from '@modules/store/storeRepo';
import { prisma } from '@shared/prisma';
import { mockUser, mockStore } from '@modules/store/test/mock';

describe('favoriteStore 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const mockStoreFromDB = {
      ...mockStore,
      _count: { storeLikes: 10, products: 5 },
    };

    // 2. 레포지토리 함수 모킹
    const getStoreByIdMock = jest
      .spyOn(storeRepository, 'getStoreById')
      .mockResolvedValue(mockStoreFromDB);
    const findStoreLikeMock = jest.spyOn(storeRepository, 'getStoreLike').mockResolvedValue(null);
    const favoriteStoreMock = jest
      .spyOn(storeRepository, 'favoriteStore')
      .mockResolvedValue(undefined); // void 반환

    // 3. 서비스 함수 호출
    const result = await storeService.favoriteStore(mockUser.id, mockStore.id);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getStoreByIdMock).toHaveBeenCalledWith(mockStore.id);
    expect(findStoreLikeMock).toHaveBeenCalledWith(mockUser.id, mockStore.id);
    expect(favoriteStoreMock).toHaveBeenCalledWith(mockUser.id, mockStore.id);

    // 5. 서비스 메소드가 예상된 결과를 반환하는지 확인
    const expectedResult = {
      type: 'register',
      store: mockStore,
    };
    expect(result).toEqual(expectedResult);
  });
});
