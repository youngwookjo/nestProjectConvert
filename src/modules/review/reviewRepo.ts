import { prisma } from '@shared/prisma';
import {
  CreateReviewDto,
  UpdateReviewDto,
  GetReviewListQueryDto,
} from '@modules/review/dto/reviewDTO';

const selectOptionDB = {
  id: true,
  userId: true,
  productId: true,
  rating: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  orderItemId: true,
  user: {
    select: {
      name: true,
    },
  },
};

class ReviewRepository {
  createReview = async (createReviewDto: CreateReviewDto) => {
    const review = await prisma.$transaction(async (tx) => {
      const createdReview = await tx.review.create({
        data: {
          userId: createReviewDto.userId,
          productId: createReviewDto.productId,
          orderItemId: createReviewDto.orderItemId,
          content: createReviewDto.content,
          rating: createReviewDto.rating,
        },
        select: selectOptionDB,
      });
      await tx.orderItem.update({
        where: { id: createReviewDto.orderItemId },
        data: { isReviewed: true },
      });
      return createdReview;
    });
    return review;
  };

  getReviewById = async (reviewId: string) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    return review;
  };

  updateReview = async (updateReviewDto: UpdateReviewDto) => {
    const review = await prisma.review.update({
      where: { id: updateReviewDto.reviewId },
      data: {
        rating: updateReviewDto.rating,
        content: updateReviewDto.content,
      },
      select: selectOptionDB,
    });
    return review;
  };

  getReviewList = async (getReviewListQueryDto: GetReviewListQueryDto) => {
    const offset = (getReviewListQueryDto.page - 1) * getReviewListQueryDto.limit;
    const data = await prisma.$transaction(async (tx) => {
      const count = await tx.review.count({
        where: { productId: getReviewListQueryDto.productId },
      });
      const reviewList = await tx.review.findMany({
        where: { productId: getReviewListQueryDto.productId },
        skip: offset,
        take: getReviewListQueryDto.limit,
        orderBy: { createdAt: 'desc' },
        select: selectOptionDB,
      });
      return { count, reviewList };
    });
    return data;
  };

  deleteReview = async (reviewId: string, orderItemId: string) => {
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { isReviewed: false },
      });
    });
  };
}

export default new ReviewRepository();
