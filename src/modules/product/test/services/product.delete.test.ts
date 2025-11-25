import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import productService from '@modules/product/productService';
import productRepository from '@modules/product/productRepo';
import storeRepository from '@modules/store/storeRepo';
import * as s3DeleteUtils from '@utils/s3DeleteUtils';
import { prisma } from '@shared/prisma';
import { mockUser, mockStore, mockProduct } from '@modules/product/test/mock';

describe('deleteProduct 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성 - 생략

    // 2. 레포지토리 및 유틸 함수 모킹
    const getByIdMock = jest
      .spyOn(productRepository, 'getProductById')
      .mockResolvedValue(mockProduct);
    const getStoreIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockStore);
    const deleteImageMock = jest
      .spyOn(s3DeleteUtils, 'deleteImageFromS3')
      .mockResolvedValue(undefined);
    const deleteMock = jest.spyOn(productRepository, 'deleteProduct').mockResolvedValue(undefined);

    // 3. 서비스 함수 호출
    await productService.deleteProduct(mockUser.id, mockProduct.id);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdMock).toHaveBeenCalledWith(mockProduct.id);
    expect(getStoreIdMock).toHaveBeenCalledWith(mockUser.id);
    expect(deleteImageMock).toHaveBeenCalledWith(mockProduct.image);
    expect(deleteMock).toHaveBeenCalledWith(mockProduct.id);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인 - 생략
  });
});
