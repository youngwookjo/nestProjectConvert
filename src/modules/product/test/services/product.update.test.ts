import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import productService from '@modules/product/productService';
import productRepository from '@modules/product/productRepo';
import storeRepository from '@modules/store/storeRepo';
import * as s3DeleteUtils from '@utils/s3DeleteUtils';
import { prisma } from '@shared/prisma';
import { mockUser, mockStore, mockProduct } from '@modules/product/test/mock';
import { UpdateProductDto } from '@modules/product/dto/productDTO';

describe('updateProduct 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const updateDto: UpdateProductDto = {
      name: '업데이트된 상품 이름',
      price: 35000,
      image: 'https://example.com/new-image.jpg',
      stocks: [
        {
          sizeId: 1,
          quantity: 50,
        },
      ],
    };

    const updatedProductDataFromRepo = {
      ...mockProduct,
      name: updateDto.name!,
      price: updateDto.price!,
      image: updateDto.image!,
      stocks: updateDto.stocks.map((s) => ({
        ...s,
        id: 'new-stock-id',
        productId: mockProduct.id,
        size: { id: s.sizeId, en: 'M' },
      })),
    };

    // _processProductStats의 결과를 시뮬레이션
    const { reviews, stocks, ...restOfProductFromRepo } = updatedProductDataFromRepo;
    const processedStats = productService['_processProductStats'](updatedProductDataFromRepo);

    const expectedResult = {
      ...restOfProductFromRepo,
      storeName: mockStore.name,
      stocks: processedStats.transformedStocks,
      reviewsRating: processedStats.reviewsRating,
      reviews: processedStats.ratingCounts,
      isSoldOut: processedStats.isSoldOut,
    };

    // 2. 레포지토리 및 유틸 함수 모킹
    const getByIdMock = jest
      .spyOn(productRepository, 'getProductById')
      .mockResolvedValue(mockProduct);
    const getStoreIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockStore);
    const updateMock = jest
      .spyOn(productRepository, 'updateProduct')
      .mockResolvedValue(updatedProductDataFromRepo as any);
    const deleteImageMock = jest
      .spyOn(s3DeleteUtils, 'deleteImageFromS3')
      .mockResolvedValue(undefined);

    // 3. 서비스 함수 호출
    const result = await productService.updateProduct(mockUser.id, mockProduct.id, updateDto);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdMock).toHaveBeenCalledWith(mockProduct.id);
    expect(getStoreIdMock).toHaveBeenCalledWith(mockUser.id);
    expect(updateMock).toHaveBeenCalled();
    expect(deleteImageMock).toHaveBeenCalledWith(mockProduct.image);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
