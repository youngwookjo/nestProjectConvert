import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  productIdSchema,
  getReviewListQuerySchema,
} from '@modules/review/dto/reviewDTO';

class ReviewValidator {
  validateCreateReview: RequestHandler = async (req, res, next) => {
    try {
      const parsedBody = {
        rating: req.body.rating,
        content: req.body.content,
        orderItemId: req.body.orderItemId,
      };

      req.validatedBody = await createReviewSchema.parseAsync(parsedBody);
      req.validatedParams = await productIdSchema.parseAsync({
        productId: req.params.productId,
      });
      next();
    } catch (err) {
      forwardZodError(err, '리뷰 생성', next);
    }
  };

  validateUpdateReview: RequestHandler = async (req, res, next) => {
    try {
      const parsedBody = {
        rating: req.body.rating,
        content: req.body.content,
        reviewId: req.params.reviewId,
      };
      req.validatedBody = await updateReviewSchema.parseAsync(parsedBody);
      req.validatedParams = await reviewIdSchema.parseAsync({ reviewId: req.params.reviewId });
      next();
    } catch (err) {
      forwardZodError(err, '리뷰 수정', next);
    }
  };

  validateGetReviewList: RequestHandler = async (req, res, next) => {
    try {
      const parsedQuery = {
        page: req.query.page,
        limit: req.query.limit,
      };
      req.validatedParams = await productIdSchema.parseAsync({ productId: req.params.productId });
      req.validatedQuery = await getReviewListQuerySchema.parseAsync(parsedQuery);
      next();
    } catch (err) {
      forwardZodError(err, '리뷰 조회', next);
    }
  };

  validateDeleteReview: RequestHandler = async (req, res, next) => {
    try {
      req.validatedParams = await reviewIdSchema.parseAsync({ reviewId: req.params.reviewId });
      next();
    } catch (err) {
      forwardZodError(err, '리뷰 삭제', next);
    }
  };
}

export default new ReviewValidator();
