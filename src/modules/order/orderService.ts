import { prisma } from '@shared/prisma';
import orderRepository from '@modules/order/orderRepo';
import productRepository from '@modules/product/productRepo';
import userRepository from '@modules/user/userRepo';
import userService from '@modules/user/userService';
import storeRepository from '@modules/store/storeRepo';
import notificationService from '@modules/notification/notificationService';
import cartRepository from '@modules/cart/cartRepo';
import {
  CreateOrderDto,
  CreateOrderResponseDto,
  CreateOrderItemData,
  GetOrdersQueryDto,
  GetOrdersResponseDto,
} from '@modules/order/dto/orderDTO';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';

class OrderService {
  // 주문 생성
  createOrder = async (userId: string, data: CreateOrderDto): Promise<CreateOrderResponseDto> => {
    const { name, phone, address, orderItems, usePoint } = data;

    // 1. 주문 아이템이 비어있는지 확인
    assert(orderItems.length > 0, ApiError.badRequest('주문 아이템이 없습니다.'));

    // 2. 재고 확인 및 가격 계산
    let subtotal = 0;
    let totalQuantity = 0;
    const orderItemsWithPrice: CreateOrderItemData[] = [];

    for (const item of orderItems) {
      // 재고 확인은 트랜잭션 내에서 처리하지만, 가격 정보는 미리 조회
      const priceInfo = await productRepository.getProductPriceInfo(item.productId);
      assert(priceInfo, ApiError.notFound(`상품 ID ${item.productId}를 찾을 수 없습니다.`));

      // 할인 적용 가격 계산
      let finalPrice = priceInfo.price;
      const now = new Date();

      if (
        priceInfo.discountRate > 0 &&
        priceInfo.discountStartTime &&
        priceInfo.discountEndTime &&
        now >= priceInfo.discountStartTime &&
        now <= priceInfo.discountEndTime
      ) {
        finalPrice = Math.floor(priceInfo.price * (1 - priceInfo.discountRate / 100));
      }

      orderItemsWithPrice.push({
        productId: item.productId,
        sizeId: item.sizeId,
        price: finalPrice,
        quantity: item.quantity,
      });

      subtotal += finalPrice * item.quantity;
      totalQuantity += item.quantity;
    }

    // 4. 포인트 사용 검증
    if (usePoint > 0) {
      const userPoints = await userRepository.getUserPoints(userId);
      assert(
        userPoints >= usePoint,
        ApiError.badRequest(
          `사용 가능한 포인트가 부족합니다. (보유: ${userPoints}, 요청: ${usePoint})`,
        ),
      );
      assert(
        usePoint <= subtotal,
        ApiError.badRequest('사용 포인트는 주문 금액을 초과할 수 없습니다.'),
      );
    }

    // 3. 최종 결제 금액 계산
    const paymentPrice = subtotal - usePoint;

    // 4. 주문 데이터 준비
    const orderData = {
      userId,
      name,
      address,
      phoneNumber: phone,
      subtotal,
      totalQuantity,
      usePoint,
    };

    // 5. 주문 생성 (트랜잭션 처리)
    const createdOrder = await prisma.$transaction(
      async (tx) => {
        // 5-1. 재고 검증 (트랜잭션 내에서 검증)
        for (const item of orderItemsWithPrice) {
          const stock = await productRepository.getStockForUpdate(item.productId, item.sizeId, tx);

          // 재고가 존재하지 않는 경우
          assert(
            stock,
            ApiError.notFound(
              `상품 ID ${item.productId}, 사이즈 ID ${item.sizeId}에 대한 재고를 찾을 수 없습니다.`,
            ),
          );

          // 재고가 부족한 경우
          assert(
            stock.quantity >= item.quantity,
            ApiError.badRequest(
              `상품 ID ${item.productId}, 사이즈 ID ${item.sizeId}의 재고가 부족합니다. (요청: ${item.quantity}, 재고: ${stock.quantity})`,
            ),
          );
        }

        // 5-2. 주문 생성
        const order = await orderRepository.createOrderData(orderData, tx);

        // 5-3. 주문 아이템 생성
        await orderRepository.createOrderItems(order.id, orderItemsWithPrice, tx);

        // 5-4. 결제 정보 생성
        await orderRepository.createPayment(order.id, paymentPrice, tx);

        // 5-5. 재고 차감
        for (const item of orderItemsWithPrice) {
          await productRepository.decrementStock(item.productId, item.sizeId, item.quantity, tx);
        }

        // 5-6. 포인트 차감 (usePoint가 0보다 큰 경우)
        if (orderData.usePoint > 0) {
          await userRepository.decrementPoints(orderData.userId, orderData.usePoint, tx);
        }

        // 5-7. 누적 구매액 증가
        await userRepository.incrementTotalAmount(orderData.userId, paymentPrice, tx);

        // 5-8. 등급 재계산
        await userService.recalculateUserGrade(orderData.userId, tx);

        // 5-9. 생성된 주문 상세 정보 조회 및 반환
        return await orderRepository.getOrderWithDetails(order.id, tx);
      },
      {
        timeout: 10000, // 10초 타임아웃
      },
    );

    assert(createdOrder, ApiError.internal('주문 생성에 실패했습니다.'));

    /* 6. 품절 알림 발송 - 주문으로 재고가 0이 된 상품들 확인
    에러 상황 발생 대비해 콘솔 에러로 기록하고 진행
    */
    try {
      for (const item of orderItemsWithPrice) {
        // 각 상품의 해당 사이즈 재고 조회
        const stockInfo = await productRepository.getStockAndSize(item.productId, item.sizeId);

        if (stockInfo && stockInfo.quantity === 0) {
          // 재고가 0이 되면 상품 정보 및 스토어 정보 조회
          const product = await productRepository.getProductById(item.productId);
          if (!product) continue;

          const store = await storeRepository.getStoreById(product.storeId);
          if (!store) continue;

          // 장바구니에 해당 상품을 담은 사용자들 조회
          const cartUserIds = await cartRepository.getUserIdsBySoldOutProduct(
            item.productId,
            item.sizeId,
          );

          // 품절 알림 전송
          await notificationService.notifyOutOfStock({
            sellerId: store.userId,
            storeName: store.name,
            productName: product.name,
            sizeName: stockInfo.size.en,
            cartUserIds,
          });
        }
      }
    } catch (error) {
      console.error('품절 알림 발송 중 오류 발생:', error);
    }

    // 7. 응답 DTO로 변환
    return {
      id: createdOrder.id,
      userId: createdOrder.userId,
      name: createdOrder.name,
      address: createdOrder.address,
      phoneNumber: createdOrder.phoneNumber,
      subtotal: createdOrder.subtotal,
      totalQuantity: createdOrder.totalQuantity,
      usePoint: createdOrder.usePoint,
      createdAt: createdOrder.createdAt,
      updatedAt: createdOrder.updatedAt,
      orderItems: createdOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        sizeId: item.sizeId,
        price: item.price,
        quantity: item.quantity,
        isReviewed: item.isReviewed,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
        },
        size: {
          id: item.size.id,
          size: {
            en: item.size.en,
            ko: item.size.ko,
          },
        },
      })),
      payments: {
        id: createdOrder.payments[0].id,
        orderId: createdOrder.payments[0].orderId,
        price: createdOrder.payments[0].price,
        status: createdOrder.payments[0].status,
        createdAt: createdOrder.payments[0].createdAt,
        updatedAt: createdOrder.payments[0].updatedAt,
      },
    };
  };

  // 주문 취소
  deleteOrder = async (userId: string, orderId: string): Promise<null> => {
    // 1. 주문 조회
    const order = await orderRepository.getOrderById(orderId);

    // 2. 주문 존재 확인
    assert(order, ApiError.notFound('주문을 찾을 수 없습니다.'));

    // 3. 사용자 권한 확인 (본인 주문인지)
    assert(order.userId === userId, ApiError.forbidden('사용자를 찾을 수 없습니다.'));

    // 4. 결제 정보 확인
    assert(
      order.payments && order.payments.length > 0,
      ApiError.internal('결제 정보를 찾을 수 없습니다.'),
    );

    // 5. 주문 상태 확인 (CompletedPayment인지)
    const paymentStatus = order.payments[0].status;
    assert(
      paymentStatus === 'CompletedPayment',
      ApiError.badRequest('결제 완료된 주문만 취소할 수 있습니다.'),
    );

    // 6. 결제 금액 조회
    const paymentPrice = order.payments[0].price;

    // 7. 주문 취소 (트랜잭션 처리)
    await prisma.$transaction(
      async (tx) => {
        // 7-1. 재고 복원
        for (const item of order.items) {
          await productRepository.incrementStock(item.productId, item.sizeId, item.quantity, tx);
        }

        // 7-2. 포인트 환불 (usePoint가 0보다 큰 경우)
        if (order.usePoint > 0) {
          await userRepository.incrementPoints(userId, order.usePoint, tx);
        }

        // 7-3. 누적 구매액 감소
        await userRepository.decrementTotalAmount(userId, paymentPrice, tx);

        // 7-4. 등급 재계산
        await userService.recalculateUserGrade(userId, tx);

        // 7-5. Payment 상태를 'Cancelled'로 변경
        await orderRepository.updatePaymentStatus(orderId, 'Cancelled', tx);
      },
      {
        timeout: 10000, // 10초 타임아웃
      },
    );

    return null;
  };

  // 주문 목록 조회
  getOrderList = async (
    userId: string,
    query: GetOrdersQueryDto,
  ): Promise<GetOrdersResponseDto> => {
    // Repository에서 주문 목록 조회
    const { orders, total, page, limit } = await orderRepository.getOrderList(userId, query);

    // 응답 DTO로 변환
    const data = orders.map((order) => ({
      id: order.id,
      name: order.name,
      phoneNumber: order.phoneNumber,
      address: order.address,
      subtotal: order.subtotal,
      totalQuantity: order.totalQuantity,
      usePoint: order.usePoint,
      createdAt: order.createdAt,
      orderItems: order.items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
        product: {
          id: item.product.id,
          storeId: item.product.storeId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          discountRate: item.product.discountRate,
          discountStartTime: item.product.discountStartTime,
          discountEndTime: item.product.discountEndTime,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
          store: {
            id: item.product.store.id,
            userId: item.product.store.userId,
            name: item.product.store.name,
            address: item.product.store.address,
            phoneNumber: item.product.store.phoneNumber,
            content: item.product.store.content,
            image: item.product.store.image,
            createdAt: item.product.store.createdAt,
            updatedAt: item.product.store.updatedAt,
          },
          stocks: item.product.stocks.map((stock) => ({
            id: stock.id,
            productId: stock.productId,
            sizeId: stock.sizeId,
            quantity: stock.quantity,
            size: {
              id: stock.size.id,
              size: {
                en: stock.size.en,
                ko: stock.size.ko,
              },
            },
          })),
          reviews: item.reviews,
        },
        size: {
          id: item.size.id,
          size: {
            en: item.size.en,
            ko: item.size.ko,
          },
        },
        isReviewed: item.isReviewed,
      })),
      payments: {
        id: order.payments[0].id,
        price: order.payments[0].price,
        status: order.payments[0].status,
        createdAt: order.payments[0].createdAt,
        updatedAt: order.payments[0].updatedAt,
        orderId: order.payments[0].orderId,
      },
    }));

    // 메타 데이터 계산
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  };
}

export default new OrderService();
