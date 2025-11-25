import { z } from 'zod';
import { CATEGORY_NAMES, SIZE_OPTIONS, SORT_OPTIONS } from './productConstant';

const nameChecker = z
  .string()
  .min(2, '상품 이름은 최소 2자 이상이어야 합니다')
  .max(50, '상품 이름은 최대 50자 이하여야 합니다');

const priceChecker = z.coerce
  .number()
  .min(0, '가격은 0 이상이어야 합니다.')
  .max(100000000, '가격은 1억 이하여야 합니다')
  .int('가격은 정수여야 합니다.');

const imageChecker = z.url('이미지 URL 형식이 올바르지 않습니다.').nullish();

const contentChecker = z
  .string()
  .min(1, '내용은 최소 1자 이상이어야 합니다')
  .max(500, '내용은 최대 500자 이하여야 합니다');

const discountRateChecker = z.coerce
  .number()
  .int('할인율은 정수여야 합니다.')
  .min(0)
  .max(100)
  .nullish();

const dateChecker = z.coerce.date();

const stockChecker = z.object({
  sizeId: z.coerce.number().int(),
  quantity: z.coerce
    .number()
    .int()
    .min(0, '재고는 0 이상이어야 합니다.')
    .max(10000, '재고는 10,000 이하여야 합니다'),
});

export const createProductSchema = z.object({
  categoryName: z.string(),
  name: nameChecker,
  price: priceChecker,
  image: imageChecker.nullish(),
  discountRate: discountRateChecker,
  discountStartTime: dateChecker.nullish(),
  discountEndTime: dateChecker.nullish(),
  content: contentChecker,
  stocks: z.array(stockChecker).min(1, '재고를 하나 이상 추가해주세요.'),
});

export const getProductListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(16),
  search: z.string().optional(),
  sort: z.enum(SORT_OPTIONS).default('highRating'),
  priceMin: z.coerce.number().min(0).max(100000000).optional(),
  priceMax: z.coerce.number().min(0).max(100000000).optional(),
  size: z.enum(SIZE_OPTIONS).optional(),
  favoriteStore: z.cuid().optional(),
  categoryName: z.string().optional(), //404 에러 별도로 내기 위해 string으로 검사
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type StockDto = z.infer<typeof stockChecker>;
export type GetProductListDto = z.infer<typeof getProductListSchema>;

export const productIdSchema = z.object({
  id: z.cuid('상품 ID가 올바르지 않습니다.'),
});

export const updateProductSchema = createProductSchema.partial().extend({
  stocks: z.array(stockChecker).min(1, '재고를 하나 이상 추가해주세요.'),
});

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

//repository 레이어로 넘길때에는 데이터의 형태가 다름
export interface CreateProductRepoDto
  extends Omit<CreateProductDto, 'categoryName' | 'discountRate'> {
  categoryId: string;
  discountRate: number; // prisam에서는 null을 허용하지 않으므로 숫자로 들어가게
  discountPrice?: number;
}

export interface UpdateProductRepoDto
  extends Omit<UpdateProductDto, 'categoryName' | 'discountRate'> {
  categoryId?: string;
  discountRate?: number; // prisam에서는 null을 허용하지 않으므로 숫자로 들어가게
  discountPrice?: number;
}

interface TransformedStock {
  id: string;
  quantity: number;
  size: {
    id: number;
    name: string;
  };
}

interface RatingCounts {
  [key: string]: number;
}

export interface ProductResponseDto {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  content: string;
  image: string | null;
  price: number;
  discountPrice: number | null;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  storeName: string;
  stocks: TransformedStock[];
  reviewsRating: number;
  reviews: RatingCounts;
  isSoldOut: boolean;
}

export type SortOptions = (typeof SORT_OPTIONS)[number];
export type SizeOptions = (typeof SIZE_OPTIONS)[number];
export type CategoryNames = (typeof CATEGORY_NAMES)[number];
