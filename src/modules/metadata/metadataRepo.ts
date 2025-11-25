import { Prisma } from '@prisma/client';
import { prisma } from '@shared/prisma';

/**
 * Metadata Repository
 * 메타데이터 관련 데이터베이스 접근 레이어
 */
class MetadataRepository {
  /**
   * 모든 등급 정보 조회
   * @returns Grade 목록 (minAmount 오름차순)
   */
  getGradeList = async () => {
    return await prisma.grade.findMany({
      orderBy: {
        minAmount: 'asc',
      },
    });
  };

  /**
   * 등급 목록 조회 (트랜잭션 내에서 사용)
   * 작성자: 박재성 (Order API 담당)
   * @returns Grade 목록 (minAmount 내림차순)
   */
  getGradeListSortedByMinAmountDesc = async (tx: Prisma.TransactionClient) => {
    return await tx.grade.findMany({
      orderBy: { minAmount: 'desc' },
    });
  };
}

export const metadataRepository = new MetadataRepository();
