// 대시보드 응답 DTO 정의

// 주문 아이템 (대시보드 통계용)
export interface OrderItemForStats {
  price: number;
  quantity: number;
}

// 주문 (대시보드 통계용)
export interface OrderForStats {
  id: string;
  items: OrderItemForStats[];
}

// 상품 판매 통계 (groupBy 결과)
export interface ProductSaleStat {
  productId: string;
  _sum: {
    quantity: number | null;
  };
}

// 상품 정보 (ID, 이름, 가격)
export interface ProductBasicInfo {
  id: string;
  name: string;
  price: number;
}

// 통계 수치 (현재/이전 기간)
export interface PeriodStatistics {
  totalOrders: number;
  totalSales: number;
}

// 변화율
export interface ChangeRate {
  totalOrders: number;
  totalSales: number;
}

// 기간별 통계 (현재, 이전, 변화율)
export interface PeriodStats {
  current: PeriodStatistics;
  previous: PeriodStatistics;
  changeRate: ChangeRate;
}

// 상품 정보
export interface ProductInfo {
  id: string;
  name: string;
  price: number;
}

// 최다 판매 상품 아이템
export interface TopSalesItem {
  totalOrders: number;
  product: ProductInfo;
}

// 가격 범위별 매출 아이템
export interface PriceRangeItem {
  priceRange: string;
  totalSales: number;
  percentage: number;
}

// 전체 대시보드 응답
export interface DashboardResponseDto {
  today: PeriodStats;
  week: PeriodStats;
  month: PeriodStats;
  year: PeriodStats;
  topSales: TopSalesItem[];
  priceRange: PriceRangeItem[];
}
