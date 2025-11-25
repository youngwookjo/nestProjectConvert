import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product, Size, Stock } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Order API', () => {
  let buyerAccessToken: string = '';
  let buyer2AccessToken: string = '';
  let sellerAccessToken: string = '';
  let buyerId: string = '';
  let buyer2Id: string = '';
  let sellerId: string = '';
  let storeId: string = '';
  let grade: Grade;
  let category: Category;
  let product1: Product;
  let product2: Product;
  let size1: Size;
  let size2: Size;
  let stock1: Stock;
  let stock2: Stock;
  let stock3: Stock;
  let orderId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    // Grade 생성
    grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급주문' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급주문', rate: 1, minAmount: 0 },
      }));

    // Buyer 생성 (포인트 포함)
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-order-test@test.com' },
      update: { password: hashedPassword, points: 50000 },
      create: {
        email: 'buyer-order-test@test.com',
        password: hashedPassword,
        name: 'testbuyer-order',
        type: UserType.BUYER,
        gradeId: grade.id,
        points: 50000,
      },
    });
    buyerId = buyer.id;

    // Buyer2 생성 (다른 사용자 주문 취소 테스트용)
    const buyer2 = await prisma.user.upsert({
      where: { email: 'buyer2-order-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'buyer2-order-test@test.com',
        password: hashedPassword,
        name: 'testbuyer2-order',
        type: UserType.BUYER,
        gradeId: grade.id,
        points: 10000,
      },
    });
    buyer2Id = buyer2.id;

    // Seller 생성
    const seller = await prisma.user.upsert({
      where: { email: 'seller-order-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-order-test@test.com',
        password: hashedPassword,
        name: 'testseller-order',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    // 로그인
    const buyerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-order-test@test.com', password: 'password123' });
    buyerAccessToken = buyerLoginResponse.body.accessToken;

    const buyer2LoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer2-order-test@test.com', password: 'password123' });
    buyer2AccessToken = buyer2LoginResponse.body.accessToken;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-order-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    // Store 생성
    const existingStore = await prisma.store.findFirst({ where: { userId: sellerId } });
    if (existingStore) {
      storeId = existingStore.id;
    } else {
      const storeResponse = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', '테스트스토어주문')
        .field('address', '서울특별시 강남구 테스트로 123')
        .field('phoneNumber', '010-9999-8888')
        .field('content', '테스트 스토어입니다.');
      storeId = storeResponse.body.id;
    }

    // Category 생성
    category = await prisma.category.upsert({
      where: { name: '테스트카테고리주문' },
      update: {},
      create: { name: '테스트카테고리주문' },
    });

    // Size 생성
    size1 = await prisma.size.upsert({
      where: { id: 270 },
      update: {},
      create: { id: 270, en: '270', ko: '270' },
    });

    size2 = await prisma.size.upsert({
      where: { id: 280 },
      update: {},
      create: { id: 280, en: '280', ko: '280' },
    });

    // Product 1 생성
    product1 = await prisma.product.create({
      data: {
        name: '테스트상품1주문',
        content: '테스트 상품 1입니다.',
        price: 10000,
        storeId,
        categoryId: category.id,
      },
    });

    // Product 2 생성
    product2 = await prisma.product.create({
      data: {
        name: '테스트상품2주문',
        content: '테스트 상품 2입니다.',
        price: 20000,
        storeId,
        categoryId: category.id,
      },
    });

    // Stock 생성
    stock1 = await prisma.stock.create({
      data: {
        productId: product1.id,
        sizeId: size1.id,
        quantity: 100,
      },
    });

    stock2 = await prisma.stock.create({
      data: {
        productId: product1.id,
        sizeId: size2.id,
        quantity: 50,
      },
    });

    stock3 = await prisma.stock.create({
      data: {
        productId: product2.id,
        sizeId: size1.id,
        quantity: 200,
      },
    });
  });

  afterAll(async () => {
    // 주문 관련 데이터 삭제 (순서 중요: 외래키 제약)
    await prisma.payment.deleteMany({
      where: { order: { userId: { in: [buyerId, buyer2Id] } } },
    });
    await prisma.orderItem.deleteMany({
      where: { order: { userId: { in: [buyerId, buyer2Id] } } },
    });
    await prisma.order.deleteMany({
      where: { userId: { in: [buyerId, buyer2Id] } },
    });
    await prisma.stock.deleteMany({
      where: { id: { in: [stock1.id, stock2.id, stock3.id] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [product1.id, product2.id] } },
    });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.size.deleteMany({ where: { id: { in: [size1.id, size2.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [buyerId, buyer2Id, sellerId] } } });
    await prisma.grade.deleteMany({ where: { id: grade.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/orders - 주문 생성', () => {
    test('성공: 주문을 생성하고 201을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [
            { productId: product1.id, sizeId: size1.id, quantity: 2 },
            { productId: product2.id, sizeId: size1.id, quantity: 1 },
          ],
          usePoint: 0,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(buyerId);
      expect(response.body.name).toBe('테스트주문자');
      expect(response.body.address).toBe('서울특별시 강남구 테스트로 123');
      expect(response.body.phoneNumber).toBe('010-1234-5678');
      expect(response.body.subtotal).toBe(40000); // 10000*2 + 20000*1
      expect(response.body.totalQuantity).toBe(3);
      expect(response.body.usePoint).toBe(0);
      expect(Array.isArray(response.body.orderItems)).toBe(true);
      expect(response.body.orderItems.length).toBe(2);
      expect(response.body.payments).toBeDefined();
      expect(response.body.payments.price).toBe(40000);
      expect(response.body.payments.status).toBe('CompletedPayment');

      orderId = response.body.id;
    });

    test('성공: 포인트를 사용하여 주문을 생성하고 201을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '테스트주문자2',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 456',
          orderItems: [{ productId: product1.id, sizeId: size2.id, quantity: 1 }],
          usePoint: 5000,
        });

      expect(response.status).toBe(201);
      expect(response.body.subtotal).toBe(10000);
      expect(response.body.usePoint).toBe(5000);
      expect(response.body.payments.price).toBe(5000); // 10000 - 5000
    });

    test('실패: 존재하지 않는 상품으로 주문 시 404를 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [{ productId: 'cm0000000000000000000001', sizeId: size1.id, quantity: 1 }],
          usePoint: 0,
        });

      expect(response.status).toBe(404);
    });

    test('실패: 포인트가 부족하면 400을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyer2AccessToken}`)
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [{ productId: product1.id, sizeId: size1.id, quantity: 1 }],
          usePoint: 100000, // 보유 포인트(10000)보다 많음
        });

      expect(response.status).toBe(400);
    });

    test('실패: 사용 포인트가 주문 금액을 초과하면 400을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [{ productId: product1.id, sizeId: size1.id, quantity: 1 }],
          usePoint: 20000, // 주문 금액(10000)보다 많음
        });

      expect(response.status).toBe(400);
    });

    test('실패: 인증 없이 주문 생성 시 401을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [{ productId: product1.id, sizeId: size1.id, quantity: 1 }],
          usePoint: 0,
        });

      expect(response.status).toBe(401);
    });

    test('실패: 주문 아이템이 없으면 400을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 123',
          orderItems: [],
          usePoint: 0,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders - 주문 목록 조회', () => {
    test('성공: 주문 목록을 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThanOrEqual(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBeDefined();
      expect(response.body.meta.totalPages).toBeDefined();
    });

    test('성공: 페이지네이션이 동작해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ page: 1, limit: 1 })
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(1);
    });

    test('성공: 상태 필터링이 동작해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ status: 'CompletedPayment' })
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);

      // 모든 주문의 결제 상태가 CompletedPayment인지 확인
      response.body.data.forEach((order: any) => {
        expect(order.payments.status).toBe('CompletedPayment');
      });
    });

    test('실패: 인증 없이 주문 목록 조회 시 401을 반환해야 합니다.', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/orders/:orderId - 주문 취소', () => {
    let cancelableOrderId: string;

    beforeAll(async () => {
      // 취소할 주문 생성
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          name: '취소테스트주문자',
          phone: '010-1234-5678',
          address: '서울특별시 강남구 테스트로 789',
          orderItems: [{ productId: product1.id, sizeId: size1.id, quantity: 1 }],
          usePoint: 0,
        });

      cancelableOrderId = response.body.id;
    });

    test('성공: 주문을 취소하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .delete(`/api/orders/${cancelableOrderId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    test('실패: 다른 사용자의 주문을 취소하면 403을 반환해야 합니다.', async () => {
      // buyer2가 buyer의 주문을 취소하려고 시도
      const response = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyer2AccessToken}`);

      expect(response.status).toBe(403);
    });

    test('실패: 존재하지 않는 주문을 취소하면 404를 반환해야 합니다.', async () => {
      const invalidOrderId = 'cm0000000000000000000001';
      const response = await request(app)
        .delete(`/api/orders/${invalidOrderId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(404);
    });

    test('실패: 이미 취소된 주문을 다시 취소하면 400을 반환해야 합니다.', async () => {
      const response = await request(app)
        .delete(`/api/orders/${cancelableOrderId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(400);
    });

    test('실패: 인증 없이 주문 취소 시 401을 반환해야 합니다.', async () => {
      const response = await request(app).delete(`/api/orders/${orderId}`);

      expect(response.status).toBe(401);
    });
  });
});
