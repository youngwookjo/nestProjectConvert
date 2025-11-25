import { Request, Response } from 'express';
import s3Service from '@modules/s3/s3Service';
import { UploadImageDto } from '@modules/s3/dto/s3DTO';

class S3Controller {
  /**
   * 이미지를 S3에 업로드합니다.
   *
   * multipart/form-data로 전송된 이미지 파일을 받아 S3에 업로드합니다.
   * 파일 유효성 검증을 통과한 후 업로드가 진행됩니다.
   * 업로드 실패 시 에러를 발생시킵니다.
   *
   * @param req - 요청 객체 (multipart/form-data의 image 파일 포함)
   * @param res - 응답 객체
   *
   * @returns 업로드된 이미지의 URL과 키 정보 (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 파일 형식 또는 크기
   * @throws {ApiError} 500 - S3 업로드 실패
   */
  uploadImage = async (req: Request, res: Response) => {
    const uploadImageDTO: UploadImageDto = {
      image: req.file!,
    };

    const result = await s3Service.uploadImage(uploadImageDTO);
    res.status(200).json(result);
  };
}

export default new S3Controller();
