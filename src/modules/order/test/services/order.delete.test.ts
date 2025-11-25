import { afterEach, beforeEach, describe, test, expect, jest } from '@jest/globals';
import orderService from '@modules/order/orderService';
import orderRepository from '@modules/order/orderRepo';
import productRepository from '@modules/product/productRepo';
import userRepository from '@modules/user/userRepo';
import userService from '@modules/user/userService';
import { prisma } from '@shared/prisma';
import { ApiError } from '@errors/ApiError';
import { TEST_USER_ID, TEST_ORDER_ID, createMockOrderForCancel } from '../mock';

// prisma 모듈 모킹
jest.mock('@shared/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

// 트랜잭션 모킹 헬퍼 함수
const mockTransaction = () => {
  (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
    const mockTx = {}; // 트랜잭션 클라이언트 mock
    return await callback(mockTx);
  });
};

describe('deleteOrder 메소드 테스트', () => {
  beforeEach(() => {
    mockTransaction();
  });

  test('성공 - 정상적으로 주문 취소', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId,
      usePoint: 1000,
      items: [
        {
          productId: 'product-1',
          sizeId: 1,
          quantity: 2,
        },
      ],
    });

    // 2. 레포지토리 함수 모킹
    const getOrderByIdMock = jest
      .spyOn(orderRepository, 'getOrderById')
      .mockResolvedValue(mockOrder);

    // 트랜잭션 내 메서드 모킹
    jest.spyOn(productRepository, 'incrementStock').mockResolvedValue({} as any);
    jest.spyOn(userRepository, 'incrementPoints').mockResolvedValue({} as any);
    jest.spyOn(userRepository, 'decrementTotalAmount').mockResolvedValue({} as any);
    jest.spyOn(userService, 'recalculateUserGrade').mockResolvedValue(null);
    const updatePaymentStatusMock = jest
      .spyOn(orderRepository, 'updatePaymentStatus')
      .mockResolvedValue({ count: 1 });

    // 3. 서비스 함수 실행
    const result = await orderService.deleteOrder(userId, orderId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getOrderByIdMock).toHaveBeenCalledWith(orderId);
    expect(updatePaymentStatusMock).toHaveBeenCalledWith(orderId, 'Cancelled', expect.anything());

    // 5. 서비스 메소드가 null을 반환하는지 확인
    expect(result).toBeNull();
  });

  test('성공 - 포인트를 사용하지 않은 주문 취소', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      usePoint: 0, // 포인트를 사용하지 않음
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);
    jest.spyOn(productRepository, 'incrementStock').mockResolvedValue({} as any);
    jest.spyOn(userRepository, 'decrementTotalAmount').mockResolvedValue({} as any);
    jest.spyOn(userService, 'recalculateUserGrade').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'updatePaymentStatus').mockResolvedValue({ count: 1 });

    // incrementPoints는 usePoint가 0이므로 호출되지 않아야 함
    const incrementPointsMock = jest
      .spyOn(userRepository, 'incrementPoints')
      .mockResolvedValue({} as any);

    // 3. 서비스 함수 실행
    const result = await orderService.deleteOrder(userId, orderId);

    // 4. 포인트 환불 없이 취소되었는지 확인
    expect(incrementPointsMock).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  test('실패 - 주문을 찾을 수 없는 경우 (404)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = TEST_USER_ID;
    const orderId = 'non-existent-order-id';

    // 2. 레포지토리 함수 모킹 (주문을 찾을 수 없음)
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(null);

    // 3. 서비스 함수 실행 및 에러 확인
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(ApiError);
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(
      '주문을 찾을 수 없습니다.',
    );
  });

  test('실패 - 본인 주문이 아닌 경우 (403)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = 'user-1';
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId: 'user-2', // 다른 사용자의 주문
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);

    // 3. 서비스 함수 실행 및 에러 확인
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(ApiError);
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(
      '사용자를 찾을 수 없습니다.',
    );
  });

  test('실패 - 결제 정보가 없는 경우 (500)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId,
      payments: [], // 결제 정보가 없음
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);

    // 3. 서비스 함수 실행 및 에러 확인
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(ApiError);
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(
      '결제 정보를 찾을 수 없습니다.',
    );
  });

  test('실패 - 주문 상태가 CompletedPayment가 아닌 경우 (400)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId,
      payments: [
        {
          id: 'payment-1',
          status: 'Cancelled', // 이미 취소된 주문
          price: 20000,
        },
      ],
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);

    // 3. 서비스 함수 실행 및 에러 확인
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(ApiError);
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(
      '결제 완료된 주문만 취소할 수 있습니다.',
    );
  });

  test('실패 - 주문 상태가 Cancelled인 경우 (400)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId,
      payments: [
        {
          id: 'payment-1',
          status: 'Cancelled', // 이미 취소된 주문
          price: 20000,
        },
      ],
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);

    // 3. 서비스 함수 실행 및 에러 확인
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(ApiError);
    await expect(orderService.deleteOrder(userId, orderId)).rejects.toThrow(
      '결제 완료된 주문만 취소할 수 있습니다.',
    );
  });

  test('성공 - 여러 상품이 포함된 주문 취소', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const orderId = TEST_ORDER_ID;

    const mockOrder = createMockOrderForCancel({
      id: orderId,
      userId,
      usePoint: 2000,
      items: [
        {
          productId: 'product-1',
          sizeId: 1,
          quantity: 2,
        },
        {
          productId: 'product-2',
          sizeId: 2,
          quantity: 3,
        },
      ],
    });

    // 2. 레포지토리 함수 모킹
    jest.spyOn(orderRepository, 'getOrderById').mockResolvedValue(mockOrder);
    const incrementStockMock = jest
      .spyOn(productRepository, 'incrementStock')
      .mockResolvedValue({} as any);
    jest.spyOn(userRepository, 'incrementPoints').mockResolvedValue({} as any);
    jest.spyOn(userRepository, 'decrementTotalAmount').mockResolvedValue({} as any);
    jest.spyOn(userService, 'recalculateUserGrade').mockResolvedValue(null);
    jest.spyOn(orderRepository, 'updatePaymentStatus').mockResolvedValue({ count: 1 });

    // 3. 서비스 함수 실행
    const result = await orderService.deleteOrder(userId, orderId);

    // 4. 모든 상품 아이템이 취소 처리되었는지 확인
    expect(incrementStockMock).toHaveBeenCalledTimes(2);
    expect(result).toBeNull();
  });
});
