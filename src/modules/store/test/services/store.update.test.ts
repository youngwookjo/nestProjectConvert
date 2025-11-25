import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import storeService from '@modules/store/storeService';
import storeRepository from '@modules/store/storeRepo';
import { prisma } from '@shared/prisma';
import { mockUser, mockStore, updateStoreDto } from '@modules/store/test/mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('updateStore 메소드 테스트', () => {
  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성

    // getStoreIdByUserId가 반환할 가짜 스토어 정보
    const mockStoreInfo = {
      id: mockStore.id,
      name: mockStore.name,
    };

    // getImageUrlById가 반환할 가짜 이미지 정보
    const mockOldImage = {
      image: mockStore.image,
    };

    // update 메소드가 반환할 기대 결과
    const expectedResult = {
      ...mockStore,
      name: updateStoreDto.name!,
      content: updateStoreDto.content!,
      updatedAt: new Date(),
    };

    // 2. 레포지토리 함수 모킹
    const getStoreIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockStoreInfo);
    const getImageUrlMock = jest
      .spyOn(storeRepository, 'getImageUrlById')
      .mockResolvedValue(mockOldImage);
    const updateMock = jest.spyOn(storeRepository, 'updateStore').mockResolvedValue(expectedResult);

    // 3. 서비스 함수 호출
    const result = await storeService.updateStore(mockUser.id, mockStore.id, updateStoreDto);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인.
    expect(getStoreIdMock).toHaveBeenCalledWith(mockUser.id);
    expect(getImageUrlMock).toHaveBeenCalledWith(mockStore.id);
    expect(updateMock).toHaveBeenCalledWith(mockStore.id, updateStoreDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
