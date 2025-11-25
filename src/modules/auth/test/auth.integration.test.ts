import { beforeAll, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { hashPassword } from '@modules/auth/utils/passwordUtils';
import { UserType } from '@prisma/client';

describe('Auth API', () => {
  let accessToken: string = '';
  let refreshToken: string = '';
  let userId: string = '';
  let gradeId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    const grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));
    gradeId = grade.id;

    const user = await prisma.user.upsert({
      where: { email: 'auth-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'auth-test@test.com',
        password: hashedPassword,
        name: 'Auth Test User',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.grade.deleteMany({ where: { id: gradeId } });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login - 로그인', () => {
    test('성공: 올바른 이메일과 비밀번호로 로그인하면 200과 토큰을 반환', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('auth-test@test.com');

      // refreshToken은 쿠키에 저장됨
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const refreshTokenCookie = cookieArray.find((cookie: string) =>
        cookie.startsWith('refreshToken='),
      );
      expect(refreshTokenCookie).toBeDefined();

      accessToken = response.body.accessToken;
      // 쿠키에서 refreshToken 추출
      refreshToken = refreshTokenCookie?.split(';')[0].split('=')[1] || '';
    });
  });

  describe('POST /api/auth/refresh - 토큰 재발급', () => {
    test('성공: 유효한 refreshToken으로 새로운 accessToken을 발급', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();

      accessToken = response.body.accessToken;
    });
  });

  describe('POST /api/auth/logout - 로그아웃', () => {
    test('성공: 로그아웃하면 204를 반환', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);
    });
  });
});
