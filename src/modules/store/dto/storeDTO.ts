import { z } from 'zod';

const nameChecker = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(20, '이름은 최대 20자 이하여야 합니다')
  .regex(/^[a-zA-Z0-9가-힣]+$/, '이름에 특수문자는 사용할 수 없습니다.');

const addressChecker = z
  .string()
  .min(8, '주소는 최소 8자 이상이어야 합니다')
  .max(200, '주소는 최대 200자 이하여야 합니다');

const detailAddressChecker = z
  .string()
  .min(1, '상세주소는 최소 1자 이상이어야 합니다')
  .max(20, '상세주소는 최대 20자 이하여야 합니다')
  .nullish();

const contentChecker = z
  .string()
  .min(1, '내용은 최소 1자 이상이어야 합니다')
  .max(500, '내용은 최대 500자 이하여야 합니다');

const phoneNumberChecker = z
  .string()
  .regex(/^01([0|1|6|7|8|9])-([0-9]{3,4})-([0-9]{4})$/, '올바른 핸드폰 번호가 아닙니다');

const storeIdChecker = z.cuid({ message: '스토어 ID는 CUID 형식이어야 합니다.' });

const pageChecker = z.coerce.number().int().min(1).default(1);
const pageSizeChecker = z.coerce.number().int().min(1).max(100).default(10);

export const createStoreSchema = z.object({
  name: nameChecker,
  address: addressChecker,
  detailAddress: detailAddressChecker,
  phoneNumber: phoneNumberChecker,
  content: contentChecker,
  image: z.url('이미지 URL 형식이 올바르지 않습니다.').nullish(),
});

export const updateStoreSchema = createStoreSchema.partial();

export const storeIdSchema = z.object({
  storeId: storeIdChecker,
});

export const paginationSchema = z.object({
  page: pageChecker,
  pageSize: pageSizeChecker,
});

export type CreateStoreDto = z.infer<typeof createStoreSchema>;

export type UpdateStoreDto = z.infer<typeof updateStoreSchema>;

export type GetMyProductListDto = z.infer<typeof paginationSchema>;

export interface PublicStoreDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  address: string;
  detailAddress: string | null;
  phoneNumber: string;
  content: string;
  image: string | null;
  favoriteCount: number;
}

export interface PublicMyStoreDto extends PublicStoreDto {
  productCount: number;
  monthFavoriteCount: number;
  totalSoldCount: number;
}

export interface DBProductDto {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  stock: number;
  isDiscount: boolean;
  isSoldOut: boolean;
  totalCount: number;
  image: string | null;
}

export type FavoriteStoreAction = 'register' | 'delete';

export interface PublicFavoriteStoreDto {
  type: FavoriteStoreAction;
  store: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    address: string;
    detailAddress: string | null;
    phoneNumber: string;
    content: string;
    image: string | null;
  };
}
