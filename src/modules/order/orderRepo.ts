import { Prisma } from '@prisma/client';
import { prisma } from '@shared/prisma';
import {
  CreateOrderData,
  CreateOrderItemData,
  GetOrdersQueryDto,
} from '@modules/order/dto/orderDTO';

// 주문 상세 조회를 위한 select 옵션
const selectOrderWithDetailsDB = {
  id: true,
  userId: true,
  name: true,
  address: true,
  phoneNumber: true,
  subtotal: true,
  totalQuantity: true,
  usePoint: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      orderId: true,
      productId: true,
      sizeId: true,
      price: true,
      quantity: true,
      isReviewed: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      size: {
        select: {
          id: true,
          en: true,
          ko: true,
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      orderId: true,
      price: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 1,
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
};

class OrderRepository {
  /**
   * 순수 데이터 접근 메서드들
   * 트랜잭션 내에서 사용되는 개별 데이터 접근 메서드입니다.
   * 트랜잭션 오케스트레이션은 OrderService에서 담당합니다.
   */

  // 주문 데이터 생성 (트랜잭션 내에서 사용)
  createOrderData = async (orderData: CreateOrderData, tx: Prisma.TransactionClient) => {
    return await tx.order.create({
      data: orderData,
    });
  };

  // 주문 아이템 생성 (트랜잭션 내에서 사용)
  createOrderItems = async (
    orderId: string,
    orderItems: CreateOrderItemData[],
    tx: Prisma.TransactionClient,
  ) => {
    const orderItemsData = orderItems.map((item) => ({
      orderId,
      ...item,
    }));

    return await tx.orderItem.createMany({
      data: orderItemsData,
    });
  };

  // 결제 정보 생성 (트랜잭션 내에서 사용)
  createPayment = async (orderId: string, paymentPrice: number, tx: Prisma.TransactionClient) => {
    return await tx.payment.create({
      data: {
        orderId,
        price: paymentPrice,
        status: 'CompletedPayment',
      },
    });
  };

  // 주문 상세 정보 조회 (트랜잭션 내에서 사용)
  getOrderWithDetails = async (orderId: string, tx: Prisma.TransactionClient) => {
    return await tx.order.findUnique({
      where: { id: orderId },
      select: selectOrderWithDetailsDB,
    });
  };

  // 결제 상태 변경 (트랜잭션 내에서 사용)
  updatePaymentStatus = async (
    orderId: string,
    status: string,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.payment.updateMany({
      where: { orderId },
      data: { status },
    });
  };

  // 주문 상세 조회
  getOrderById = async (orderId: string) => {
    return await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        usePoint: true,
        items: {
          select: {
            productId: true,
            sizeId: true,
            quantity: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            price: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc' as const,
          },
        },
      },
    });
  };

  // 주문 목록 조회 (페이지네이션 포함)
  getOrderList = async (userId: string, query: GetOrdersQueryDto) => {
    const { status, limit, page } = query;

    // where 조건 구성
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(status && {
        payments: {
          some: {
            status,
          },
        },
      }),
    };

    // 전체 개수 조회
    const total = await prisma.order.count({ where });

    // 주문 목록 조회
    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        address: true,
        subtotal: true,
        totalQuantity: true,
        usePoint: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            price: true,
            quantity: true,
            productId: true,
            isReviewed: true,
            product: {
              select: {
                id: true,
                storeId: true,
                name: true,
                price: true,
                image: true,
                discountRate: true,
                discountStartTime: true,
                discountEndTime: true,
                createdAt: true,
                updatedAt: true,
                store: {
                  select: {
                    id: true,
                    userId: true,
                    name: true,
                    address: true,
                    phoneNumber: true,
                    content: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
                stocks: {
                  select: {
                    id: true,
                    productId: true,
                    sizeId: true,
                    quantity: true,
                    size: {
                      select: {
                        id: true,
                        en: true,
                        ko: true,
                      },
                    },
                  },
                },
              },
            },
            size: {
              select: {
                id: true,
                en: true,
                ko: true,
              },
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                content: true,
                createdAt: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            price: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            orderId: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'desc' as const,
          },
        },
      },
      orderBy: {
        createdAt: 'desc' as const,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      total,
      page,
      limit,
    };
  };

  // 주문 상품 존재여부와 유저 id 확인용 메소드 - 조영욱
  getOrderItemById = async (orderItemId: string) => {
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      select: {
        order: {
          select: {
            userId: true,
          },
        },
      },
    });
    return orderItem;
  };

  /**
   * 기간별 완료된 주문 조회 (대시보드용)
   * 스토어의 상품에 대한 완료된 주문을 조회합니다.
   * @param storeId - 스토어 ID
   * @param startDate - 시작 날짜
   * @param endDate - 종료 날짜
   */
  getCompletedOrderListByStoreAndPeriod = async (
    storeId: string,
    startDate: Date,
    endDate: Date,
  ) => {
    return await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        items: {
          some: {
            product: {
              storeId,
            },
          },
        },
        payments: {
          some: {
            status: 'CompletedPayment',
          },
        },
      },
      select: {
        id: true,
        items: {
          where: {
            product: {
              storeId,
            },
          },
          select: {
            price: true,
            quantity: true,
          },
        },
      },
    });
  };

  /**
   * 상품별 판매량 집계 조회 (대시보드용)
   * 스토어의 상품별 판매량을 집계합니다.
   * @param storeId - 스토어 ID
   * @param limit - 조회할 상품 수
   */
  getProductSaleStatListByStore = async (storeId: string, limit: number = 5) => {
    return await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        product: {
          storeId,
        },
        order: {
          payments: {
            some: {
              status: 'CompletedPayment',
            },
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });
  };

  /**
   * 전체 완료된 주문 조회 (대시보드용 - 가격 범위별 매출 계산용)
   * 스토어의 모든 완료된 주문을 조회합니다.
   * @param storeId - 스토어 ID
   */
  getCompletedOrderListByStore = async (storeId: string) => {
    return await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              storeId,
            },
          },
        },
        payments: {
          some: {
            status: 'CompletedPayment',
          },
        },
      },
      select: {
        id: true,
        items: {
          where: {
            product: {
              storeId,
            },
          },
          select: {
            price: true,
            quantity: true,
          },
        },
      },
    });
  };
}

export default new OrderRepository();
