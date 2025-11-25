import { ApiError } from '@errors/ApiError';

/**
 * 조건이 false일 때 ApiError를 던지는 유틸 함수
 *
 * @example
 * assert(order !== null, ApiError.notFound('주문을 찾을 수 없습니다.'));
 * assert(order.userId === userId, ApiError.forbidden('권한이 없습니다.'));
 */
export function assert(condition: unknown, error: ApiError): asserts condition {
  if (!condition) {
    throw error;
  }
}
