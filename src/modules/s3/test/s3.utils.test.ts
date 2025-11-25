/**
 * S3 이미지 업로드 utils 유닛 테스트
 */
import { beforeEach, afterEach, describe, test, expect, jest } from '@jest/globals';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { uploadToS3 } from '../utils/s3Utils';
import { ApiError } from '../../../errors/ApiError';

// constants 모킹
jest.mock('../utils/s3Constants', () => ({
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

describe('S3Utils 단위 테스트', () => {
  // Mock 데이터 변수 선언
  let mockFile: Express.Multer.File;

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

    // Mock send 메소드 초기화
    mockSend.mockResolvedValue({});
  });

  // 각 테스트 후에 모든 모의(mock)를 복원합니다.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uploadToS3', () => {
    test('성공적으로 파일을 S3에 업로드해야 함', async () => {
      const result = await uploadToS3(mockFile);

      // PutObjectCommand가 올바른 파라미터로 호출되었는지 확인
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: expect.stringContaining('uploads/'),
        Body: mockFile.buffer,
        ContentType: mockFile.mimetype,
      });

      // S3Client send가 호출되었는지 확인
      expect(mockSend).toHaveBeenCalledTimes(1);

      // 반환값 검증
      expect(result).toEqual({
        url: expect.stringMatching('https://test-bucket.s3.ap-northeast-2.amazonaws.com/uploads/'),
        key: expect.stringContaining('uploads/'),
      });
    });

    test('파일명이 timestamp와 함께 생성되어야 함', async () => {
      // 특별한 파일명으로 Mock 데이터 수정
      mockFile.originalname = 'profile.jpg';

      const result = await uploadToS3(mockFile);

      // 파일명이 timestamp-원본파일명 형식인지 확인
      expect(result.key).toMatch(/^uploads\/\d+-profile\.jpg$/);
      expect(result.url).toContain('uploads/');
      expect(result.url).toContain('-profile.jpg');
    });

    test('S3 업로드 실패 시 ApiError를 던져야 함', async () => {
      // Mock S3Client send 메소드가 일반 Error를 던지도록 설정
      mockSend.mockRejectedValue(new Error('S3 업로드 실패'));

      // ApiError가 던져지는지 확인 (실제 코드에서 Error를 ApiError로 변환)
      await expect(uploadToS3(mockFile)).rejects.toThrow(ApiError);
      await expect(uploadToS3(mockFile)).rejects.toThrow(
        '파일 업로드에 실패했습니다: S3 업로드 실패',
      );
    });

    test('다양한 이미지 형식에 대해 올바른 ContentType을 설정해야 함', async () => {
      const testCases = [
        { mimetype: 'image/png', expectedContentType: 'image/png' },
        { mimetype: 'image/gif', expectedContentType: 'image/gif' },
        { mimetype: 'image/webp', expectedContentType: 'image/webp' },
      ];

      for (const testCase of testCases) {
        // Mock 파일 데이터 수정
        mockFile.mimetype = testCase.mimetype;
        mockFile.originalname = `test.${testCase.mimetype.split('/')[1]}`;

        await uploadToS3(mockFile);

        // PutObjectCommand가 올바른 ContentType으로 호출되었는지 확인
        expect(PutObjectCommand).toHaveBeenCalledWith(
          expect.objectContaining({
            ContentType: testCase.expectedContentType,
          }),
        );

        // Mock 데이터 수정 코드가 있으므로 Mock을 초기화하여 다음 테스트에 영향 없도록 함
        jest.clearAllMocks();
      }
    });
  });
});
