import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product, Size, Stock } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Dashboard API', () => {
  let buyerAccessToken: string = '';
  let sellerAccessToken: string = '';
  let sellerNoStoreAccessToken: string = '';
  let buyerId: string = '';
  let sellerId: string = '';
  let sellerNoStoreId: string = '';
  let storeId: string = '';
  let grade: Grade;
  let category: Category;
  let product1: Product;
  let product2: Product;
  let size1: Size;
  let stock1: Stock;
  let stock2: Stock;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    // Grade 생성
    grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급대시보드' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급대시보드', rate: 1, minAmount: 0 },
      }));

    // Buyer 생성
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-dashboard-test@test.com' },
      update: { password: hashedPassword, points: 50000 },
      create: {
        email: 'buyer-dashboard-test@test.com',
        password: hashedPassword,
        name: 'testbuyer-dashboard',
        type: UserType.BUYER,
        gradeId: grade.id,
        points: 50000,
      },
    });
    buyerId = buyer.id;

    // Seller 생성 (스토어 있음)
    const seller = await prisma.user.upsert({
      where: { email: 'seller-dashboard-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-dashboard-test@test.com',
        password: hashedPassword,
        name: 'testseller-dashboard',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    // Seller 생성 (스토어 없음)
    const sellerNoStore = await prisma.user.upsert({
      where: { email: 'seller-nostore-dashboard-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-nostore-dashboard-test@test.com',
        password: hashedPassword,
        name: 'testseller-nostore-dashboard',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerNoStoreId = sellerNoStore.id;

    // 로그인
    const buyerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-dashboard-test@test.com', password: 'password123' });
    buyerAccessToken = buyerLoginResponse.body.accessToken;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-dashboard-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    const sellerNoStoreLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-nostore-dashboard-test@test.com', password: 'password123' });
    sellerNoStoreAccessToken = sellerNoStoreLoginResponse.body.accessToken;

    // Store 생성
    const existingStore = await prisma.store.findFirst({ where: { userId: sellerId } });
    if (existingStore) {
      storeId = existingStore.id;
    } else {
      const storeResponse = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', '테스트스토어대시보드')
        .field('address', '서울특별시 강남구 테스트로 123')
        .field('phoneNumber', '010-9999-8888')
        .field('content', '테스트 스토어입니다.');
      storeId = storeResponse.body.id;
    }

    // Category 생성
    category = await prisma.category.upsert({
      where: { name: '테스트카테고리대시보드' },
      update: {},
      create: { name: '테스트카테고리대시보드' },
    });

    // Size 생성
    size1 = await prisma.size.upsert({
      where: { id: 290 },
      update: {},
      create: { id: 290, en: '290', ko: '290' },
    });

    // Product 1 생성
    product1 = await prisma.product.create({
      data: {
        name: '테스트상품1대시보드',
        content: '테스트 상품 1입니다.',
        price: 15000,
        storeId,
        categoryId: category.id,
      },
    });

    // Product 2 생성
    product2 = await prisma.product.create({
      data: {
        name: '테스트상품2대시보드',
        content: '테스트 상품 2입니다.',
        price: 25000,
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
        productId: product2.id,
        sizeId: size1.id,
        quantity: 100,
      },
    });

    // 주문 생성 (대시보드 통계를 위해)
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerAccessToken}`)
      .send({
        name: '대시보드테스트주문자',
        phone: '010-1234-5678',
        address: '서울특별시 강남구 테스트로 123',
        orderItems: [
          { productId: product1.id, sizeId: size1.id, quantity: 2 },
          { productId: product2.id, sizeId: size1.id, quantity: 1 },
        ],
        usePoint: 0,
      });
  });

  afterAll(async () => {
    // 주문 관련 데이터 삭제 (순서 중요: 외래키 제약)
    await prisma.payment.deleteMany({
      where: { order: { userId: buyerId } },
    });
    await prisma.orderItem.deleteMany({
      where: { order: { userId: buyerId } },
    });
    await prisma.order.deleteMany({
      where: { userId: buyerId },
    });
    await prisma.stock.deleteMany({
      where: { id: { in: [stock1.id, stock2.id] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [product1.id, product2.id] } },
    });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.size.deleteMany({ where: { id: size1.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [buyerId, sellerId, sellerNoStoreId] } },
    });
    await prisma.grade.deleteMany({ where: { id: grade.id } });
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard - 대시보드 조회', () => {
    test('성공: 판매자가 대시보드를 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${sellerAccessToken}`);

      expect(response.status).toBe(200);

      // 기간별 통계 검증
      expect(response.body.today).toBeDefined();
      expect(response.body.week).toBeDefined();
      expect(response.body.month).toBeDefined();
      expect(response.body.year).toBeDefined();

      // 각 기간별 통계 구조 검증
      ['today', 'week', 'month', 'year'].forEach((period) => {
        expect(response.body[period].current).toBeDefined();
        expect(response.body[period].previous).toBeDefined();
        expect(response.body[period].changeRate).toBeDefined();

        expect(typeof response.body[period].current.totalOrders).toBe('number');
        expect(typeof response.body[period].current.totalSales).toBe('number');
        expect(typeof response.body[period].previous.totalOrders).toBe('number');
        expect(typeof response.body[period].previous.totalSales).toBe('number');
        expect(typeof response.body[period].changeRate.totalOrders).toBe('number');
        expect(typeof response.body[period].changeRate.totalSales).toBe('number');
      });

      // 최다 판매 상품 검증
      expect(response.body.topSales).toBeDefined();
      expect(Array.isArray(response.body.topSales)).toBe(true);

      // 가격 범위별 매출 검증
      expect(response.body.priceRange).toBeDefined();
      expect(Array.isArray(response.body.priceRange)).toBe(true);
      expect(response.body.priceRange.length).toBe(5); // 5개의 가격 범위

      // 가격 범위 구조 검증
      response.body.priceRange.forEach((item: any) => {
        expect(item.priceRange).toBeDefined();
        expect(typeof item.totalSales).toBe('number');
        expect(typeof item.percentage).toBe('number');
      });
    });

    test('성공: 오늘 주문이 있으면 today 통계에 반영되어야 합니다.', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${sellerAccessToken}`);

      expect(response.status).toBe(200);

      // 오늘 주문이 있으므로 today.current에 데이터가 있어야 함
      expect(response.body.today.current.totalOrders).toBeGreaterThanOrEqual(1);
      expect(response.body.today.current.totalSales).toBeGreaterThan(0);
    });

    test('성공: 최다 판매 상품에 주문한 상품이 포함되어야 합니다.', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${sellerAccessToken}`);

      expect(response.status).toBe(200);

      // topSales에 상품이 있어야 함
      if (response.body.topSales.length > 0) {
        const topProduct = response.body.topSales[0];
        expect(topProduct.totalOrders).toBeGreaterThan(0);
        expect(topProduct.product).toBeDefined();
        expect(topProduct.product.id).toBeDefined();
        expect(topProduct.product.name).toBeDefined();
        expect(topProduct.product.price).toBeDefined();
      }
    });

    test('실패: 구매자가 대시보드를 조회하면 403을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(403);
    });

    test('실패: 스토어가 없는 판매자가 대시보드를 조회하면 404를 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${sellerNoStoreAccessToken}`);

      expect(response.status).toBe(404);
    });

    test('실패: 인증 없이 대시보드를 조회하면 401을 반환해야 합니다.', async () => {
      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(401);
    });
  });
});
