import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('유효한 이메일 주소가 아닙니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다').max(20, '비밀번호는 최대 20자 이하여야 합니다'),
});

export type LoginDto = z.infer<typeof loginSchema>;
