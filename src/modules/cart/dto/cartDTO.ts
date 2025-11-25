import { z } from 'zod';

const idChecker = z.cuid({ message: 'ID는 CUID 형식이어야 합니다.' });

// 장바구니 아이템 ID 검증 스키마
export const cartItemIdSchema = z.object({
  cartItemId: idChecker,
});

// 장바구니 수정 요청 스키마
export const updateCartSchema = z.object({
  productId: idChecker,
  sizes: z
    .array(
      z.object({
        sizeId: z.number().int().positive('사이즈 ID는 양의 정수여야 합니다.'),
        quantity: z.number().int().positive('수량은 양의 정수여야 합니다.'),
      }),
    )
    .min(1, '최소 하나의 사이즈 정보가 필요합니다.'),
});

// 장바구니 아이템 ID 검증 타입
export type CartItemIdDto = z.infer<typeof cartItemIdSchema>;

// 장바구니 수정 요청 DTO
export type UpdateCartDto = z.infer<typeof updateCartSchema>;

// 장바구니 생성 응답 DTO (buyerId는 userId를 매핑한 것)
export interface CreatedCartDto {
  id: string;
  buyerId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// 장바구니 조회 응답 DTO
export interface GetCartDto {
  id: string;
  buyerId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemDto[];
}

export interface CartItemDto {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: ProductInCartDto;
}

export interface ProductInCartDto {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string | null;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  store: StoreInCartDto;
  stocks: StockInCartDto[];
}

export interface StoreInCartDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  content: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockInCartDto {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: SizeInCartDto;
}

export interface SizeInCartDto {
  id: number;
  size: {
    en: string;
    ko: string;
  };
}

// 장바구니 수정 응답 DTO (CartItem)
export interface CartItemResponseDto {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
