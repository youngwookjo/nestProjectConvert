import { UploadImageDto, UploadResponseDto } from '@modules/s3/dto/s3DTO';
import { uploadToS3 } from '@modules/s3/utils/s3Utils';

class S3Service {
  uploadImage = async (uploadImageDTO: UploadImageDto): Promise<UploadResponseDto> => {
    const { image } = uploadImageDTO;

    // S3에 파일 업로드
    const { url, key } = await uploadToS3(image);

    return { message: '업로드 성공', url, key };
  };
}

export default new S3Service();
