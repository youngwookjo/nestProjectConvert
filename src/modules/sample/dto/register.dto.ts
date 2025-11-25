import { z } from 'zod';
import dns from 'dns/promises';

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
  }
);

export const authCreateSchema = z.object({
  email: emailWithMX,
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(20, '이름은 최대 20자 이하여야 합니다')
    .regex(/^[a-zA-Z0-9가-힣]+$/, '이름에 특수문자는 사용할 수 없습니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다').max(20, '비밀번호는 최대 20자 이하여야 합니다'),
  profileImage: z.url('이미지 URL 형식이 올바르지 않습니다.').nullable().optional(),
});

export type RegisterDto = z.infer<typeof authCreateSchema>;

export enum SocialProvider {
  GOOGLE = 'GOOGLE',
  NAVER = 'NAVER',
}

export interface SocialRegisterDto {
  email: string;
  name: string;
  profileImage: string | null;
  socialAccounts: {
    provider: SocialProvider;
    providerUid: string;
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  };
}
