//prettier-ignore
export type ErrorType = 'BAD_REQUEST' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT' | 'INTERNAL';

const ERROR_DEFINITIONS: Record<ErrorType, { code: number; defaultMessage: string }> = {
  BAD_REQUEST: { code: 400, defaultMessage: '잘못된 요청입니다.' },
  NOT_FOUND: { code: 404, defaultMessage: '존재하지 않는 리소스입니다.' },
  UNAUTHORIZED: { code: 401, defaultMessage: '로그인이 필요합니다.' },
  FORBIDDEN: { code: 403, defaultMessage: '접근 권한이 없습니다.' },
  CONFLICT: { code: 409, defaultMessage: '이미 존재하는 리소스입니다.' },
  INTERNAL: { code: 500, defaultMessage: '서버 내부 오류입니다.' },
};

export interface ApiErrorDetail {
  path?: string;
  message: string;
  context?: string;
}

export class ApiError extends Error {
  code: number;
  status: number;
  details?: ApiErrorDetail[];

  constructor(
    code: number,
    message: string,
    options?: { status?: number; details?: ApiErrorDetail[] },
  ) {
    super(message);
    this.code = code;
    this.status = options?.status ?? code; // code와 status는 기본 동일
    this.details = options?.details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * @example
   * import { ApiError } from '#errors/api-error';
   *
   * // ------------------------------------------
   * // 1. 정적 메서드 사용 - 표준 HTTP 에러
   * // ------------------------------------------
   * throw ApiError.badRequest('상품명이 비어 있습니다.');
   * throw ApiError.notFound(); // 기본 메시지 사용
   * throw ApiError.unauthorized('로그인이 필요합니다.');
   *
   * // ------------------------------------------
   * // 2️. of() / type() 사용 - 커스텀 에러 타입
   * // ------------------------------------------
   * throw ApiError.of('FORBIDDEN', '해당 리소스를 수정할 권한이 없습니다.');
   * throw ApiError.of('CONFLICT', '이미 사용 중인 이메일입니다.', {
   *   details: [
   *     { path: 'email', message: '중복된 이메일입니다.' },
   *   ],
   * });
   *
   * // ------------------------------------------
   * // 3. try/catch에서 사용 예시
   * // ------------------------------------------
   * try {
   *   const user = await findUser(id);
   *   if (!user) throw ApiError.notFound();
   *
   *   if (!user.canEdit) {
   *     throw ApiError.of('FORBIDDEN', '해당 리소스를 수정할 권한이 없습니다.');
   *   }
   * } catch (err) {
   *   next(err); // Express 전역 에러 핸들러로 전달
   * }
   *
   * //4. new ApiError 직접 생성
   * // ------------------------------------------
   * //details 선택사항
   * throw new ApiError(401, '토큰이 만료되었습니다.', { details: [{ message: '재로그인이 필요합니다.' }] });
   *
   */

  static of(
    type: ErrorType,
    message?: string,
    options?: { status?: number; details?: ApiErrorDetail[] },
  ): ApiError {
    const { code, defaultMessage } = ERROR_DEFINITIONS[type];
    return new ApiError(code, message || defaultMessage, options);
  }

  static badRequest(message?: string): ApiError {
    return ApiError.of('BAD_REQUEST', message);
  }

  static notFound(message?: string): ApiError {
    return ApiError.of('NOT_FOUND', message);
  }

  static unauthorized(message?: string): ApiError {
    return ApiError.of('UNAUTHORIZED', message);
  }

  static forbidden(message?: string): ApiError {
    return ApiError.of('FORBIDDEN', message);
  }

  static conflict(message?: string): ApiError {
    return ApiError.of('CONFLICT', message);
  }

  static internal(message?: string): ApiError {
    return ApiError.of('INTERNAL', message);
  }
}
