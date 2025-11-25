import { Request, Response } from 'express';
import reviewService from '@modules/review/reviewService';
import {
  CreateReviewDto,
  UpdateReviewDto,
  GetReviewListQueryDto,
  DeleteReviewDto,
} from '@modules/review/dto/reviewDTO';

class ReviewController {
  /**
   * @description
   * 새로운 리뷰를 생성합니다
   *
   * rating, content 정보를 받아 새로운 리뷰를 생성합니다.
   * orderItemId를 통해 구매자가 맞는지 검증합니다
   *
   * @param {Object} req
   * @param {Object} res
   * @return {Object} 생성된 리뷰 정보 (HTTP 201)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 403 - 본인이 구매한 상품이 아닌 경우
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  createReview = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const createReviewDto: CreateReviewDto = {
      ...req.validatedBody,
      productId: req.validatedParams.productId,
      userId,
    };
    const review = await reviewService.createReview(createReviewDto);
    res.status(201).json(review);
  };

  /**
   * @description
   * 기존 리뷰를 수정합니다
   * 
   * rating, content 정보를 받아 기존 리뷰를 수정합니다.
   * userId를 통해 본인 리뷰인지 검증합니다.
   * 
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} 수정된 리뷰 정보 (HTTP 200)
   * 
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 403 - 본인의 리뷰가 아닌 경우
   * @throws {ApiError} 500 - 서버 내부 오류

   */

  updateReview = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const updateReviewDto: UpdateReviewDto = {
      ...req.validatedBody,
      reviewId: req.validatedParams.reviewId,
      userId,
    };
    const review = await reviewService.updateReview(updateReviewDto);
    res.status(200).json(review);
  };

  /**
   * @description
   * 특정 상품의 리뷰 목록을 조회합니다
   *
   * productId 경로 파라미터와 page, limit 쿼리 파라미터를 받아 해당 상품의 리뷰 목록을 페이징하여 조회합니다.
   * @param {Object} req
   * @param {Object} res
   * @return {Object[]} 리뷰 목록 (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 500 - 서버 내부 오류
   */

  getReviewList = async (req: Request, res: Response) => {
    const getReviewListQueryDto: GetReviewListQueryDto = {
      ...req.validatedQuery,
      productId: req.validatedParams.productId,
    };
    const reviews = await reviewService.getReviewList(getReviewListQueryDto);
    res.status(200).json(reviews);
  };

  /**
   * @description
   * 기존 리뷰를 삭제합니다
   *
   * reviewId를 받아 기존 리뷰를 삭제합니다.
   * userId를 통해 본인 리뷰인지 검증합니다.
   *
   * @param {Object} req
   * @param {Object} res
   * @return {void} (HTTP 204)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 403 - 본인의 리뷰가 아닌 경우
   * @throws {ApiError} 500 - 서버 내부 오류
   *  */
  deleteReview = async (req: Request, res: Response) => {
    const deleteReviewDto: DeleteReviewDto = {
      reviewId: req.validatedParams.reviewId,
      userId: req.user.id,
    };
    await reviewService.deleteReview(deleteReviewDto);
    res.sendStatus(204);
  };
}

export default new ReviewController();
