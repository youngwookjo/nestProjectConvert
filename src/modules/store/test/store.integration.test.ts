import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Store API', () => {
  let sellerAccessToken: string = '';
  let buyerAccessToken: string = '';
  let storeId: string = '';
  let sellerId: string = '';
  let buyerId: string = '';
  let grade: Grade;
  let category: Category;
  let product: Product;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));

    const seller = await prisma.user.upsert({
      where: { email: 'seller-store-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-store-test@test.com',
        password: hashedPassword,
        name: 'testseller',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-store-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'buyer-store-test@test.com',
        password: hashedPassword,
        name: 'testbuyer',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    buyerId = buyer.id;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-store-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    const buyerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-store-test@test.com', password: 'password123' });
    buyerAccessToken = buyerLoginResponse.body.accessToken;

    const existingStore = await prisma.store.findFirst({ where: { userId: sellerId } });
    if (existingStore) {
      storeId = existingStore.id;
    } else {
      const storeResponse = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', '테스트스토어')
        .field('address', '서울특별시 강남구 테스트로 123')
        .field('phoneNumber', '010-1111-2222')
        .field('content', '테스트 스토어입니다.');
      storeId = storeResponse.body.id;
    }

    category = await prisma.category.upsert({
      where: { name: '테스트카테고리' },
      update: {},
      create: { name: '테스트카테고리' },
    });

    product = await prisma.product.create({
      data: {
        name: '테스트상품',
        content: '테스트 상품입니다.',
        price: 10000,
        storeId,
        categoryId: category.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [sellerId, buyerId] } } });
    await prisma.grade.deleteMany({ where: { id: grade.id } });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/stores - 스토어 생성', () => {
    let newSellerId: string;
    let newSellerToken: string;

    beforeAll(async () => {
      const hashedPassword = await hashPassword('password123');
      const newSeller = await prisma.user.upsert({
        where: { email: 'new-seller@test.com' },
        update: {},
        create: {
          email: 'new-seller@test.com',
          password: hashedPassword,
          name: 'new-seller',
          type: UserType.SELLER,
          gradeId: grade.id,
        },
      });
      newSellerId = newSeller.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'new-seller@test.com', password: 'password123' });
      newSellerToken = loginResponse.body.accessToken;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: newSellerId } });
    });

    test('성공: 스토어를 생성하고 201을 반환해야 합니다.', async () => {
      const storeData = {
        name: '새로운테스트스토어',
        address: '서울특별시 어딘가',
        phoneNumber: '010-4321-4321',
        content: '새로운 스토어입니다.',
      };
      const response = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${newSellerToken}`)
        .field('name', storeData.name)
        .field('address', storeData.address)
        .field('phoneNumber', storeData.phoneNumber)
        .field('content', storeData.content);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(storeData.name);

      await prisma.store.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /api/stores/:storeId - 스토어 조회', () => {
    test('성공: 존재하는 스토어 ID로 조회하면 200과 스토어 정보를 반환해야 합니다.', async () => {
      const response = await request(app).get(`/api/stores/${storeId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(storeId);
    });
  });

  describe('PATCH /api/stores/:storeId - 스토어 수정', () => {
    test('성공: 스토어 정보를 수정하고 200을 반환해야 합니다.', async () => {
      const updatedData = { name: '수정된스토어', content: '수정된 내용입니다.' };
      const response = await request(app)
        .patch(`/api/stores/${storeId}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', updatedData.name)
        .field('content', updatedData.content);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.content).toBe(updatedData.content);
    });
  });

  describe('GET /api/stores/detail/my - 내 스토어 조회', () => {
    test('성공: 내 스토어 정보를 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/stores/detail/my')
        .set('Authorization', `Bearer ${sellerAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(storeId);
    });
  });

  describe('GET /api/stores/detail/my/product - 내 스토어 상품 목록 조회', () => {
    test('성공: 내 스토어의 상품 목록을 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/stores/detail/my/product')
        .set('Authorization', `Bearer ${sellerAccessToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.list)).toBe(true);
      expect(response.body.list.length).toBeGreaterThan(0);
      expect(response.body.list[0].name).toBe('테스트상품');
    });
  });

  describe('POST /api/stores/:storeId/favorite - 스토어 즐겨찾기', () => {
    test('성공: 스토어를 즐겨찾기하고 201을 반환해야 합니다.', async () => {
      await prisma.storeLike.deleteMany({ where: { userId: buyerId } });
      const response = await request(app)
        .post(`/api/stores/${storeId}/favorite`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);
      expect(response.status).toBe(201);
      expect(response.body.type).toBe('register');
    });
  });

  describe('DELETE /api/stores/:storeId/favorite - 스토어 즐겨찾기 취소', () => {
    test('성공: 스토어 즐겨찾기를 취소하고 200을 반환해야 합니다.', async () => {
      await prisma.storeLike.upsert({
        where: { storeId_userId: { userId: buyerId, storeId } },
        update: {},
        create: { userId: buyerId, storeId },
      });
      const response = await request(app)
        .delete(`/api/stores/${storeId}/favorite`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.type).toBe('delete');
    });
  });
});
