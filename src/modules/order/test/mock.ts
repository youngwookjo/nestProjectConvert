// Order 테스트용 Mock 데이터

/**
 * 공통 테스트 상수
 */
export const TEST_USER_ID = 'test-user-id';
export const TEST_STORE_ID = 'test-store-id';
export const TEST_PRODUCT_ID = 'test-product-id';
export const TEST_ORDER_ID = 'test-order-id';

/**
 * 상품 가격 정보 Mock 데이터
 */
export interface MockProductPriceInfo {
  price: number;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
}

export const createMockProductPriceInfo = (
  override?: Partial<MockProductPriceInfo>,
): MockProductPriceInfo => ({
  price: 10000,
  discountRate: 0,
  discountStartTime: null,
  discountEndTime: null,
  ...override,
});

/**
 * 재고 정보 Mock 데이터
 */
export interface MockStock {
  id: string;
  quantity: number;
}

export const createMockStock = (override?: Partial<MockStock>): MockStock => ({
  id: 'stock-1',
  quantity: 100,
  ...override,
});

/**
 * Size Mock 데이터
 */
export interface MockSize {
  id: number;
  en: string;
  ko: string;
}

export const createMockSize = (override?: Partial<MockSize>): MockSize => ({
  id: 1,
  en: 'M',
  ko: '중',
  ...override,
});

/**
 * Product Mock 데이터
 */
export interface MockProduct {
  id: string;
  name: string;
  image: string | null;
}

export const createMockProduct = (override?: Partial<MockProduct>): MockProduct => ({
  id: TEST_PRODUCT_ID,
  name: '테스트 상품',
  image: 'https://example.com/product.jpg',
  ...override,
});

/**
 * OrderItem Mock 데이터
 */
export interface MockOrderItem {
  id: string;
  orderId: string;
  productId: string;
  sizeId: number;
  price: number;
  quantity: number;
  isReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  product: MockProduct;
  size: MockSize;
}

export const createMockOrderItem = (
  testDate: Date,
  override?: Partial<MockOrderItem>,
): MockOrderItem => ({
  id: 'order-item-1',
  orderId: TEST_ORDER_ID,
  productId: TEST_PRODUCT_ID,
  sizeId: 1,
  price: 10000,
  quantity: 2,
  isReviewed: false,
  createdAt: testDate,
  updatedAt: testDate,
  product: createMockProduct(),
  size: createMockSize(),
  ...override,
});

/**
 * Payment Mock 데이터
 */
