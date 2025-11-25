import { afterEach, describe, test, expect, jest } from '@jest/globals';
import reviewService from '@modules/review/reviewService';
import reviewRepository from '@modules/review/reviewRepo';
import userRepository from '@modules/user/userRepo';
import productRepo from '@modules/product/productRepo';
import orderRepo from '@modules/order/orderRepo';
import { MOCK_DATA } from '@modules/review/test/services/mock';

describe('reviewCreate 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createReview 메소드 테스트', () => {
    test('createReview 성공 테스트', async () => {
      const createReviewDto = MOCK_DATA.createReviewDto;
      const createdReview = MOCK_DATA.createdReview;
      const existingUser = MOCK_DATA.existingUser;
      const existingOrderItem = MOCK_DATA.existingOrderItem;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(orderRepo, 'getOrderItemById').mockResolvedValue(existingOrderItem);
      jest.spyOn(reviewRepository, 'createReview').mockResolvedValue(createdReview);

      const result = await reviewService.createReview(createReviewDto);

      expect(result).toEqual(createdReview);
    });

    test('createReview 실패 테스트 - 사용자를 찾지 못함', async () => {
      const createReviewDto = MOCK_DATA.createReviewDto;
      const existingOrderItem = MOCK_DATA.existingOrderItem;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);
      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(orderRepo, 'getOrderItemById').mockResolvedValue(existingOrderItem);

      await expect(reviewService.createReview(createReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '사용자를 찾지 못했습니다.',
      });
    });

    test('createReview 실패 테스트 - 상품을 찾지 못함', async () => {
      const createReviewDto = MOCK_DATA.createReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const existingOrderItem = MOCK_DATA.existingOrderItem;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(false);
      jest.spyOn(orderRepo, 'getOrderItemById').mockResolvedValue(existingOrderItem);

      await expect(reviewService.createReview(createReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '상품을 찾지 못했습니다.',
      });
    });

    test('createReview 실패 테스트 - 주문 내역을 찾지 못함', async () => {
      const createReviewDto = MOCK_DATA.createReviewDto;
      const existingUser = MOCK_DATA.existingUser;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(orderRepo, 'getOrderItemById').mockResolvedValue(null);

      await expect(reviewService.createReview(createReviewDto)).rejects.toMatchObject({
        code: 400,
        message: '주문 내역을 찾지 못했습니다.',
      });
    });

    test('createReview 실패 테스트 - 다른 사용자의 주문 내역', async () => {
      const createReviewDto = MOCK_DATA.createReviewDto;
      const existingUser = MOCK_DATA.existingUser;
      const otherUserOrderItem = MOCK_DATA.otherUserOrderItem;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(existingUser);
      jest.spyOn(productRepo, 'checkProductExists').mockResolvedValue(true);
      jest.spyOn(orderRepo, 'getOrderItemById').mockResolvedValue(otherUserOrderItem);

      await expect(reviewService.createReview(createReviewDto)).rejects.toMatchObject({
        code: 403,
        message: '본인의 주문 내역에 대해서만 리뷰를 작성할 수 있습니다.',
      });
    });
  });
});
