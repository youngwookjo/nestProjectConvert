import { beforeAll, afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { hashPassword } from '@modules/auth/utils/passwordUtils';
import { UserType } from '@prisma/client';

describe('Review API', () => {
  let buyerAccessToken: string = '';
  let buyerId: string = '';
  let sellerId: string = '';
  let gradeId: string = '';
  let storeId: string = '';
  let categoryId: string = '';
  let productId: string = '';
  let orderId: string = '';
  let orderItemId: string = '';
  let reviewId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    const grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));
    gradeId = grade.id;

    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-review-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'buyer-review-test@test.com',
        password: hashedPassword,
        name: 'BuyerReview',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.upsert({
      where: { email: 'seller-review-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-review-test@test.com',
        password: hashedPassword,
        name: 'SellerReview',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    // 로그인해서 토큰 받기
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-review-test@test.com', password: 'password123' });
    buyerAccessToken = loginResponse.body.accessToken;

    const store = await prisma.store.create({
      data: {
        name: '테스트리뷰스토어',
        address: '서울특별시',
        phoneNumber: '010-1234-5678',
        content: '테스트 스토어입니다.',
        userId: sellerId,
      },
    });
    storeId = store.id;

    const category = await prisma.category.upsert({
      where: { name: '테스트카테고리' },
      update: {},
      create: { name: '테스트카테고리' },
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: '테스트상품',
        content: '테스트상품 설명',
        price: 10000,
        storeId: storeId,
        categoryId: categoryId,
      },
    });
    productId = product.id;

    // Size 생성
    const size = await prisma.size.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, en: 'M', ko: '중' },
    });

    // 주문 생성 (리뷰 작성을 위해 필요)
    const order = await prisma.order.create({
      data: {
        userId: buyerId,
        name: 'BuyerReview',
        address: '서울특별시',
        phoneNumber: '010-1234-5678',
        subtotal: 10000,
        totalQuantity: 1,
      },
    });
    orderId = order.id;

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: orderId,
        productId: productId,
        sizeId: size.id,
        quantity: 1,
        price: 10000,
      },
    });
    orderItemId = orderItem.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { userId: buyerId } });
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.deleteMany({ where: { id: orderId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { id: categoryId } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.user.deleteMany({
      where: { email: { in: ['buyer-review-test@test.com', 'seller-review-test@test.com'] } },
    });
    await prisma.grade.deleteMany({ where: { id: gradeId } });
    await prisma.$disconnect();
  });

  describe('POST /api/products/:productId/reviews - 리뷰 작성', () => {
    test('성공: 리뷰를 작성하고 201을 반환', async () => {
      const reviewData = {
        orderItemId,
        rating: 5,
        content: '정말 좋은 상품입니다!',
      };

      const response = await request(app)
        .post(`/api/products/${productId}/reviews`)
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('productId');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.rating).toBe(reviewData.rating);
      expect(response.body.content).toBe(reviewData.content);

      //리뷰 아이디 저장
      reviewId = response.body.id;
    });
  });

  describe('GET /api/products/:productId/reviews - 리뷰 목록 조회', () => {
    test('성공: 상품의 리뷰 목록을 조회하고 200을 반환', async () => {
      const response = await request(app).get(`/api/products/${productId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('hasNextPage');
    });
  });

  describe('PATCH /api/reviews/:reviewId - 리뷰 수정', () => {
    test('성공: 리뷰를 수정하고 200을 반환', async () => {
      const updatedData = {
        rating: 4,
        content: '수정된 리뷰입니다.',
      };

      const response = await request(app)
        .patch(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('productId');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.rating).toBe(updatedData.rating);
      expect(response.body.content).toBe(updatedData.content);
    });
  });

  describe('DELETE /api/reviews/:reviewId - 리뷰 삭제', () => {
    test('성공: 리뷰를 삭제하고 204를 반환', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(204);

      // 삭제 확인
      const deletedReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });
      expect(deletedReview).toBeNull();
    });
  });
});
