import { z } from 'zod';

const idChecker = z.cuid({ message: 'ID는 CUID 형식이어야 합니다.' });

// 주문 아이템 요청 스키마
const orderItemRequestSchema = z.object({
  productId: idChecker,
  sizeId: z.number().int().positive('사이즈 ID는 양의 정수여야 합니다.'),
  quantity: z.number().int().positive('수량은 양의 정수여야 합니다.'),
});

// 주문 생성 요청 스키마
export const createOrderSchema = z.object({
  name: z.string().min(1, '주문자 이름은 필수입니다.'),
  phone: z.string().min(1, '전화번호는 필수입니다.'),
  address: z.string().min(1, '주소는 필수입니다.'),
  orderItems: z.array(orderItemRequestSchema).min(1, '최소 하나의 주문 아이템이 필요합니다.'),
  usePoint: z.number().int().nonnegative('사용 포인트는 0 이상이어야 합니다.').default(0),
});

// 주문 목록 조회 쿼리 스키마
export const getOrdersQuerySchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().int().positive().default(3),
  page: z.coerce.number().int().positive().default(1),
});

// 주문 취소 파라미터 스키마
export const deleteOrderParamsSchema = z.object({
  orderId: idChecker,
});

// 주문 생성 요청 DTO
export type CreateOrderDto = z.infer<typeof createOrderSchema>;

// 주문 아이템 요청 DTO
export type OrderItemRequestDto = z.infer<typeof orderItemRequestSchema>;

// 주문 목록 조회 쿼리 DTO
export type GetOrdersQueryDto = z.infer<typeof getOrdersQuerySchema>;

// 주문 취소 파라미터 DTO
export type DeleteOrderParamsDto = z.infer<typeof deleteOrderParamsSchema>;

// 사이즈 정보 DTO
export interface SizeDto {
  id: number;
  size: {
    en: string;
    ko: string;
  };
}

// 결제 정보 DTO
export interface PaymentDto {
  id: string;
  orderId: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// 주문 생성 응답 - Order DTO
export interface CreateOrderResponseDto {
  id: string;
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItemResponseDto[];
  payments: PaymentDto;
}

// 주문 생성 응답 - OrderItem DTO
export interface OrderItemResponseDto {
  id: string;
  productId: string;
  sizeId: number;
  price: number;
  quantity: number;
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  product: ProductInOrderDto;
  size: SizeDto;
}

// 주문 생성 응답 - Product DTO
export interface ProductInOrderDto {
  id: string;
  name: string;
  image: string | null;
}

// Repository 레이어에서 사용하는 주문 생성 데이터 타입
export interface CreateOrderData {
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
}

// Repository 레이어에서 사용하는 주문 아이템 생성 데이터 타입
export interface CreateOrderItemData {
  productId: string;
  sizeId: number;
  price: number;
  quantity: number;
}

// Repository 레이어에서 사용하는 주문 취소 아이템 데이터 타입
export interface CancelOrderItemData {
  productId: string;
  sizeId: number;
  quantity: number;
}

// 주문 목록 조회 응답 - Order DTO
export interface OrderInListDto {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: Date;
  orderItems: OrderItemInListDto[];
  payments: PaymentDto;
}

// 주문 목록 조회 응답 - OrderItem DTO
export interface OrderItemInListDto {
  id: string;
  price: number;
  quantity: number;
  productId: string;
  product: ProductInOrderListDto;
  size: SizeDto;
  isReviewed: boolean;
}

// 주문 목록 조회 응답 - Product DTO
export interface ProductInOrderListDto {
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
  store: StoreInOrderListDto;
  stocks: StockInOrderListDto[];
  reviews: ReviewInOrderListDto[];
}

// 주문 목록 조회 응답 - Store DTO
export interface StoreInOrderListDto {
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

// 주문 목록 조회 응답 - Stock DTO
export interface StockInOrderListDto {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: SizeDto;
}

// 주문 목록 조회 응답 - Review DTO
export interface ReviewInOrderListDto {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
}

// 주문 목록 조회 응답 - Pagination Meta DTO
export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 주문 목록 조회 응답 DTO
export interface GetOrdersResponseDto {
  data: OrderInListDto[];
  meta: PaginationMetaDto;
}
