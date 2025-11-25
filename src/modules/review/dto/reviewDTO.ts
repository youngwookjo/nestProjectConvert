import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5, '평점은 1에서 5 사이여야 합니다.'),
  content: z.string().min(10, '리뷰는 최소 10자 이상이어야 합니다'),
  orderItemId: z.cuid('유효한 주문 상품 ID 형식이어야 합니다.'),
});

export const orderItemIdSchema = z.object({
  orderItemId: z.cuid('유효한 주문 상품 ID 형식이어야 합니다.'),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema> & {
  userId: string;
  productId: string;
};

export const updateReviewSchema = createReviewSchema.omit({ orderItemId: true });

export const reviewIdSchema = z.object({
  reviewId: z.cuid('유효한 리뷰 ID 형식이어야 합니다.'),
});

export type UpdateReviewDto = z.infer<typeof updateReviewSchema> & {
  userId: string;
  reviewId: string;
};

export const getReviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(5),
});

export const productIdSchema = z.object({
  productId: z.cuid('유효한 상품 ID 형식이어야 합니다.'),
});

export type GetReviewListQueryDto = z.infer<typeof getReviewListQuerySchema> &
  z.infer<typeof productIdSchema>;

export type DeleteReviewDto = {
  reviewId: string;
  userId: string;
};

export type ResReviewDto = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  orderItemId: string;
  user: {
    name: string;
  };
};

export interface ReviewMetaData {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ResReviewListDto {
  items: ResReviewDto[];
  meta: ReviewMetaData;
}
