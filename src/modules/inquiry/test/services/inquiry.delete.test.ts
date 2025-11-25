import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import { InquiryStatus } from '@prisma/client';
import { mockUserBuyer, mockInquiryList } from '@modules/inquiry/test/mock';
import { fromPrismaInquiryStatus } from '@modules/inquiry/utils/inquiryUtils';

describe('deleteInquiry service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should delete an inquiry successfully', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const inquiryId = mockInquiryList[0].id;
    const userId = mockUserBuyer.id;
    const mockInquiry = {
      ...mockInquiryList[0],
      userId: mockUserBuyer.id,
      status: InquiryStatus.WAITING_ANSWER,
      reply: null,
    };

    const expectedResult = {
      ...mockInquiry,
      status: fromPrismaInquiryStatus(mockInquiry.status),
    };

    // 2. 레포지토리 함수 모킹
    const getByIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryById')
      .mockResolvedValue(mockInquiry);
    const deleteMock = jest
      .spyOn(inquiryRepository, 'deleteInquiry')
      .mockResolvedValue(mockInquiry);

    // 3. 서비스 함수 호출
    const result = await inquiryService.deleteInquiry(userId, inquiryId);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdMock).toHaveBeenCalledWith(inquiryId);
    expect(deleteMock).toHaveBeenCalledWith(inquiryId);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
