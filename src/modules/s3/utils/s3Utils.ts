import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ApiError } from '@errors/ApiError';
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET_NAME,
} from '@modules/s3/utils/s3Constants';

/**
 * S3 클라이언트를 생성합니다. (테스트를 위해 함수레벨로 분리)
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
 * 파일을 S3에 업로드하고 URL을 반환합니다.
 * @param file - 업로드할 파일 (Express.Multer.File)
 * @returns 업로드된 파일의 URL과 키
 */
export const uploadToS3 = async (
  file: Express.Multer.File,
): Promise<{ url: string; key: string }> => {
  try {
    // 고유한 파일명 생성 (timestamp 사용)
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;
    const key = `uploads/${fileName}`;

    // S3에 파일 업로드
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    const s3Client = createS3Client();
    await s3Client.send(command);

    // 업로드된 파일의 URL 생성
    const url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error('S3 업로드 오류:', error);
    throw ApiError.internal(
      `파일 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    );
  }
};
