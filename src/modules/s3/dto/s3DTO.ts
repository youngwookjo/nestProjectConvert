/**
 * S3 이미지 업로드 모듈의 타입/인터페이스와 DTO를 정의합니다.
 */

export interface UploadImageDto {
  image: Express.Multer.File;
}

export interface UploadResponseDto {
  message: string;
  url: string;
  key: string;
}
