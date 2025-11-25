import reviewRepository from '@modules/review/reviewRepo';
import userRepository from '@modules/user/userRepo';
import productRepo from '@modules/product/productRepo';
import orderRepo from '@modules/order/orderRepo';
import {
  CreateReviewDto,
  ResReviewDto,
  UpdateReviewDto,
  GetReviewListQueryDto,
  DeleteReviewDto,
  ResReviewListDto,
} from '@modules/review/dto/reviewDTO';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';

class ReviewService {
  createReview = async (createReviewDto: CreateReviewDto): Promise<ResReviewDto> => {
    const [existingUser, existingProduct, existingOrderItem] = await Promise.all([
      userRepository.getUserById(createReviewDto.userId),
      productRepo.checkProductExists(createReviewDto.productId),
      orderRepo.getOrderItemById(createReviewDto.orderItemId),
    ]);

    assert(existingUser, ApiError.badRequest('사용자를 찾지 못했습니다.'));
    assert(existingProduct, ApiError.badRequest('상품을 찾지 못했습니다.'));
    assert(existingOrderItem, ApiError.badRequest('주문 내역을 찾지 못했습니다.'));
    assert(
      existingOrderItem?.order?.userId === createReviewDto.userId,
      ApiError.forbidden('본인의 주문 내역에 대해서만 리뷰를 작성할 수 있습니다.'),
    );

    const review = await reviewRepository.createReview(createReviewDto);
    return review;
  };

  updateReview = async (updateReviewDto: UpdateReviewDto): Promise<ResReviewDto> => {
    const [existingUser, existingReview] = await Promise.all([
      userRepository.getUserById(updateReviewDto.userId),
      reviewRepository.getReviewById(updateReviewDto.reviewId),
    ]);

    assert(existingUser, ApiError.badRequest('사용자를 찾지 못했습니다.'));
    assert(existingReview, ApiError.badRequest('리뷰를 찾지 못했습니다.'));
    assert(
      existingReview?.userId === updateReviewDto.userId,
      ApiError.forbidden('본인의 리뷰만 수정할 수 있습니다.'),
    );

    const review = await reviewRepository.updateReview(updateReviewDto);
    return review;
  };

  getReviewList = async (
    getReviewListQueryDto: GetReviewListQueryDto,
  ): Promise<ResReviewListDto> => {
    const existingProduct = await productRepo.checkProductExists(getReviewListQueryDto.productId);
    assert(existingProduct, ApiError.badRequest('상품을 찾지 못했습니다.'));

    const data = await reviewRepository.getReviewList(getReviewListQueryDto);
    const totalPages = Math.ceil(data.count / getReviewListQueryDto.limit);

    return {
      items: data.reviewList,
      meta: {
        total: data.count,
        page: getReviewListQueryDto.page,
        limit: getReviewListQueryDto.limit,
        hasNextPage: getReviewListQueryDto.page < totalPages,
      },
    };
  };

  deleteReview = async (deleteReviewDto: DeleteReviewDto): Promise<void> => {
    const [existingUser, existingReview] = await Promise.all([
      userRepository.getUserById(deleteReviewDto.userId),
      reviewRepository.getReviewById(deleteReviewDto.reviewId),
    ]);
    assert(existingUser, ApiError.badRequest('사용자를 찾지 못했습니다.'));
    assert(existingReview, ApiError.badRequest('리뷰를 찾지 못했습니다.'));
    assert(
      existingReview?.userId === deleteReviewDto.userId,
      ApiError.forbidden('본인의 리뷰만 삭제할 수 있습니다.'),
    );
    await reviewRepository.deleteReview(deleteReviewDto.reviewId, existingReview.orderItemId);
  };
}

export default new ReviewService();
