import { ZodError } from 'zod';
import type { NextFunction } from 'express';
import { ApiError } from '@errors/ApiError';

/**
 * 주어진 에러가 ZodError라면 에러 메시지를 포맷팅하여
 * ApiError(400)으로 감싸 Express 에러 핸들러로 전달합니다.
 * 
 * ZodError가 아니라면 원본 에러를 그대로 전달합니다.
 *
 * @param err - try/catch 블록에서 잡힌 에러 객체
 * @param context - 에러 메시지에 포함할 컨텍스트 (예: '상품 등록')
 * @param next - Express의 next 함수
 * 
 * @example
 * const validateAuthLogin: RequestHandler = async (req, res, next) => {
  try {
    const parsedBody = {
      email: req.body.email,
      password: req.body.password,
    };
    await loginSchema.parseAsync(parsedBody);
    next();
  } catch (err) {
    forwardZodError(err, '사용자 로그인', next);
  }
};
 */
export const forwardZodError = (err: unknown, context: string, next: NextFunction): void => {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    // 문자열 메시지는 요약본으로, 세부는 ApiError의 details 필드에 담기
    const summary = details.map((detail) => `${detail.path}: ${detail.message}`).join(', ');
    const message = `${context} 유효성 검사 실패: ${summary}`;

    return next(new ApiError(400, message, { details }));
  }

  // 예상치 못한 에러일 경우도 Error 객체로 변환 보장
  const normalizedError = err instanceof Error ? err : new Error(String(err));

  return next(normalizedError);
};
