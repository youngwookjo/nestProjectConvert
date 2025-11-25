import multer from 'multer';
import { RequestHandler } from 'express';
import s3Service from '@modules/s3/s3Service';
import { ApiError } from '@errors/ApiError';

// Multer 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(ApiError.badRequest('이미지 파일만 업로드할 수 있습니다.'));
    }
  },
});

// S3 업로드 미들웨어
const uploadToS3Middleware: RequestHandler = async (req, _res, next) => {
  try {
    if (req.file) {
      // S3에 업로드
      const result = await s3Service.uploadImage({ image: req.file });

      // req.body.image에 S3 URL 추가
      req.body.image = result.url;
    }
    next();
  } catch (error) {
    next(ApiError.internal('이미지 업로드에 실패했습니다.'));
  }
};

// 단일 이미지 업로드 미들웨어 체인
export const uploadSingleImage = [upload.single('image'), uploadToS3Middleware];
