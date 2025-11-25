// Mock 데이터만 정의 (삽입 로직은 seed.ts에서 처리)

import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
} from 'date-fns';

// ============================================
// 헬퍼 함수: 날짜 생성 (대시보드 기준)
// ============================================

/**
 * 범위 내 랜덤 날짜 생성
 */
const getRandomDateBetween = (start: Date, end: Date): Date => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

/**
 * 오늘 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInToday = (): Date => {
  const now = new Date();
  return getRandomDateBetween(startOfDay(now), endOfDay(now));
};

/**
 * 어제 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInYesterday = (): Date => {
  const now = new Date();
  const yesterday = subDays(now, 1);
  return getRandomDateBetween(startOfDay(yesterday), endOfDay(yesterday));
};

/**
 * 이번 주 날짜 범위에서 랜덤 날짜 생성 (월요일 시작)
 */
const getRandomDateInThisWeek = (): Date => {
  const now = new Date();
  return getRandomDateBetween(
    startOfWeek(now, { weekStartsOn: 1 }),
    endOfWeek(now, { weekStartsOn: 1 }),
  );
};

/**
 * 지난 주 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInLastWeek = (): Date => {
  const now = new Date();
  const lastWeek = subWeeks(now, 1);
  return getRandomDateBetween(
    startOfWeek(lastWeek, { weekStartsOn: 1 }),
    endOfWeek(lastWeek, { weekStartsOn: 1 }),
  );
};

/**
 * 이번 달 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInThisMonth = (): Date => {
  const now = new Date();
  return getRandomDateBetween(startOfMonth(now), endOfMonth(now));
};

/**
 * 지난 달 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInLastMonth = (): Date => {
  const now = new Date();
  const lastMonth = subMonths(now, 1);
  return getRandomDateBetween(startOfMonth(lastMonth), endOfMonth(lastMonth));
};

/**
 * 올해 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInThisYear = (): Date => {
  const now = new Date();
  return getRandomDateBetween(startOfYear(now), endOfYear(now));
};

/**
 * 작년 날짜 범위에서 랜덤 날짜 생성
 */
const getRandomDateInLastYear = (): Date => {
  const now = new Date();
  const lastYear = subYears(now, 1);
  return getRandomDateBetween(startOfYear(lastYear), endOfYear(lastYear));
};

// ============================================
// 헬퍼 함수: 유틸리티
// ============================================

/**
 * 배열에서 랜덤 요소 선택
 */
const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * 랜덤 정수 생성 (min 이상 max 이하)
 */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// 타입 정의 (Mock 데이터용)
// ============================================

export type MockUser = {
  name: string;
  email: string;
  password: string;
  type: 'BUYER' | 'SELLER';
  points: number;
  image: string;
  totalAmount: number;
};

// MockBuyer는 MockUser의 별칭 (하위 호환성)
type MockBuyer = MockUser;

type MockOrder = {
  userIndex: number;
  name: string;
  address: string;
  phoneNumber: string;
  subtotal: number;
  totalQuantity: number;
  usePoint: number;
  createdAt: Date;
};

type MockOrderItem = {
  orderIndex: number;
  productIndex: number;
  sizeIndex: number;
  price: number;
  quantity: number;
  isReviewed: boolean;
};

type MockPayment = {
  orderIndex: number;
  price: number;
  status: string;
};

type MockReview = {
  userIndex: number;
  productIndex: number;
  orderItemIndex: number;
  content: string;
  rating: number;
};

// ============================================
// 헬퍼 함수: 대량 데이터 생성
// ============================================

/**
 * 구매자 대량 생성
 */
