import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import productRepository from '@modules/product/productRepo';
import { InquiryStatus } from '@prisma/client';
import { mockUserBuyer, mockProduct } from '@modules/inquiry/test/mock';
import { fromPrismaInquiryStatus } from '@modules/inquiry/utils/inquiryUtils';

describe('createInquiry 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const mockCreateInquiryDto = {
      title: 'Test Inquiry Title',
      content: 'Test Inquiry Content',
      isSecret: false,
    };

    const mockInquiryFromRepo = {
      id: 'inquiry-id-001',
      userId: mockUserBuyer.id,
      productId: mockProduct.id,
      title: mockCreateInquiryDto.title,
      content: mockCreateInquiryDto.content,
      status: InquiryStatus.WAITING_ANSWER,
      isSecret: mockCreateInquiryDto.isSecret,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedResult = {
      ...mockInquiryFromRepo,
      status: fromPrismaInquiryStatus(mockInquiryFromRepo.status),
    };

    // 2. 레포지토리 함수 모킹
    const getProductByIdMock = jest
      .spyOn(productRepository, 'getProductById')
      .mockResolvedValue(mockProduct);
    const createInquiryMock = jest
      .spyOn(inquiryRepository, 'createInquiry')
      .mockResolvedValue(mockInquiryFromRepo);

    // 3. 서비스 함수 호출
    const result = await inquiryService.createInquiry(
      mockUserBuyer.id,
      mockProduct.id,
      mockCreateInquiryDto,
    );

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getProductByIdMock).toHaveBeenCalledWith(mockProduct.id);
    expect(createInquiryMock).toHaveBeenCalledWith(
      mockUserBuyer.id,
      mockProduct.id,
      mockCreateInquiryDto,
    );

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
