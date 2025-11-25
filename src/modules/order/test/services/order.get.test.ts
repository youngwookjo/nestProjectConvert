import { afterEach, describe, test, expect, jest } from '@jest/globals';
import orderService from '@modules/order/orderService';
import orderRepository from '@modules/order/orderRepo';
import { GetOrdersQueryDto } from '@modules/order/dto/orderDTO';
import { TEST_USER_ID, createMockOrderInList } from '../mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('getOrderList 메소드 테스트', () => {
  test('성공 - 기본 주문 목록 조회 (페이지 1, limit 3)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const query: GetOrdersQueryDto = {
      limit: 3,
      page: 1,
    };

    const mockOrders = [
      createMockOrderInList(testDate, { id: 'order-1' }),
      createMockOrderInList(testDate, { id: 'order-2' }),
      createMockOrderInList(testDate, { id: 'order-3' }),
    ];

    // 2. 레포지토리 함수 모킹
    const getOrderListMock = jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: mockOrders,
      total: 15,
      page: 1,
      limit: 3,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getOrderListMock).toHaveBeenCalledWith(userId, query);

    // 5. 서비스 메소드가 올바른 결과를 반환하는지 확인
    expect(result.data).toHaveLength(3);
    expect(result.meta.total).toBe(15);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(3);
    expect(result.meta.totalPages).toBe(5); // Math.ceil(15 / 3)
  });

  test('성공 - 페이지 2 조회', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const query: GetOrdersQueryDto = {
      limit: 10,
      page: 2,
    };

    const mockOrders = [
      createMockOrderInList(testDate, { id: 'order-11' }),
      createMockOrderInList(testDate, { id: 'order-12' }),
    ];

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: mockOrders,
      total: 12,
      page: 2,
      limit: 10,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 결과 검증
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(12);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalPages).toBe(2); // Math.ceil(12 / 10)
  });

  test('성공 - 상태 필터링 적용 (CompletedPayment)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const query: GetOrdersQueryDto = {
      status: 'COMPLETED',
      limit: 3,
      page: 1,
    };

    const mockOrders = [
      createMockOrderInList(testDate, {
        id: 'order-1',
        payments: [
          {
            id: 'payment-1',
            orderId: 'order-1',
            price: 20000,
            status: 'COMPLETED',
            createdAt: testDate,
            updatedAt: testDate,
          },
        ],
      }),
      createMockOrderInList(testDate, {
        id: 'order-2',
        payments: [
          {
            id: 'payment-2',
            orderId: 'order-2',
            price: 30000,
            status: 'COMPLETED',
            createdAt: testDate,
            updatedAt: testDate,
          },
        ],
      }),
    ];

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: mockOrders,
      total: 2,
      page: 1,
      limit: 3,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 결과 검증
    expect(result.data).toHaveLength(2);
    expect(result.data[0].payments.status).toBe('COMPLETED');
    expect(result.data[1].payments.status).toBe('COMPLETED');
    expect(result.meta.total).toBe(2);
  });

  test('성공 - 빈 목록 반환 (주문 없음)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;

    const query: GetOrdersQueryDto = {
      limit: 10,
      page: 1,
    };

    // 2. 레포지토리 함수 모킹 (빈 배열 반환)
    jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 결과 검증
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalPages).toBe(0); // Math.ceil(0 / 10)
  });

  test('성공 - 상세 정보가 올바르게 포함되는지 확인', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const query: GetOrdersQueryDto = {
      limit: 1,
      page: 1,
    };

    const mockOrder = createMockOrderInList(testDate, {
      id: 'order-1',
      name: '김철수',
      phoneNumber: '010-9876-5432',
      address: '부산시 해운대구',
      subtotal: 50000,
      totalQuantity: 5,
      usePoint: 1000,
      items: [
        {
          id: 'order-item-1',
          price: 10000,
          quantity: 5,
          productId: 'product-1',
          isReviewed: false,
          product: {
            id: 'product-1',
            storeId: 'store-1',
            name: '테스트 상품',
            price: 10000,
            image: 'https://example.com/product.jpg',
            discountRate: 10,
            discountStartTime: testDate,
            discountEndTime: testDate,
            createdAt: testDate,
            updatedAt: testDate,
            store: {
              id: 'store-1',
              userId: 'user-1',
              name: '테스트 스토어',
              address: '서울시 강남구',
              phoneNumber: '02-1234-5678',
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
                  en: 'L',
                  ko: '대',
                },
              },
            ],
          },
          size: {
            id: 1,
            en: 'L',
            ko: '대',
          },
          reviews: [],
        },
      ],
      payments: [
        {
          id: 'payment-1',
          orderId: 'order-1',
          price: 49000,
          status: 'COMPLETED',
          createdAt: testDate,
          updatedAt: testDate,
        },
      ],
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: [mockOrder],
      total: 1,
      page: 1,
      limit: 1,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 상세 정보 검증
    expect(result.data).toHaveLength(1);

    const order = result.data[0];
    expect(order.id).toBe('order-1');
    expect(order.name).toBe('김철수');
    expect(order.phoneNumber).toBe('010-9876-5432');
    expect(order.address).toBe('부산시 해운대구');
    expect(order.subtotal).toBe(50000);
    expect(order.totalQuantity).toBe(5);
    expect(order.usePoint).toBe(1000);

    // OrderItem 검증
    expect(order.orderItems).toHaveLength(1);
    const orderItem = order.orderItems[0];
    expect(orderItem.id).toBe('order-item-1');
    expect(orderItem.price).toBe(10000);
    expect(orderItem.quantity).toBe(5);
    expect(orderItem.isReviewed).toBe(false);

    // Product 검증
    expect(orderItem.product.id).toBe('product-1');
    expect(orderItem.product.name).toBe('테스트 상품');
    expect(orderItem.product.discountRate).toBe(10);

    // Store 검증
    expect(orderItem.product.store.id).toBe('store-1');
    expect(orderItem.product.store.name).toBe('테스트 스토어');

    // Stock 검증
    expect(orderItem.product.stocks).toHaveLength(1);
    expect(orderItem.product.stocks[0].quantity).toBe(100);

    // Size 검증
    expect(orderItem.size.id).toBe(1);
    expect(orderItem.size.size.en).toBe('L');
    expect(orderItem.size.size.ko).toBe('대');

    // Payment 검증
    expect(order.payments.id).toBe('payment-1');
    expect(order.payments.price).toBe(49000);
    expect(order.payments.status).toBe('COMPLETED');
  });

  test('성공 - 여러 페이지에 걸친 주문 조회', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const query: GetOrdersQueryDto = {
      limit: 5,
      page: 3,
    };

    const mockOrders = [
      createMockOrderInList(testDate, { id: 'order-11' }),
      createMockOrderInList(testDate, { id: 'order-12' }),
      createMockOrderInList(testDate, { id: 'order-13' }),
    ];

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderList').mockResolvedValue({
      orders: mockOrders,
      total: 13,
      page: 3,
      limit: 5,
    });

    // 3. 서비스 함수 실행
    const result = await orderService.getOrderList(userId, query);

    // 4. 결과 검증
    expect(result.data).toHaveLength(3);
    expect(result.meta.total).toBe(13);
    expect(result.meta.page).toBe(3);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.totalPages).toBe(3); // Math.ceil(13 / 5)
  });
});
