import express from 'express';
import reviewController from '@modules/review/reviewController';
import reviewValidator from '@modules/review/reviewValidator';
import { authMiddleware } from '@middlewares/authMiddleware';

const reviewRouter = express.Router();

reviewRouter
  .route('/:reviewId')
  .patch(authMiddleware, reviewValidator.validateUpdateReview, reviewController.updateReview)
  .delete(authMiddleware, reviewValidator.validateDeleteReview, reviewController.deleteReview);

export default reviewRouter;