const generateBulkBuyers = (count: number): MockUser[] => {
  const buyers: MockUser[] = [];
  const totalAmounts = [0, 50000, 150000, 350000, 600000, 1200000]; // 다양한 등급 분포

  for (let i = 0; i < count; i++) {
    buyers.push({
      name: `구매자${i + 3}`, // 구매자1, 구매자2는 이미 존재
      email: `buyer${i + 3}@example.com`,
      password: 'password123',
      type: 'BUYER',
      points: randomInt(0, 50000),
      image: 'https://picsum.photos/200/300',
      totalAmount: randomChoice(totalAmounts),
    });
  }

  return buyers;
};

/**
 * 주문 대량 생성 (대시보드 날짜 분산 적용)
 * 총 400개 주문:
 * - 오늘: 10개, 어제: 8개
 * - 이번 주: 50개, 지난 주: 40개
 * - 이번 달: 80개, 지난 달: 70개
 * - 올해: 100개, 작년: 42개
 */
const generateBulkOrders = (totalBuyerCount: number): MockOrder[] => {
  const orders: MockOrder[] = [];
  const addresses = [
    '서울시 강남구 테헤란로 123',
    '서울시 서초구 서초대로 456',
    '서울시 송파구 올림픽로 789',
    '경기도 성남시 분당구 판교로 100',
    '인천시 연수구 송도과학로 200',
  ];

  // 날짜 분산 설정
  const dateDistribution = [
    { count: 10, generator: getRandomDateInToday },
    { count: 8, generator: getRandomDateInYesterday },
    { count: 50, generator: getRandomDateInThisWeek },
    { count: 40, generator: getRandomDateInLastWeek },
    { count: 80, generator: getRandomDateInThisMonth },
    { count: 70, generator: getRandomDateInLastMonth },
    { count: 100, generator: getRandomDateInThisYear },
    { count: 42, generator: getRandomDateInLastYear },
  ];

  // 각 날짜 범위별로 주문 생성
  for (const { count, generator } of dateDistribution) {
    for (let i = 0; i < count; i++) {
      const userIndex = randomInt(0, totalBuyerCount - 1);
      const itemCount = randomInt(1, 5);
      const basePrice = randomInt(10000, 100000);
      const subtotal = basePrice * itemCount;
      const usePoint = Math.random() < 0.3 ? randomInt(0, Math.min(5000, subtotal * 0.1)) : 0;

      orders.push({
        userIndex,
        name: `구매자${userIndex + 1}`,
        address: randomChoice(addresses),
        phoneNumber: `010-${String(randomInt(1000, 9999)).padStart(4, '0')}-${String(randomInt(1000, 9999)).padStart(4, '0')}`,
        subtotal,
        totalQuantity: itemCount,
        usePoint,
        createdAt: generator(),
      });
    }
  }

  // 날짜순 정렬 (오래된 것부터)
  orders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return orders;
};

/**
 * 주문 아이템 대량 생성
 */
const generateBulkOrderItems = (orderCount: number, productCount: number): MockOrderItem[] => {
  const items: MockOrderItem[] = [];
  const prices = [20000, 28000, 35000, 45000, 80000];

  for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
    const itemCount = randomInt(1, 5);

    for (let j = 0; j < itemCount; j++) {
      items.push({
        orderIndex,
        productIndex: randomInt(0, productCount - 1),
        sizeIndex: randomInt(0, 5), // 0~5 (XS~Free)
        price: randomChoice(prices),
        quantity: randomInt(1, 3),
        isReviewed: Math.random() < 0.3,
      });
    }
  }

  return items;
};

/**
 * 결제 데이터 대량 생성 (모두 CompletedPayment)
 */
const generateBulkPayments = (orderCount: number): MockPayment[] => {
  const payments: MockPayment[] = [];

  for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
    payments.push({
      orderIndex,
      price: randomInt(10000, 500000),
      status: 'CompletedPayment',
    });
  }

  return payments;
};

// ============================================
// Mock 데이터 정의
// ============================================

