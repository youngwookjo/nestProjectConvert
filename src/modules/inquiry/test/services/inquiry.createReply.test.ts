import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import userRepository from '@modules/user/userRepo';
import productRepository from '@modules/product/productRepo';
import { InquiryReplyDTO } from '@modules/inquiry/dto/inquiryDTO';
import {
  mockUserSeller,
  mockProduct,
  mockStore,
  mockInquiryList,
} from '@modules/inquiry/test/mock';

describe('createInquiryReply 메소드 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = mockUserSeller.id;
    const inquiryId = mockInquiryList[0].id;
    const inquiryReplyDto: InquiryReplyDTO = { content: '문의 답변 내용' };

    const mockInquiry = { ...mockInquiryList[0], reply: null };
    const mockProductWithStore = {
      ...mockProduct,
      store: mockStore,
      reviews: [],
      inquiries: [],
      category: { id: 'category-id', name: 'category-name' },
      stocks: [],
      orderItems: [],
    };

    const expectedResult = {
      id: 'reply-id-001',
      inquiryId: mockInquiryList[0].id,
      userId: mockUserSeller.id,
      content: inquiryReplyDto.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 2. 레포지토리 함수 모킹
    const getInquiryByIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryById')
      .mockResolvedValue(mockInquiry);
    const getUserByIdMock = jest
      .spyOn(userRepository, 'getUserById')
      .mockResolvedValue(mockUserSeller);
    const getProductByIdWithRelationsMock = jest
      .spyOn(productRepository, 'getProductByIdWithRelations')
      .mockResolvedValue(mockProductWithStore);
    const createInquiryReplyMock = jest
      .spyOn(inquiryRepository, 'createInquiryReply')
      .mockResolvedValue(expectedResult);

    // 3. 서비스 함수 호출
    const result = await inquiryService.createInquiryReply(userId, inquiryId, inquiryReplyDto);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getInquiryByIdMock).toHaveBeenCalledWith(inquiryId);
    expect(getUserByIdMock).toHaveBeenCalledWith(userId);
    expect(getProductByIdWithRelationsMock).toHaveBeenCalledWith(mockInquiry.productId);
    expect(createInquiryReplyMock).toHaveBeenCalledWith(inquiryId, userId, inquiryReplyDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
