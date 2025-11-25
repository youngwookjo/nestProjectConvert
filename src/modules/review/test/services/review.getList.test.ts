import { afterEach, describe, test, expect, jest } from '@jest/globals';
import reviewService from '@modules/review/reviewService';
import reviewRepository from '@modules/review/reviewRepo';
import productRepo from '@modules/product/productRepo';
import { MOCK_DATA } from '@modules/review/test/services/mock';

describe('reviewGetList 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getReviewList 메소드 테스트', () => {
    test('getReviewList 성공 테스트 - 리뷰가 있는 경우', async () => {
      const getReviewListQueryDto = MOCK_DATA.getReviewListQueryDto;
      const repositoryData = MOCK_DATA.repositoryReviewListData;
      const expectedResponse = MOCK_DATA.expectedReviewListResponse;

      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(reviewRepository, 'getReviewList').mockResolvedValue(repositoryData);

      const result = await reviewService.getReviewList(getReviewListQueryDto);

      expect(productRepo.checkProductExists).toHaveBeenCalledWith(getReviewListQueryDto.productId);
      expect(reviewRepository.getReviewList).toHaveBeenCalledWith(getReviewListQueryDto);
      expect(result).toEqual(expectedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
    });

    test('getReviewList 성공 테스트 - 리뷰가 없는 경우', async () => {
      const getReviewListQueryDto = MOCK_DATA.getReviewListQueryDto;
      const repositoryEmptyData = MOCK_DATA.repositoryEmptyReviewListData;
      const expectedEmptyResponse = MOCK_DATA.expectedEmptyReviewListResponse;

      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(reviewRepository, 'getReviewList').mockResolvedValue(repositoryEmptyData);

      const result = await reviewService.getReviewList(getReviewListQueryDto);

      expect(result).toEqual(expectedEmptyResponse);
      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
    });

    test('getReviewList 실패 테스트 - 상품을 찾지 못함', async () => {
      const getReviewListQueryDto = MOCK_DATA.getReviewListQueryDto;

      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(false);
      const getReviewListSpy = jest.spyOn(reviewRepository, 'getReviewList');

      await expect(reviewService.getReviewList(getReviewListQueryDto)).rejects.toMatchObject({
        code: 400,
        message: '상품을 찾지 못했습니다.',
      });

      expect(productRepo.checkProductExists).toHaveBeenCalledWith(getReviewListQueryDto.productId);
      expect(getReviewListSpy).not.toHaveBeenCalled();
    });
  });
});