export interface MockPayment {
  id: string;
  orderId: string;
  price: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockPayment = (testDate: Date, override?: Partial<MockPayment>): MockPayment => ({
  id: 'payment-1',
  orderId: TEST_ORDER_ID,
  price: 20000,
  status: 'CompletedPayment',
  createdAt: testDate,
  updatedAt: testDate,
  ...override,
});

/**
 * Order Mock 데이터 (Repository에서 반환하는 형태)
 */
export interface MockOrder {
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
  items: MockOrderItem[];
  payments: MockPayment[];
}

export const createMockOrder = (testDate: Date, override?: Partial<MockOrder>): MockOrder => ({
  id: TEST_ORDER_ID,
  userId: TEST_USER_ID,
  name: '홍길동',
  address: '서울시 강남구 테헤란로 123',
  phoneNumber: '010-1234-5678',
  subtotal: 20000,
  totalQuantity: 2,
  usePoint: 0,
  createdAt: testDate,
  updatedAt: testDate,
  items: [createMockOrderItem(testDate)],
  payments: [createMockPayment(testDate)],
  ...override,
});

/**
 * Store Mock 데이터 (주문 목록용)
 */
export interface MockStore {
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

export const createMockStore = (testDate: Date, override?: Partial<MockStore>): MockStore => ({
  id: TEST_STORE_ID,
  userId: TEST_USER_ID,
  name: '테스트 스토어',
  address: '서울시 강남구',
  phoneNumber: '02-1234-5678',
  content: '테스트 스토어 설명',
  image: 'https://example.com/store.jpg',
  createdAt: testDate,
  updatedAt: testDate,
  ...override,
});

/**
 * Stock Mock 데이터 (주문 목록용)
 */
export interface MockStockInOrder {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: {
    id: number;
    en: string;
    ko: string;
  };
}

export const createMockStockInOrder = (override?: Partial<MockStockInOrder>): MockStockInOrder => ({
  id: 'stock-1',
  productId: TEST_PRODUCT_ID,
  sizeId: 1,
  quantity: 100,
  size: {
    id: 1,
    en: 'M',
    ko: '중',
  },
  ...override,
});

/**
 * Product Mock 데이터 (주문 목록용 - 상세 버전)
 */
export interface MockProductInOrderList {
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
  store: MockStore;
  stocks: MockStockInOrder[];
}

export const createMockProductInOrderList = (
  testDate: Date,
  override?: Partial<MockProductInOrderList>,
): MockProductInOrderList => ({
  id: TEST_PRODUCT_ID,
  storeId: TEST_STORE_ID,
  name: '테스트 상품',
  price: 10000,
  image: 'https://example.com/product.jpg',
  discountRate: 0,
  discountStartTime: null,
  discountEndTime: null,
  createdAt: testDate,
  updatedAt: testDate,
  store: createMockStore(testDate),
  stocks: [createMockStockInOrder()],
  ...override,
});

/**
 * OrderItem Mock 데이터 (주문 목록용)
 */
export interface MockOrderItemInList {
  id: string;
  price: number;
  quantity: number;
  productId: string;
  isReviewed: boolean;
  product: MockProductInOrderList;
  size: {
    id: number;
    en: string;
    ko: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    content: string;
    createdAt: Date;
  }>;
}

export const createMockOrderItemInList = (
  testDate: Date,
  override?: Partial<MockOrderItemInList>,
): MockOrderItemInList => ({
  id: 'order-item-1',
  price: 10000,
  quantity: 2,
  productId: TEST_PRODUCT_ID,
  isReviewed: false,
  product: createMockProductInOrderList(testDate),
  size: {
    id: 1,
    en: 'M',
    ko: '중',
  },
  reviews: [],
  ...override,
});

/**
 * Order Mock 데이터 (주문 목록용)
 */
export interface MockOrderInList {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: Date;
  items: MockOrderItemInList[];
  payments: MockPayment[];
}

export const createMockOrderInList = (
  testDate: Date,
  override?: Partial<MockOrderInList>,
): MockOrderInList => ({
  id: TEST_ORDER_ID,
  name: '홍길동',
  phoneNumber: '010-1234-5678',
  address: '서울시 강남구 테헤란로 123',
  subtotal: 20000,
  totalQuantity: 2,
  usePoint: 0,
  createdAt: testDate,
  items: [createMockOrderItemInList(testDate)],
  payments: [createMockPayment(testDate)],
  ...override,
});

/**
 * Order Mock 데이터 (취소용 - getOrderById 반환 형태)
 */
export interface MockOrderForCancel {
  id: string;
  userId: string;
  usePoint: number;
  items: {
    productId: string;
    sizeId: number;
    quantity: number;
  }[];
  payments: {
    id: string;
    status: string;
    price: number;
  }[];
}

export const createMockOrderForCancel = (
  override?: Partial<MockOrderForCancel>,
): MockOrderForCancel => ({
  id: TEST_ORDER_ID,
  userId: TEST_USER_ID,
  usePoint: 0,
  items: [
    {
      productId: TEST_PRODUCT_ID,
      sizeId: 1,
      quantity: 2,
    },
  ],
  payments: [
    {
      id: 'payment-1',
      status: 'CompletedPayment',
      price: 20000,
    },
  ],
  ...override,
});

/**
 * 주문 취소용 Mock 데이터 (getOrderById 반환 형태 - price 포함)
 */
export interface MockOrderForCancelWithPrice {
  id: string;
  userId: string;
  usePoint: number;
  items: {
    productId: string;
    sizeId: number;
    quantity: number;
  }[];
  payments: {
    id: string;
    status: string;
    price: number;
  }[];
}

export const createMockOrderForCancelWithPrice = (
  override?: Partial<MockOrderForCancelWithPrice>,
): MockOrderForCancelWithPrice => ({
  id: TEST_ORDER_ID,
  userId: TEST_USER_ID,
  usePoint: 0,
  items: [
    {
      productId: TEST_PRODUCT_ID,
      sizeId: 1,
      quantity: 2,
    },
  ],
  payments: [
    {
      id: 'payment-1',
      status: 'CompletedPayment',
      price: 20000,
    },
  ],
  ...override,
});

/**
 * 생성된 주문 데이터 Mock (createOrderData 반환용)
 */
export interface MockCreatedOrderData {
  id: string;
}

export const createMockCreatedOrderData = (
  override?: Partial<MockCreatedOrderData>,
): MockCreatedOrderData => ({
  id: TEST_ORDER_ID,
  ...override,
});
