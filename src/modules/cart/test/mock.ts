// Cart 테스트용 Mock 데이터

/**
 * 공통 테스트 상수
 */
export const TEST_USER_ID = 'test-user-id';
export const TEST_SELLER_ID = 'seller-id';

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
 * Stock Mock 데이터
 */
export interface MockStock {
  id: string;
  productId: string;
  sizeId: number;
  quantity: number;
  size: MockSize;
}

export const createMockStock = (override?: Partial<MockStock>): MockStock => ({
  id: 'stock-1',
  productId: 'product-1',
  sizeId: 1,
  quantity: 100,
  size: createMockSize(),
  ...override,
});

/**
 * Store Mock 데이터
 */
export interface MockStore {
  id: string;
  userId: string;
  name: string;
  address: string;
  phoneNumber: string;
  content: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createMockStore = (testDate: Date, override?: Partial<MockStore>): MockStore => ({
  id: 'store-1',
  userId: TEST_SELLER_ID,
  name: '테스트 스토어',
  address: '서울시 강남구',
  phoneNumber: '010-1234-5678',
  content: '스토어 설명',
  image: 'https://example.com/store.jpg',
  createdAt: testDate,
  updatedAt: testDate,
  ...override,
});

/**
 * Product Mock 데이터
 */
export interface MockProduct {
  id: string;
  storeId: string;
  name: string;
  price: number;
  image: string;
  discountRate: number;
  discountStartTime: Date | null;
  discountEndTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  store: MockStore;
  stocks: MockStock[];
}

export const createMockProduct = (testDate: Date, override?: Partial<MockProduct>): MockProduct => ({
  id: 'product-1',
  storeId: 'store-1',
  name: '테스트 상품',
  price: 10000,
  image: 'https://example.com/image.jpg',
  discountRate: 10,
  discountStartTime: testDate,
  discountEndTime: testDate,
  createdAt: testDate,
  updatedAt: testDate,
  store: createMockStore(testDate),
  stocks: [createMockStock()],
  ...override,
});

/**
 * CartItem Mock 데이터
 */
export interface MockCartItem {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: MockProduct;
}

export const createMockCartItem = (
  testDate: Date,
  override?: Partial<MockCartItem>
): MockCartItem => ({
  id: 'item-1',
  cartId: 'cart-id',
  productId: 'product-1',
  sizeId: 1,
  quantity: 2,
  createdAt: testDate,
  updatedAt: testDate,
  product: createMockProduct(testDate),
  ...override,
});

/**
 * Cart Mock 데이터 (Repository에서 반환하는 형태)
 * createOrGetCart용 - 단순 quantity만 포함한 items
 */
export interface SimpleCartMock {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{ quantity: number }>;
}

/**
 * Cart Mock 데이터 (Repository에서 반환하는 형태)
 * getCart용 - 상세 정보가 포함된 items
 */
export interface DetailedCartMock {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: MockCartItem[];
}

/**
 * 빈 장바구니 Mock 생성 (createOrGetCart용)
 */
export const createEmptyCartMock = (
  testDate: Date,
  override?: Partial<SimpleCartMock>
): SimpleCartMock => ({
  id: 'mock-cart-id',
  userId: TEST_USER_ID,
  createdAt: testDate,
  updatedAt: testDate,
  items: [],
  ...override,
});

/**
 * 빈 장바구니 Mock 생성 (getCart용)
 */
export const createEmptyCartWithDetailsMock = (
  testDate: Date,
  override?: Partial<DetailedCartMock>
): DetailedCartMock => ({
  id: 'mock-cart-id',
  userId: TEST_USER_ID,
  createdAt: testDate,
  updatedAt: testDate,
  items: [],
  ...override,
});

/**
 * 단순 아이템이 있는 장바구니 Mock 생성 (createOrGetCart용)
 */
export const createCartWithSimpleItemsMock = (
  testDate: Date,
  items: Array<{ quantity: number }>,
  override?: Partial<SimpleCartMock>
): SimpleCartMock => ({
  id: 'existing-cart-id',
  userId: TEST_USER_ID,
  createdAt: testDate,
  updatedAt: testDate,
  items,
  ...override,
});

/**
 * 상세 정보가 포함된 장바구니 Mock 생성 (getCart용)
 */
export const createCartWithDetailsMock = (
  testDate: Date,
  items: MockCartItem[],
  override?: Partial<DetailedCartMock>
): DetailedCartMock => ({
  id: 'cart-with-items-id',
  userId: TEST_USER_ID,
  createdAt: testDate,
  updatedAt: testDate,
  items,
  ...override,
});

/**
 * CartItem 응답용 Mock 데이터 (updateCart 응답용 - 간단한 형태)
 */
export interface SimpleCartItemMock {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createSimpleCartItemMock = (
  testDate: Date,
  override?: Partial<SimpleCartItemMock>
): SimpleCartItemMock => ({
  id: 'cart-item-1',
  cartId: 'cart-id',
  productId: 'product-1',
  sizeId: 1,
  quantity: 3,
  createdAt: testDate,
  updatedAt: testDate,
  ...override,
});

/**
 * CartItem with Cart 정보 Mock 데이터 (deleteCartItem용)
 */
export interface MockCartItemWithCart {
  id: string;
  cartId: string;
  productId: string;
  sizeId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  cart: {
    userId: string;
  };
}

export const createMockCartItemWithCart = (
  testDate: Date,
  override?: Partial<MockCartItemWithCart>
): MockCartItemWithCart => ({
  id: 'cart-item-1',
  cartId: 'cart-id',
  productId: 'product-1',
  sizeId: 1,
  quantity: 2,
  createdAt: testDate,
  updatedAt: testDate,
  cart: {
    userId: TEST_USER_ID,
  },
  ...override,
});

/**
 * 복잡한 테스트용 장바구니 데이터 생성 (2개의 아이템 포함)
 */
export const createComplexCartMock = (testDate: Date): DetailedCartMock => {
  const item1: MockCartItem = {
    id: 'item-1',
    cartId: 'cart-with-items-id',
    productId: 'product-1',
    sizeId: 1,
    quantity: 2,
    createdAt: testDate,
    updatedAt: testDate,
    product: {
      id: 'product-1',
      storeId: 'store-1',
      name: '테스트 상품',
      price: 10000,
      image: 'https://example.com/image.jpg',
      discountRate: 10,
      discountStartTime: testDate,
      discountEndTime: testDate,
      createdAt: testDate,
      updatedAt: testDate,
      store: {
        id: 'store-1',
        userId: 'seller-id',
        name: '테스트 스토어',
        address: '서울시 강남구',
        phoneNumber: '010-1234-5678',
        content: '스토어 설명',
        image: 'https://example.com/store.jpg',
        createdAt: testDate,
        updatedAt: testDate,
      },
      stocks: [
        {
          id: 'stock-1',
          productId: 'product-1',
          sizeId: 1,
          quantity: 100,
          size: {
            id: 1,
            en: 'M',
            ko: '중',
          },
        },
      ],
    },
  };

  const item2: MockCartItem = {
    id: 'item-2',
    cartId: 'cart-with-items-id',
    productId: 'product-2',
    sizeId: 2,
    quantity: 3,
    createdAt: testDate,
    updatedAt: testDate,
    product: {
      id: 'product-2',
      storeId: 'store-2',
      name: '테스트 상품2',
      price: 20000,
      image: 'https://example.com/image2.jpg',
      discountRate: 0,
      discountStartTime: null,
      discountEndTime: null,
      createdAt: testDate,
      updatedAt: testDate,
      store: {
        id: 'store-2',
        userId: 'seller-id-2',
        name: '테스트 스토어2',
        address: '서울시 서초구',
        phoneNumber: '010-9876-5432',
        content: '스토어 설명2',
        image: 'https://example.com/store2.jpg',
        createdAt: testDate,
        updatedAt: testDate,
      },
      stocks: [
        {
          id: 'stock-2',
          productId: 'product-2',
          sizeId: 2,
          quantity: 50,
          size: {
            id: 2,
            en: 'L',
            ko: '대',
          },
        },
      ],
    },
  };

  return {
    id: 'cart-with-items-id',
    userId: TEST_USER_ID,
    createdAt: testDate,
    updatedAt: testDate,
    items: [item1, item2],
  };
};
