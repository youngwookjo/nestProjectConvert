import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import storeService from '@modules/store/storeService';
import storeRepository from '@modules/store/storeRepo';
import { prisma } from '@shared/prisma';
import { UserType } from '@prisma/client';
import { mockUser, createStoreDto } from '@modules/store/test/mock';

describe('createStore 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const expectedResult = {
      id: 'created-Store-Id',
      userId: mockUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: createStoreDto.name,
      address: createStoreDto.address,
      detailAddress: createStoreDto.detailAddress ?? null,
      phoneNumber: createStoreDto.phoneNumber,
      content: createStoreDto.content,
      image: createStoreDto.image ?? null,
    };

    // 2. 레포지토리 함수 모킹
    const getUserTypeMock = jest
      .spyOn(storeRepository, 'getUserTypeByUserId')
      .mockResolvedValue({ type: UserType.SELLER });
    const getStoreIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(null);
    const createMock = jest.spyOn(storeRepository, 'createStore').mockResolvedValue(expectedResult);

    // 3. 서비스 함수 호출
    const result = await storeService.createStore(mockUser.id, createStoreDto);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getUserTypeMock).toHaveBeenCalledWith(mockUser.id);
    expect(getStoreIdMock).toHaveBeenCalledWith(mockUser.id);
    expect(createMock).toHaveBeenCalledWith(mockUser.id, createStoreDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
