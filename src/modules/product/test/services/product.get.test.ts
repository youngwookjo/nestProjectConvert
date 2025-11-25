import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import productService from '@modules/product/productService';
import productRepository from '@modules/product/productRepo';
import { prisma } from '@shared/prisma';
import { mockProduct, mockStore } from '@modules/product/test/mock';

describe('getProduct 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const mockProductWithRelations = {
      ...mockProduct,
      store: mockStore,
      orderItems: [],
    };

    // _processProductStats의 결과를 시뮬레이션
    const processedStats = productService['_processProductStats'](mockProductWithRelations);
    const { reviews, stocks, store, ...restOfProduct } = mockProductWithRelations;

    const expectedResult = {
      ...restOfProduct,
      storeName: store.name,
      stocks: processedStats.transformedStocks,
      reviewsRating: processedStats.reviewsRating,
      reviews: processedStats.ratingCounts,
      isSoldOut: processedStats.isSoldOut,
    };

    // 2. 레포지토리 및 유틸 함수 모킹
    const getByIdWithRelationsMock = jest
      .spyOn(productRepository, 'getProductByIdWithRelations')
      .mockResolvedValue(mockProductWithRelations as any);

    // 3. 서비스 함수 호출
    const result = await productService.getProduct(mockProduct.id);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdWithRelationsMock).toHaveBeenCalledWith(mockProduct.id);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
