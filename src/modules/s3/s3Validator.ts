import type { RequestHandler } from 'express';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';

const validateImageUpload: RequestHandler = async (req, res, next) => {
  try {
    // multer로 업로드된 파일이 없으면 에러
    assert(req.file, ApiError.badRequest('이미지 파일이 필요합니다.'));

    const file = req.file;

    // 파일 유효성 검증
    assert(
      isValidImageType(file.mimetype),
      ApiError.badRequest('지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 허용)'),
    );

    assert(isValidFileSize(file.size), ApiError.badRequest('파일 크기가 너무 큽니다. (최대 5MB)'));

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * 파일 확장자 검증
 * @param mimetype - 파일의 MIME 타입
 * @returns 유효한 이미지 파일인지 여부 (true/false)
 */
const isValidImageType = (mimetype: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimetype);
};

/**
 * 파일 크기 검증 (5MB 제한)
 * @param size - 파일 크기 (bytes)
 * @returns 유효한 파일 크기인지 여부 (true/false)
 */
const isValidFileSize = (size: number): boolean => {
  const maxSize = 5 * 1024 * 1024;
  return size <= maxSize;
};

export default {
  validateImageUpload,
};
