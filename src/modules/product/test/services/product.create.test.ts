import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import productService from '@modules/product/productService';
import productRepository from '@modules/product/productRepo';
import storeRepository from '@modules/store/storeRepo';
import { prisma } from '@shared/prisma';
import {
  mockUser,
  createProductDto,
  mockStore,
  mockCategory,
  mockProduct,
  mockStock,
  mockSize,
} from '@modules/product/test/mock';

describe('createProduct 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const expectedResult = {
      id: mockProduct.id,
      storeName: mockStore.name,
      reviews: {
        rate1Length: 0,
        rate2Length: 0,
        rate3Length: 0,
        rate4Length: 0,
        rate5Length: 0,
        sumScore: 0,
      },
      price: mockProduct.price,
      discountPrice: mockProduct.discountPrice,
      discountRate: mockProduct.discountRate,
      discountEndTime: mockProduct.discountEndTime,
      discountStartTime: mockProduct.discountStartTime,
      storeId: mockProduct.storeId,
      name: mockProduct.name,
      createdAt: mockProduct.createdAt,
      updatedAt: mockProduct.updatedAt,
      image: mockProduct.image,
      reviewsRating: 0,
      categoryId: mockCategory.id,
      content: mockProduct.content,
      isSoldOut: false,
      stocks: [
        {
          id: mockStock.id,
          quantity: mockStock.quantity,
          size: {
            id: mockSize.id,
            name: mockSize.en,
          },
        },
      ],
      category: {
        id: mockCategory.id,
        name: mockCategory.name,
      },
      inquiries: [],
    };
    // 2. 레포지토리 함수 모킹
    const getStoreIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockStore);
    const findCategoryMock = jest
      .spyOn(productRepository, 'getCategoryByName')
      .mockResolvedValue(mockCategory);
    const createMock = jest
      .spyOn(productRepository, 'createProduct')
      .mockResolvedValue(mockProduct);

    // 3. 서비스 함수 호출
    const result = await productService.createProduct(mockUser.id, createProductDto);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getStoreIdMock).toHaveBeenCalledWith(mockUser.id);
    expect(findCategoryMock).toHaveBeenCalledWith(createProductDto.categoryName);
    expect(createMock).toHaveBeenCalled();

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
