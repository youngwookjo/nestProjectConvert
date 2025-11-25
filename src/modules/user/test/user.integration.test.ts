import { beforeAll, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { hashPassword } from '@modules/auth/utils/passwordUtils';
import { UserType } from '@prisma/client';

describe('User API', () => {
  let accessToken: string = '';
  let userId: string = '';
  let gradeId: string = '';
  let storeId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    // Green 등급 생성 (userRepo에서 필요)
    const greenGrade = await prisma.grade.findFirst({ where: { name: 'Green' } });
    if (!greenGrade) {
      await prisma.grade.create({ data: { name: 'Green', rate: 1, minAmount: 0 } });
    }

    const grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));
    gradeId = grade.id;

    const user = await prisma.user.upsert({
      where: { email: 'user-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'user-test@test.com',
        password: hashedPassword,
        name: 'UserTest',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    userId = user.id;

    // 로그인해서 토큰 받기
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user-test@test.com', password: 'password123' });
    accessToken = loginResponse.body.accessToken;

    // 좋아요 테스트를 위한 스토어 생성
    const seller = await prisma.user.create({
      data: {
        email: 'seller-user-test@test.com',
        password: hashedPassword,
        name: 'SellerTest',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });

    const store = await prisma.store.create({
      data: {
        name: '테스트스토어',
        address: '서울특별시',
        phoneNumber: '010-1234-5678',
        content: '테스트 스토어입니다.',
        userId: seller.id,
      },
    });
    storeId = store.id;
  });

  afterAll(async () => {
    await prisma.storeLike.deleteMany({ where: { userId } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['user-test@test.com', 'seller-user-test@test.com'] } },
    });
    await prisma.grade.deleteMany({ where: { id: gradeId } });
    await prisma.$disconnect();
  });

  describe('POST /api/users - 회원가입', () => {
    test('성공: 새로운 사용자를 생성하고 201을 반환', async () => {
      const newUserData = {
        email: 'test2410@naver.com',
        password: 'password123',
        name: 'NewUser',
        type: UserType.BUYER,
      };

      // 기존 사용자 삭제 (이미 존재할 경우)
      await prisma.user.deleteMany({ where: { email: newUserData.email } });

      const response = await request(app).post('/api/users').send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(newUserData.email);
      expect(response.body.name).toBe(newUserData.name);

      // 생성된 사용자 삭제
      await prisma.user.delete({ where: { email: newUserData.email } });
    });
  });

  describe('GET /api/users/me - 내 정보 조회', () => {
    test('성공: 본인의 정보를 조회하고 200을 반환', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('user-test@test.com');
      expect(response.body.name).toBe('UserTest');
    });
  });

  describe('PATCH /api/users/me - 내 정보 수정', () => {
    test('성공: 사용자 정보를 수정하고 200을 반환', async () => {
      const updatedData = {
        name: 'Updated',
        newPassword: 'newpass123',
        currentPassword: 'password123',
      };

      const response = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);

      // 원래 이름과 비밀번호로 복구
      const hashedPassword = await hashPassword('password123');
      await prisma.user.update({
        where: { id: userId },
        data: { name: 'UserTest', password: hashedPassword },
      });
    });
  });

  describe('GET /api/users/me/likes - 좋아하는 스토어 목록 조회', () => {
    test('성공: 좋아하는 스토어 목록을 조회하고 200을 반환', async () => {
      // 스토어 좋아요 추가
      await prisma.storeLike.create({
        data: { userId, storeId },
      });

      const response = await request(app)
        .get('/api/users/me/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /api/users/delete - 회원탈퇴', () => {
    test('성공: 회원을 탈퇴하고 204를 반환', async () => {
      // 탈퇴용 새 사용자 생성
      const hashedPassword = await hashPassword('password123');
      const deleteUser = await prisma.user.create({
        data: {
          email: 'delete-user@test.com',
          password: hashedPassword,
          name: 'DeleteUser',
          type: UserType.BUYER,
          gradeId: gradeId,
        },
      });

      // 로그인
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'delete-user@test.com', password: 'password123' });
      const deleteAccessToken = loginResponse.body.accessToken;

      // 회원탈퇴
      const response = await request(app)
        .delete('/api/users/delete')
        .set('Authorization', `Bearer ${deleteAccessToken}`);

      expect(response.status).toBe(204);

      // 탈퇴 확인
      const deletedUser = await prisma.user.findUnique({
        where: { id: deleteUser.id },
      });
      expect(deletedUser).toBeNull();
    });
  });
});
