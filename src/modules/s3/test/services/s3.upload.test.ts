/**
 * S3 이미지 업로드 서비스 유닛 테스트
 */
import { beforeEach, afterEach, describe, test, expect, jest } from '@jest/globals';
import s3Service from '@modules/s3/s3Service';
import { UploadImageDto, UploadResponseDto } from '@modules/s3/dto/s3DTO';

// 환경변수 모킹
jest.mock('@modules/s3/utils/s3Constants', () => ({
  AWS_REGION: 'ap-northeast-2',
  AWS_ACCESS_KEY_ID: 'test-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret',
  AWS_S3_BUCKET_NAME: 'test-bucket',
}));

// AWS SDK 모킹
const mockSend = jest.fn() as jest.MockedFunction<any>;
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn(),
}));

describe('S3Service 단위 테스트', () => {
  // Mock 데이터 변수 선언
  let mockFile: Express.Multer.File;
  let mockUploadToS3Result: { url: string; key: string };

  // 각 테스트 전에 mock 데이터를 설정합니다.
  beforeEach(() => {
    // Mock 파일 데이터
    mockFile = {
      fieldname: 'image',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('mock-image-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    // Mock uploadToS3(utils) 결과 데이터
    mockUploadToS3Result = {
      url: 'https://bucket.s3.region.amazonaws.com/uploads/1703123456789-test-image.jpg',
      key: 'uploads/1703123456789-test-image.jpg',
    };
  });

  // 각 테스트 후에 모든 모의(mock)를 복원합니다.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock 방식: 메소드의 구현을 대체합니다.
  describe('with Mock', () => {
    test('uploadImage 테스트 - mock방식', async () => {
      // 테스트에 사용할 mock데이터를 생성합니다.
      const dto: UploadImageDto = {
        image: mockFile,
      };
      const expectedResult: UploadResponseDto = {
        message: '업로드 성공',
        ...mockUploadToS3Result,
      };

      // jest.spyOn을 사용하여 uploadToS3 메소드를 모의(mock)하고 특정 값을 반환하도록 설정합니다.
      const uploadToS3Mock = jest
        .spyOn(require('@modules/s3/utils/s3Utils'), 'uploadToS3')
        .mockResolvedValue(mockUploadToS3Result);

      // 서비스 함수를 실행합니다.
      const result = await s3Service.uploadImage(dto);

      // 모의(mock)된 메소드가 올바른 인자와 함께 호출되었는지 확인합니다.
      expect(uploadToS3Mock).toHaveBeenCalledWith(mockFile);

      // 서비스 메소드가 모의(mock)된 결과를 반환하는지 확인합니다.
      expect(result).toEqual(expectedResult);
    });
  });

  // Spy 방식: 원본 메소드를 변경하지 않고 호출 여부만 확인합니다.
  describe('with Spy', () => {
    test('uploadImage 테스트 - spy방식', async () => {
      // 테스트에 사용할 mock데이터를 생성합니다.
      const dto: UploadImageDto = {
        image: mockFile,
      };

      // jest.spyOn을 사용하여 uploadToS3 메소드를 감시(spy)합니다. 원본 구현은 그대로 유지.
      const uploadToS3Spy = jest.spyOn(require('@modules/s3/utils/s3Utils'), 'uploadToS3');

      // 서비스 함수 호출
      await s3Service.uploadImage(dto);

      // 감시(spy)된 메소드가 올바른 인자와 함께 호출되었는지 확인합니다.
      expect(uploadToS3Spy).toHaveBeenCalledWith(mockFile);
    });
  });
});
