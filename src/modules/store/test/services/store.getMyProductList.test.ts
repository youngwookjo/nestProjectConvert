import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import storeService from '@modules/store/storeService';
import storeRepository from '@modules/store/storeRepo';
import { GetMyProductListDto } from '@modules/store/dto/storeDTO';
import { prisma } from '@shared/prisma';
import { mockUser, mockStore, mockProducts } from '@modules/store/test/mock';

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('getMyProductList 메소드 테스트', () => {
  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const getMyProductListDto: GetMyProductListDto = {
      page: 1,
      pageSize: 10,
    };
    // 서비스가 처음에 호출하는 getStoreIdByUserId가 반환할 가짜 스토어 정보
    const mockExistingStore = {
      id: mockStore.id, // storeId가 일치해야 소유권 검사를 통과합니다.
      name: mockStore.name,
    };
    const mockProductList = {
      list: [
        {
          id: mockProducts[0].id,
          name: mockProducts[0].name,
          price: mockProducts[0].price,
          image: mockProducts[0].image,
          stock: 0,
          isDiscount: false,
          isSoldOut: true,
          createdAt: mockProducts[0].createdAt,
        },
        {
          id: mockProducts[1].id,
          name: mockProducts[0].name,
          price: mockProducts[0].price,
          image: mockProducts[0].image,
          stock: 5,
          isDiscount: true,
          isSoldOut: false,
          createdAt: mockProducts[0].createdAt,
        },
      ],
      totalCount: 2,
    };

    // 2. 레포지토리 함수 모킹
    const checkStoreMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockExistingStore);
    const getProductListMock = jest
      .spyOn(storeRepository, 'getProductListByStoreId')
      .mockResolvedValue(mockProductList);

    // 3. 서비스 함수 호출
    const result = await storeService.getMyProductList(mockUser.id, getMyProductListDto);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(checkStoreMock).toHaveBeenCalledWith(mockUser.id);
    expect(getProductListMock).toHaveBeenCalledWith(mockExistingStore.id, getMyProductListDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(mockProductList);
  });
});
