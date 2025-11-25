import { metadataRepository } from './metadataRepo';
import { GradeResponseDto } from './dto/gradeDTO';

/**
 * Metadata Service
 * 메타데이터 관련 비즈니스 로직
 */
class MetadataService {
  /**
   * 등급 목록 조회
   * @returns 등급 목록 (GradeResponseDto[])
   */
  getGradeList = async (): Promise<GradeResponseDto[]> => {
    const grades = await metadataRepository.getGradeList();

    return grades.map((grade) => ({
      id: `grade_${grade.name.toLowerCase()}`,
      name: grade.name,
      rate: grade.rate,
      minAmount: grade.minAmount,
    }));
  };
}

export const metadataService = new MetadataService();
