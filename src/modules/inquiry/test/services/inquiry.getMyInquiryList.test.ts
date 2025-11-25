import { GetMyInquiryListRepoDTO, GetMyInquiryListDTO } from '@modules/inquiry/dto/inquiryDTO';
import { afterEach, describe, test, expect, jest } from '@jest/globals';
import inquiryService from '@modules/inquiry/inquiryService';
import inquiryRepository from '@modules/inquiry/inquiryRepo';
import userRepository from '@modules/user/userRepo';
import storeRepository from '@modules/store/storeRepo';
import { InquiryStatus } from '@prisma/client';
import { mockUserBuyer, mockUserSeller, mockProduct, mockStore } from '@modules/inquiry/test/mock';

describe('getMyInquiryList', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('성공: 구매자 문의 목록 조회', async () => {
    // 1. Mock 데이터 및 DTO 생성
    const mockGetMyInquiryListDTO: GetMyInquiryListDTO = { page: 1, pageSize: 10 };
    const expectedRepoDTO: GetMyInquiryListRepoDTO = {
      ...mockGetMyInquiryListDTO,
      status: undefined,
    };
    const mockMyInquiryList = [
      {
        id: 'inquiry-id-1',
        title: '구매자 문의 1',
        isSecret: false,
        status: InquiryStatus.WAITING_ANSWER,
        createdAt: new Date(),
        content: '문의 내용입니다.',
        product: {
          id: mockProduct.id,
          name: mockProduct.name,
          image: mockProduct.image,
          store: { id: mockStore.id, name: mockStore.name },
        },
        user: { id: mockUserBuyer.id, name: mockUserBuyer.name },
      },
    ];
    const mockTotalCount = 1;

    const expectedResult = {
      list: [
        {
          ...mockMyInquiryList[0],
          status: 'WaitingAnswer',
        },
      ],
      totalCount: mockTotalCount,
    };

    // 2. 레포지토리 함수 모킹
    const getUserByIdMock = jest
      .spyOn(userRepository, 'getUserById')
      .mockResolvedValue(mockUserBuyer);
    const getInquiryListByUserIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryListByUserId')
      .mockResolvedValue(mockMyInquiryList);
    const getTotalCountByUserIdMock = jest
      .spyOn(inquiryRepository, 'getTotalCountByUserId')
      .mockResolvedValue(mockTotalCount);

    // 3. 서비스 함수 호출
    const result = await inquiryService.getMyInquiryList(mockUserBuyer.id, mockGetMyInquiryListDTO);

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getUserByIdMock).toHaveBeenCalledWith(mockUserBuyer.id);
    expect(getInquiryListByUserIdMock).toHaveBeenCalledWith(mockUserBuyer.id, expectedRepoDTO);
    expect(getTotalCountByUserIdMock).toHaveBeenCalledWith(
      mockUserBuyer.id,
      expectedRepoDTO.status,
    );

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공: 판매자 문의 목록 조회', async () => {
    // 1. Mock 데이터 및 DTO 생성
    const mockGetMyInquiryListDTO: GetMyInquiryListDTO = { page: 1, pageSize: 10 };
    const expectedRepoDTO: GetMyInquiryListRepoDTO = {
      ...mockGetMyInquiryListDTO,
      status: undefined,
    };
    const mockMyInquiryList = [
      {
        id: 'inquiry-id-2',
        title: '판매자 스토어 문의 1',
        isSecret: false,
        status: InquiryStatus.COMPLETED_ANSWER,
        createdAt: new Date(),
        content: '판매자 스토어 문의 내용입니다.',
        product: {
          id: mockProduct.id,
          name: mockProduct.name,
          image: mockProduct.image,
          store: { id: mockStore.id, name: mockStore.name },
        },
        user: { id: mockUserBuyer.id, name: mockUserBuyer.name }, // 문의 작성자는 구매자
      },
    ];
    const mockTotalCount = 1;

    const expectedResult = {
      list: [
        {
          ...mockMyInquiryList[0],
          status: 'CompletedAnswer',
        },
      ],
      totalCount: mockTotalCount,
    };

    // 2. 레포지토리 함수 모킹
    const getUserByIdMock = jest
      .spyOn(userRepository, 'getUserById')
      .mockResolvedValue(mockUserSeller);
    const getStoreIdByUserIdMock = jest
      .spyOn(storeRepository, 'getStoreIdByUserId')
      .mockResolvedValue(mockStore);
    const getInquiryListByStoreIdMock = jest
      .spyOn(inquiryRepository, 'getInquiryListByStoreId')
      .mockResolvedValue(mockMyInquiryList);
    const getTotalCountByStoreIdMock = jest
      .spyOn(inquiryRepository, 'getTotalCountByStoreId')
      .mockResolvedValue(mockTotalCount);

    // 3. 서비스 함수 호출
    const result = await inquiryService.getMyInquiryList(
      mockUserSeller.id,
      mockGetMyInquiryListDTO,
    );

    // 4. 모킹된 메소드가 올바르게 호출되었는지 확인
    expect(getUserByIdMock).toHaveBeenCalledWith(mockUserSeller.id);
    expect(getStoreIdByUserIdMock).toHaveBeenCalledWith(mockUserSeller.id);
    expect(getInquiryListByStoreIdMock).toHaveBeenCalledWith(mockStore.id, expectedRepoDTO);
    expect(getTotalCountByStoreIdMock).toHaveBeenCalledWith(mockStore.id, expectedRepoDTO.status);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
