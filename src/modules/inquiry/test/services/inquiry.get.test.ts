import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import { mockInquiryWithReply } from '@modules/inquiry/test/mock';
import { fromPrismaInquiryStatus } from '@modules/inquiry/utils/inquiryUtils';

describe('getInquiry', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const expectedResult = {
      ...mockInquiryWithReply,
      status: fromPrismaInquiryStatus(mockInquiryWithReply.status),
    };

    // 2. 레포지토리 함수 모킹
    const getByIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryById')
      .mockResolvedValue(mockInquiryWithReply);

    // 3. 서비스 함수 호출
    const result = await inquiryService.getInquiry(mockInquiryWithReply.id);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdMock).toHaveBeenCalledWith(mockInquiryWithReply.id);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
