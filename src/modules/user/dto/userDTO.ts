import { z } from 'zod';
import dns from 'dns/promises';

// 사용자 생성 DTO 및 스키마

const emailWithMX = z.string().refine(
  async (email) => {
    const domain = email.split('@')[1];
    try {
      const records = await dns.resolveMx(domain);
      return records && records.length > 0;
    } catch {
      return false;
    }
  },
  {
    message: '유효한 이메일 주소가 아닙니다.',
  },
);

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9가-힣]+$/, '닉네임에 특수문자는 사용할 수 없습니다.'),
  email: emailWithMX,
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(20, '비밀번호는 최대 20자 이하여야 합니다'),
  type: z.enum(['BUYER', 'SELLER'], '유효하지 않은 사용자 유형입니다.'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type CreatedUserDto = {
  id: string;
  gradeId: string;
  name: string;
  email: string;
  password: string;
  type: 'BUYER' | 'SELLER';
  points: number;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
  grade: {
    name: string;
    id: string;
    rate: number;
    minAmount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  image: string | null;
};

// 응답용 사용자 DTO
export type ResUserDto = Omit<CreatedUserDto, 'password' | 'totalAmount' | 'grade'> & {
  grade: Omit<CreatedUserDto['grade'], 'createdAt' | 'updatedAt'>;
};

// 사용자 정보 업데이트 DTO 및 스키마
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9가-힣]+$/, '닉네임에 특수문자는 사용할 수 없습니다.'),
  newPassword: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(20, '비밀번호는 최대 20자 이하여야 합니다'),
  currentPassword: z
    .string()
    .min(8, '현재 비밀번호는 최소 8자 이상이어야 합니다')
    .max(20, '현재 비밀번호는 최대 20자 이하여야 합니다'),
  image: z.url('유효한 이미지 URL이어야 합니다.').nullable().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema> & {
  userId: string;
};
