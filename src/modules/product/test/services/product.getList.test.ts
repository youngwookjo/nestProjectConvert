import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import productService from '@modules/product/productService';
import productRepository from '@modules/product/productRepo';
import { prisma } from '@shared/prisma';
import {
  mockProduct,
  mockStore,
  mockCategory,
  mockReview,
  mockOrderItem,
  mockStock,
} from '@modules/product/test/mock';
import { GetProductListDto } from '@modules/product/dto/productDTO';

describe('getProductList 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공 케이스', async () => {
    // 1. 테스트용 mock 데이터 준비
    const getProductListDto: GetProductListDto = {
      page: 1,
      pageSize: 10,
      sort: 'recent',
    };

    const mockRepoResponse = [
      {
        ...mockProduct,
        inquiries: undefined,
        store: mockStore,
        category: mockCategory,
        reviews: [mockReview],
        orderItems: [mockOrderItem],
        stocks: [
          {
            ...mockStock,
            size: {
              id: 1,
              en: 'M',
            },
          },
        ],
      },
    ];

    const expectedTotalCount = 1;

    const expectedResult = {
      totalCount: expectedTotalCount,
      list: [
        {
          id: mockProduct.id,
          storeId: mockProduct.storeId,
          categoryId: mockProduct.categoryId,
          name: mockProduct.name,
          image: mockProduct.image,
          price: mockProduct.price,
          discountPrice: mockProduct.discountPrice,
          discountRate: mockProduct.discountRate,
          discountStartTime: mockProduct.discountStartTime,
          discountEndTime: mockProduct.discountEndTime,
          createdAt: mockProduct.createdAt,
          updatedAt: mockProduct.updatedAt,
          storeName: mockStore.name,
          reviewsCount: 1,
          reviewsRating: mockReview.rating,
          sales: mockOrderItem.quantity,
          isSoldOut: false,
        },
      ],
    };

    // 2. 레포지토리 함수 모킹
    const getProductCountMock = jest
      .spyOn(productRepository, 'getProductCount')
      .mockResolvedValue(expectedTotalCount);
    const getProductListMock = jest
      .spyOn(productRepository, 'getProductList')
      .mockResolvedValue(mockRepoResponse as any);

    // 3. 서비스 함수 호출
    const result = await productService.getProductList(getProductListDto);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getProductCountMock).toHaveBeenCalledWith(getProductListDto);
    expect(getProductListMock).toHaveBeenCalledWith(getProductListDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
