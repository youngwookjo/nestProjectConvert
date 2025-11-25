import { afterEach, describe, test, expect, jest } from '@jest/globals';
import reviewService from '@modules/review/reviewService';
import reviewRepository from '@modules/review/reviewRepo';
import userRepository from '@modules/user/userRepo';
import { MOCK_DATA } from '@modules/review/test/services/mock';

describe('reviewUpdate 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateReview 메소드 테스트', () => {
    test('updateReview 성공 테스트', async () => {
      const updateReviewDto = MOCK_DATA.updateReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const existingReview = MOCK_DATA.fullReview;
      const updatedReview = MOCK_DATA.updatedReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(existingReview);
      jest.spyOn(reviewRepository, 'updateReview').mockResolvedValue(updatedReview);

      const result = await reviewService.updateReview(updateReviewDto);

      expect(result).toEqual(updatedReview);
    });

    test('updateReview 실패 테스트 - 존재하지 않는 사용자', async () => {
      const updateReviewDto = MOCK_DATA.updateReviewDto;
      const existingReview = MOCK_DATA.fullReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(existingReview);

      await expect(reviewService.updateReview(updateReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '사용자를 찾지 못했습니다.',
      });
    });

    test('updateReview 실패 테스트 - 리뷰 없음', async () => {
      const updateReviewDto = MOCK_DATA.updateReviewDto;
      const existingUser = MOCK_DATA.existingUser;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(null);

      await expect(reviewService.updateReview(updateReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '리뷰를 찾지 못했습니다.',
      });
    });

    test('updateReview 실패 테스트 - 본인이 작성한 리뷰가 아닐 경우', async () => {
      const updateReviewDto = MOCK_DATA.updateReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const otherUserReview = MOCK_DATA.otherUserReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(otherUserReview);

      await expect(reviewService.updateReview(updateReviewDto)).rejects.toMatchObject({
        code: 403,
        message: '본인의 리뷰만 수정할 수 있습니다.',
      });
    });
  });
});