// 사용자 등급 데이터
export const GRADES = [
  {
    name: 'Green',
    rate: 1, // 1%
    minAmount: 0,
  },
  {
    name: 'Orange',
    rate: 2, // 2%
    minAmount: 100000,
  },
  {
    name: 'Red',
    rate: 3, // 3%
    minAmount: 300000,
  },
  {
    name: 'Black',
    rate: 5, // 5%
    minAmount: 500000,
  },
  {
    name: 'VIP',
    rate: 7, // 7%
    minAmount: 1000000,
  },
];

// 사용자 데이터 (구매자 52명 + 판매자 2명)
export const USERS: MockUser[] = [
  // 기본 구매자 2명
  {
    name: '김구매',
    email: 'buyer1@example.com',
    password: 'password1',
    type: 'BUYER',
    points: 5000,
    image: 'https://picsum.photos/200/300',
    totalAmount: 150000,
  },
  {
    name: '이구매',
    email: 'buyer2@example.com',
    password: 'password2',
    type: 'BUYER',
    points: 12000,
    image: 'https://picsum.photos/200/300',
    totalAmount: 800000,
  },
  // 대량 구매자 50명 추가
  ...generateBulkBuyers(50),
  // 판매자 2명
  {
    name: '박판매',
    email: 'seller1@example.com',
    password: 'password3',
    type: 'SELLER',
    points: 0,
    image: 'https://picsum.photos/200/300',
    totalAmount: 0,
  },
  {
    name: '최판매',
    email: 'seller2@example.com',
    password: 'password4',
    type: 'SELLER',
    points: 0,
    image: 'https://picsum.photos/200/300',
    totalAmount: 0,
  },
];

// 스토어 데이터
export const STORES = [
  {
    name: '패션스토어',
    address: '서울시 강남구 테헤란로 123',
    detailAddress: '456호',
    phoneNumber: '02-1234-5678',
    content: '트렌디한 패션 아이템을 판매하는 스토어입니다.',
    image: 'https://picsum.photos/200/300',
  },
  {
    name: '뷰티샵',
    address: '서울시 서초구 서초대로 456',
    detailAddress: '789호',
    phoneNumber: '02-2345-6789',
    content: '고품질 뷰티 제품을 판매하는 스토어입니다.',
    image: 'https://picsum.photos/200/300',
  },
];

// 카테고리 데이터
export const CATEGORIES = [
  {
    name: 'TOP',
  },
  {
    name: 'BOTTOM',
  },
  {
    name: 'DRESS',
  },
  {
    name: 'OUTER',
  },
  {
    name: 'SKIRT',
  },
  {
    name: 'SHOES',
  },
  {
    name: 'ACC',
  },
];

// 사이즈 데이터
export const SIZES = [
  { id: 1, en: 'XS', ko: 'XS' },
  { id: 2, en: 'S', ko: 'S' },
  { id: 3, en: 'M', ko: 'M' },
  { id: 4, en: 'L', ko: 'L' },
  { id: 5, en: 'XL', ko: 'XL' },
  { id: 6, en: 'Free', ko: '프리' },
];

// 상품 데이터
export const PRODUCTS = [
  {
    name: '기본 반팔 티셔츠',
    content: '편안한 착용감의 기본 반팔 티셔츠입니다.',
    image: 'https://picsum.photos/200/300',
    price: 25000,
    discountPrice: 20000,
    discountRate: 20,
    discountStartTime: new Date('2024-01-01'),
    discountEndTime: new Date('2024-12-31'),
  },
  {
    name: '데님 청바지',
    content: '클래식한 스타일의 데님 청바지입니다.',
    image: 'https://picsum.photos/200/300',
    price: 80000,
    discountPrice: 80000,
    discountRate: 0,
    discountStartTime: null,
    discountEndTime: null,
  },
  {
    name: '립스틱',
    content: '지속력이 뛰어난 립스틱입니다.',
    image: 'https://picsum.photos/200/300',
    price: 35000,
    discountPrice: 28000,
    discountRate: 20,
    discountStartTime: new Date('2024-01-01'),
    discountEndTime: new Date('2024-06-30'),
  },
  {
    name: '아이섀도',
    content: '자연스러운 색감의 아이섀도입니다.',
    image: 'https://picsum.photos/200/300',
    price: 45000,
    discountPrice: 45000,
    discountRate: 0,
    discountStartTime: null,
    discountEndTime: null,
  },
];

