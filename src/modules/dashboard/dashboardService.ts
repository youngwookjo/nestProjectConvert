import orderRepository from '@modules/order/orderRepo';
import storeRepository from '@modules/store/storeRepo';
import userRepository from '@modules/user/userRepo';
import productRepository from '@modules/product/productRepo';
import {
  DashboardResponseDto,
  PeriodStats,
  PriceRangeItem,
  OrderForStats,
  OrderItemForStats,
  ProductSaleStat,
  ProductBasicInfo,
  TopSalesItem,
} from '@modules/dashboard/dto/dashboardDTO';
import { UserType } from '@prisma/client';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
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

class DashboardService {
  /**
   * 날짜 범위 계산 유틸리티
   * date-fns를 사용하여 기간별 시작/종료 날짜를 계산합니다.
   */
  private getDateRanges() {
    const now = new Date();

    return {
      today: {
        current: { start: startOfDay(now), end: endOfDay(now) },
        previous: { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) },
      },
      week: {
        current: {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        },
        previous: {
          start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
          end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        },
      },
      month: {
        current: { start: startOfMonth(now), end: endOfMonth(now) },
        previous: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
      },
      year: {
        current: { start: startOfYear(now), end: endOfYear(now) },
        previous: { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) },
      },
    };
  }

  /**
   * 변화율 계산
   * @param current - 현재 값
   * @param previous - 이전 값
   * @returns 변화율 (%)
   */
  private calculateChangeRate(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * 주문 통계 계산 (비즈니스 로직)
   * @param orders - 주문 목록
   * @returns 주문 수와 매출액
   */
  private calculateOrderStats(orders: OrderForStats[]) {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => {
      const orderSales = order.items.reduce(
        (itemSum: number, item: OrderItemForStats) => itemSum + item.price * item.quantity,
        0,
      );
      return sum + orderSales;
    }, 0);
    return { totalOrders, totalSales };
  }

  /**
   * 기간별 통계 조회
   * @param storeId - 스토어 ID
   * @param currentStart - 현재 기간 시작
   * @param currentEnd - 현재 기간 종료
   * @param previousStart - 이전 기간 시작
   * @param previousEnd - 이전 기간 종료
   */
  private async getPeriodStats(
    storeId: string,
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
  ): Promise<PeriodStats> {
    // 병렬로 현재 기간과 이전 기간 주문 조회
    const [currentOrders, previousOrders] = await Promise.all([
      orderRepository.getCompletedOrderListByStoreAndPeriod(storeId, currentStart, currentEnd),
      orderRepository.getCompletedOrderListByStoreAndPeriod(storeId, previousStart, previousEnd),
    ]);

    // 통계 계산
    const current = this.calculateOrderStats(currentOrders);
    const previous = this.calculateOrderStats(previousOrders);

    // 변화율 계산
    const changeRate = {
      totalOrders: this.calculateChangeRate(current.totalOrders, previous.totalOrders),
      totalSales: this.calculateChangeRate(current.totalSales, previous.totalSales),
    };

    return { current, previous, changeRate };
  }

  /**
   * 가격 범위 분류
   * @param amount - 금액
   */
  private getPriceRangeLabel(amount: number): string {
    if (amount <= 20000) return '~20,000원';
    if (amount <= 50000) return '~50,000원';
    if (amount <= 100000) return '~100,000원';
    if (amount <= 200000) return '~200,000원';
    return '200,000원~';
  }

  /**
   * 가격 범위별 매출 계산
   * @param storeId - 스토어 ID
   */
  private async calculatePriceRanges(storeId: string): Promise<PriceRangeItem[]> {
    const orders: OrderForStats[] = await orderRepository.getCompletedOrderListByStore(storeId);

    // 가격 범위별 매출 집계
    const rangeMap = new Map<string, number>();
    let totalSales = 0;

    for (const order of orders) {
      const orderTotal = order.items.reduce(
        (sum: number, item: OrderItemForStats) => sum + item.price * item.quantity,
        0,
      );
      totalSales += orderTotal;

      const rangeLabel = this.getPriceRangeLabel(orderTotal);
      rangeMap.set(rangeLabel, (rangeMap.get(rangeLabel) || 0) + orderTotal);
    }

    // 결과 배열 생성 (정해진 순서대로)
    const priceRanges = ['~20,000원', '~50,000원', '~100,000원', '~200,000원', '200,000원~'];
    const result: PriceRangeItem[] = priceRanges.map((range) => {
      const sales = rangeMap.get(range) || 0;
      const percentage = totalSales > 0 ? Math.round((sales / totalSales) * 100 * 10) / 10 : 0;
      return {
        priceRange: range,
        totalSales: sales,
        percentage,
      };
    });

    return result;
  }

  /**
   * 최다 판매 상품 조회 (비즈니스 로직)
   * @param storeId - 스토어 ID
   * @param limit - 조회할 상품 수
   */
  private async getTopSellingProductList(
    storeId: string,
    limit: number = 5,
  ): Promise<TopSalesItem[]> {
    // 1. 판매량 집계 조회
    const salesStats: ProductSaleStat[] = await orderRepository.getProductSaleStatListByStore(
      storeId,
      limit,
    );

    // 2. 상품 정보 조회
    const productIds = salesStats.map((item) => item.productId);
    if (productIds.length === 0) {
      return [];
    }

    const products: ProductBasicInfo[] = await productRepository.getProductListByIds(productIds);

    // 3. 데이터 매핑 및 변환
    const productMap = new Map<string, ProductBasicInfo>(products.map((p) => [p.id, p]));
    return salesStats
      .map((item): TopSalesItem | null => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          totalOrders: item._sum.quantity || 0,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
          },
        };
      })
      .filter((item): item is TopSalesItem => item !== null);
  }

  /**
   * 대시보드 데이터 조회
   * @param sellerId - 판매자(사용자) ID
   */
  getDashboard = async (sellerId: string): Promise<DashboardResponseDto> => {
    // 1. 사용자 타입 검증 (SELLER인지 확인)
    const user = await userRepository.getUserById(sellerId);
    assert(user, ApiError.notFound('사용자를 찾을 수 없습니다.'));
    assert(
      user.type === UserType.SELLER,
      ApiError.forbidden('대시보드는 판매자만 접근할 수 있습니다.'),
    );

    // 2. 스토어 ID 조회
    const storeId = await storeRepository.getStoreIdBySellerId(sellerId);
    assert(storeId, ApiError.notFound('스토어를 찾을 수 없습니다.'));

    // 3. 날짜 범위 계산
    const dateRanges = this.getDateRanges();

    // 4. 병렬 처리로 성능 최적화
    const [today, week, month, year, topSales, priceRange] = await Promise.all([
      this.getPeriodStats(
        storeId,
        dateRanges.today.current.start,
        dateRanges.today.current.end,
        dateRanges.today.previous.start,
        dateRanges.today.previous.end,
      ),
      this.getPeriodStats(
        storeId,
        dateRanges.week.current.start,
        dateRanges.week.current.end,
        dateRanges.week.previous.start,
        dateRanges.week.previous.end,
      ),
      this.getPeriodStats(
        storeId,
        dateRanges.month.current.start,
        dateRanges.month.current.end,
        dateRanges.month.previous.start,
        dateRanges.month.previous.end,
      ),
      this.getPeriodStats(
        storeId,
        dateRanges.year.current.start,
        dateRanges.year.current.end,
        dateRanges.year.previous.start,
        dateRanges.year.previous.end,
      ),
      this.getTopSellingProductList(storeId, 5),
      this.calculatePriceRanges(storeId),
    ]);

    return {
      today,
      week,
      month,
      year,
      topSales,
      priceRange,
    };
  };
}

export default new DashboardService();
