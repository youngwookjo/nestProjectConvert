import { afterEach, describe, test, expect, jest } from '@jest/globals';
import reviewService from '@modules/review/reviewService';
import reviewRepository from '@modules/review/reviewRepo';
import userRepository from '@modules/user/userRepo';
import { MOCK_DATA } from '@modules/review/test/services/mock';

describe('reviewDelete 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('deleteReview 메소드 테스트', () => {
    test('deleteReview 성공 테스트', async () => {
      const deleteReviewDto = MOCK_DATA.deleteReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const existingReview = MOCK_DATA.fullReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(existingReview);
      const deleteReviewSpy = jest
        .spyOn(reviewRepository, 'deleteReview')
        .mockResolvedValue(undefined);

      await reviewService.deleteReview(deleteReviewDto);

      expect(userRepository.getUserById).toHaveBeenCalledWith(deleteReviewDto.userId);
      expect(reviewRepository.getReviewById).toHaveBeenCalledWith(deleteReviewDto.reviewId);
      expect(deleteReviewSpy).toHaveBeenCalledWith(
        deleteReviewDto.reviewId,
        existingReview.orderItemId,
      );
    });

    test('deleteReview 실패 테스트 - 존재하지 않는 사용자', async () => {
      const deleteReviewDto = MOCK_DATA.deleteReviewDto;
      const existingReview = MOCK_DATA.fullReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(existingReview);

      await expect(reviewService.deleteReview(deleteReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '사용자를 찾지 못했습니다.',
      });
    });

    test('deleteReview 실패 테스트 - 리뷰 없음', async () => {
      const deleteReviewDto = MOCK_DATA.deleteReviewDto;
      const existingUser = MOCK_DATA.existingUser;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(null);

      await expect(reviewService.deleteReview(deleteReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '리뷰를 찾지 못했습니다.',
      });
    });

    test('deleteReview 실패 테스트 - 본인이 작성한 리뷰가 아닐 경우', async () => {
      const deleteReviewDto = MOCK_DATA.deleteReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const otherUserReview = MOCK_DATA.otherUserReview;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(reviewRepository, 'getReviewById').mockResolvedValue(otherUserReview);

      await expect(reviewService.deleteReview(deleteReviewDto)).rejects.toMatchObject({
        code: 403,
        message: '본인의 리뷰만 삭제할 수 있습니다.',
      });
    });
  });
});