// 재고 데이터 (상품과 사이즈 인덱스 기반)
export const STOCKS = [
  { productIndex: 0, sizeIndex: 2, quantity: 50 }, // 첫 번째 상품, S 사이즈
  { productIndex: 0, sizeIndex: 3, quantity: 30 }, // 첫 번째 상품, M 사이즈
  { productIndex: 0, sizeIndex: 4, quantity: 20 }, // 첫 번째 상품, L 사이즈
  { productIndex: 1, sizeIndex: 2, quantity: 25 }, // 두 번째 상품, S 사이즈
  { productIndex: 1, sizeIndex: 3, quantity: 35 }, // 두 번째 상품, M 사이즈
  { productIndex: 1, sizeIndex: 4, quantity: 15 }, // 두 번째 상품, L 사이즈
  { productIndex: 2, sizeIndex: 0, quantity: 100 }, // 세 번째 상품, Free 사이즈
  { productIndex: 3, sizeIndex: 0, quantity: 80 }, // 네 번째 상품, Free 사이즈
];

// 장바구니 아이템 데이터 (사용자와 상품 인덱스 기반)
export const CART_ITEMS = [
  { userIndex: 0, productIndex: 0, sizeIndex: 3, quantity: 2 }, // 첫 번째 사용자, 첫 번째 상품, M 사이즈
  { userIndex: 0, productIndex: 2, sizeIndex: 0, quantity: 1 }, // 첫 번째 사용자, 세 번째 상품, Free 사이즈
  { userIndex: 1, productIndex: 1, sizeIndex: 3, quantity: 1 }, // 두 번째 사용자, 두 번째 상품, M 사이즈
];

// 주문 데이터 (400개, 날짜 분산 적용)
// 구매자는 총 52명 (USERS 배열의 처음 52명)
export const ORDERS = generateBulkOrders(52);

// 주문 아이템 데이터 (주문당 1~5개, 총 상품 4개)
export const ORDER_ITEMS = generateBulkOrderItems(ORDERS.length, PRODUCTS.length);

// 결제 데이터 (모두 CompletedPayment)
export const PAYMENTS = generateBulkPayments(ORDERS.length);

// 리뷰 데이터 (대량 데이터 생성 시 비활성화)
export const REVIEWS: MockReview[] = [];

// 문의 데이터 (사용자와 상품 인덱스 기반)
export const INQUIRIES = [
  {
    userIndex: 0,
    productIndex: 0,
    title: '사이즈 문의',
    content: 'M 사이즈가 어떤가요?',
    status: 'WAITING_ANSWER' as const,
    isSecret: false,
  },
  {
    userIndex: 1,
    productIndex: 1,
    title: '배송 문의',
    content: '언제 배송되나요?',
    status: 'COMPLETED_ANSWER' as const,
    isSecret: false,
  },
];

// 문의 답변 데이터 (문의와 사용자 인덱스 기반)
export const INQUIRY_REPLIES = [
  {
    inquiryIndex: 1,
    userIndex: 2, // 판매자
    content: '2-3일 내에 배송됩니다.',
  },
];

// 알림 데이터 (사용자 인덱스 기반)
export const NOTIFICATIONS = [
  {
    userIndex: 0,
    content: '주문이 완료되었습니다.',
    isChecked: false,
  },
  {
    userIndex: 1,
    content: '리뷰 작성이 완료되었습니다.',
    isChecked: true,
  },
];

// 스토어 좋아요 데이터 (사용자와 스토어 인덱스 기반)
export const STORE_LIKES = [
  { userIndex: 0, storeIndex: 0 },
  { userIndex: 1, storeIndex: 1 },
];
