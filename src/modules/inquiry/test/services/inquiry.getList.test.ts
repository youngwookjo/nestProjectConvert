import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import productRepository from '@modules/product/productRepo';
import { mockProduct, mockInquiryList } from '@modules/inquiry/test/mock';
import { fromPrismaInquiryStatus } from '@modules/inquiry/utils/inquiryUtils';

describe('getInquiryList 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const expectedResult = {
      list: mockInquiryList.map((i) => ({ ...i, status: fromPrismaInquiryStatus(i.status) })),
      totalCount: mockInquiryList.length,
    };

    // 2. 레포지토리 함수 모킹
    const getProductByIdMock = jest
      .spyOn(productRepository, 'getProductById')
      .mockResolvedValue(mockProduct);
    const getInquiriesMock = jest
      .spyOn(inquiryRepository, 'getInquiryListByProductId')
      .mockResolvedValue(mockInquiryList);
    const getInquiryCountMock = jest
      .spyOn(inquiryRepository, 'getInquiryCountByProductId')
      .mockResolvedValue(mockInquiryList.length);

    // 3. 서비스 함수 호출
    const result = await inquiryService.getInquiryList(mockProduct.id);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getProductByIdMock).toHaveBeenCalledWith(mockProduct.id);
    expect(getInquiriesMock).toHaveBeenCalledWith(mockProduct.id);
    expect(getInquiryCountMock).toHaveBeenCalledWith(mockProduct.id);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
