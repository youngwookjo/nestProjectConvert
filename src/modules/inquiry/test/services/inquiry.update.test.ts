import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import { InquiryStatus } from '@prisma/client';
import { mockUserBuyer, mockInquiryList } from '@modules/inquiry/test/mock';
import { fromPrismaInquiryStatus } from '@modules/inquiry/utils/inquiryUtils';

describe('updateInquiry service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const inquiryId = mockInquiryList[0].id;
    const userId = mockUserBuyer.id;
    const updateDto = {
      title: 'Updated Title',
      content: 'Updated Content',
    };

    const baseInquiry = {
      ...mockInquiryList[0],
      reply: null,
    };

    const mockUpdatedInquiryFromRepo = {
      ...baseInquiry,
      ...updateDto,
    };

    const expectedResult = {
      ...mockUpdatedInquiryFromRepo,
      status: fromPrismaInquiryStatus(baseInquiry.status),
    };

    // 2. 레포지토리 함수 모킹
    const getByIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryById')
      .mockResolvedValue(baseInquiry);
    const updateMock = jest
      .spyOn(inquiryRepository, 'updateInquiry')
      .mockResolvedValue(mockUpdatedInquiryFromRepo);

    // 3. 서비스 함수 호출
    const result = await inquiryService.updateInquiry(userId, inquiryId, updateDto);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getByIdMock).toHaveBeenCalledWith(inquiryId);
    expect(updateMock).toHaveBeenCalledWith(inquiryId, updateDto);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
