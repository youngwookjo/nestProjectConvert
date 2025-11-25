import { beforeAll, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { hashPassword } from '@modules/auth/utils/passwordUtils';
import { UserType } from '@prisma/client';

describe('Notification API', () => {
  let accessToken: string = '';
  let userId: string = '';
  let gradeId: string = '';
  let notificationId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    const grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));
    gradeId = grade.id;

    const user = await prisma.user.upsert({
      where: { email: 'notification-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'notification-test@test.com',
        password: hashedPassword,
        name: 'NotificationTest',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    userId = user.id;

    // 로그인해서 토큰 받기
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notification-test@test.com', password: 'password123' });
    accessToken = loginResponse.body.accessToken;

    // 테스트용 알림 생성
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        content: '테스트 알림입니다.',
        isChecked: false,
      },
    });
    notificationId = notification.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email: 'notification-test@test.com' } });
    await prisma.grade.deleteMany({ where: { id: gradeId } });
    await prisma.$disconnect();
  });

  describe('GET /api/notifications - 알림 목록 조회', () => {
    test('성공: 알림 목록을 조회하고 200을 반환', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('userId');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('isChecked');
    });
  });

  describe('PATCH /api/notifications/:alarmId/check - 알림 읽음 처리', () => {
    test('성공: 알림을 읽음 처리하고 204를 반환', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/check`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(204);

      // 읽음 처리 확인
      const updatedNotification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });
      expect(updatedNotification?.isChecked).toBe(true);
    });
  });
});
