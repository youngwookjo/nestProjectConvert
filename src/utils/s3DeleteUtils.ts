import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} from '@modules/s3/utils/s3Constants';

/**
 * S3 클라이언트를 생성합니다.
 * @returns S3Client 인스턴스
 */
const createS3Client = () => {
  return new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
};

/**
 * S3 URL에서 객체 키를 추출합니다.
 * @param url - S3 이미지의 전체 URL
 * @returns 추출된 S3 키 (예: "uploads/1234567890-image.jpg")
 *
 * @example
 * const url = "https://bucket-name.s3.ap-northeast-2.amazonaws.com/uploads/1234-image.jpg";
 * const key = extractS3KeyFromUrl(url);
 * // key: "uploads/1234-image.jpg"
 */
export const extractS3KeyFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // pathname은 /uploads/1234-image.jpg 형태이므로 앞의 / 제거
    const key = urlObj.pathname.startsWith('/')
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;
    return key;
  } catch (error) {
    console.error('URL 파싱 오류:', error);
    // URL 파싱 실패 시 마지막 부분을 키로 사용 (fallback)
    const parts = url.split('.amazonaws.com/');
    return parts.length > 1 ? parts[1] : url;
  }
};

/**
 * S3에서 이미지를 삭제합니다.
 * 이미지가 존재하지 않거나 삭제 중 오류가 발생해도 조용히 무시합니다.
 *
 * @param imageUrl - 삭제할 이미지의 전체 S3 URL
 * @returns Promise<void>
 *
 * @example
 * // Product 수정 시 기존 이미지 삭제
 * if (existingProduct.image && dto.image && existingProduct.image !== dto.image) {
 *   await deleteImageFromS3(existingProduct.image);
 * }
 *
 * @example
 * // Store 삭제 시 이미지 삭제
 * if (store.image) {
 *   await deleteImageFromS3(store.image);
 * }
 */
export const deleteImageFromS3 = async (imageUrl: string): Promise<void> => {
  try {
    // URL에서 키 추출
    const key = extractS3KeyFromUrl(imageUrl);

    if (!key) {
      console.warn('S3 키 추출 실패:', imageUrl);
      return;
    }

    // S3에서 삭제
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const s3Client = createS3Client();
    await s3Client.send(command);

    console.log('S3 이미지 삭제 성공:', key);
  } catch (error) {
    // 에러가 발생해도 조용히 무시 (이미 삭제된 이미지 등)
    console.warn('S3 이미지 삭제 중 오류 (무시됨):', error);
  }
};
