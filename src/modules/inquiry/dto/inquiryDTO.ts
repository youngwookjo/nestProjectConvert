import { InquiryStatus } from '@prisma/client';
import { INQUIRY_STATUS } from './inquiryConstant';
import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1, '제목은 1자 이상이여야 합니다'),
  content: z.string().min(1, '내용은 1자 이상이여야 합니다'),
  isSecret: z.boolean().default(false),
});

export const updateInquirySchema = createInquirySchema.partial();

export const getMyInquiryListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  status: z.enum(INQUIRY_STATUS).optional(),
});

export const inquiryIdSchema = z.object({
  id: z.cuid('문의 ID가 올바르지 않습니다.'),
});

export type CreateInquiryDTO = z.infer<typeof createInquirySchema>;
export type UpdateInquiryDTO = z.infer<typeof updateInquirySchema>;
export type GetMyInquiryListDTO = z.infer<typeof getMyInquiryListSchema>;

export interface GetMyInquiryListRepoDTO extends Omit<GetMyInquiryListDTO, 'status'> {
  status: InquiryStatus | undefined;
}

export type InquiryStringStatus = (typeof INQUIRY_STATUS)[number];

export interface GetMyInquiryItemDTO {
  id: string;
  title: string;
  isSecret: boolean;
  status: InquiryStringStatus;
  createdAt: Date;
  content: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    store: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    name: string;
  };
}

export interface GetMyInquiryListResponseDTO {
  list: GetMyInquiryItemDTO[];
  totalCount: number;
}

export interface InquiryResponseDTO {
  id: string;
  userId: string;
  productId: string;
  title: string;
  content: string;
  isSecret: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: InquiryStringStatus;
}

export interface GetInquiryResponseDTO extends InquiryResponseDTO {
  reply: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      name: string;
    };
  } | null;
}

export const InquiryReplySchema = z.object({
  content: z.string().min(1, '내용은 1자 이상이여야 합니다'),
});

export type InquiryReplyDTO = z.infer<typeof InquiryReplySchema>;

export interface InquiryReplyResponseDTO {
  id: string;
  inquiryId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const replyIdSchema = z.object({
  id: z.cuid('답변 ID가 올바르지 않습니다.'),
});
