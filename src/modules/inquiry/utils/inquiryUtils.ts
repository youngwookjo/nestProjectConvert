import { InquiryStatus } from '@prisma/client';
import { INQUIRY_STATUS } from '@modules/inquiry/dto/inquiryConstant';

type InquiryStatusString = (typeof INQUIRY_STATUS)[number];

/**
 *
 * 외부 prisma 데이터를 사용해서 변환하기에 별도 util 파일 작성
 *
 */

// 문자열 Enum -> prisma Enum
export const toPrismaInquiryStatus = (status: InquiryStatusString): InquiryStatus => {
  if (status === INQUIRY_STATUS[0]) {
    return InquiryStatus.WAITING_ANSWER;
  }
  return InquiryStatus.COMPLETED_ANSWER;
};

// prisma Enum -> 문자열 Enum
export const fromPrismaInquiryStatus = (status: InquiryStatus): InquiryStatusString => {
  if (status === InquiryStatus.WAITING_ANSWER) {
    return INQUIRY_STATUS[0];
  }
  return INQUIRY_STATUS[1];
};
