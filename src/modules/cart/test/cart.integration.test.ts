import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product, Size, Stock } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Cart API', () => {
  let buyerAccessToken: string = '';
  let sellerAccessToken: string = '';
  let buyerId: string = '';
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
  let cartId: string = '';

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    // Grade 생성
    grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급장바구니' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급장바구니', rate: 1, minAmount: 0 },
      }));

    // Buyer 생성
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-cart-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'buyer-cart-test@test.com',
        password: hashedPassword,
        name: 'testbuyer-cart',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    buyerId = buyer.id;

    // Seller 생성
    const seller = await prisma.user.upsert({
      where: { email: 'seller-cart-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-cart-test@test.com',
        password: hashedPassword,
        name: 'testseller-cart',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    // 로그인
    const buyerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-cart-test@test.com', password: 'password123' });
    buyerAccessToken = buyerLoginResponse.body.accessToken;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-cart-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    // Store 생성
    const existingStore = await prisma.store.findFirst({ where: { userId: sellerId } });
    if (existingStore) {
      storeId = existingStore.id;
    } else {
      const storeResponse = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', '테스트스토어장바구니')
        .field('address', '서울특별시 강남구 테스트로 123')
        .field('phoneNumber', '010-9999-8888')
        .field('content', '테스트 스토어입니다.');
      storeId = storeResponse.body.id;
    }

    // Category 생성
    category = await prisma.category.upsert({
      where: { name: '테스트카테고리장바구니' },
      update: {},
      create: { name: '테스트카테고리장바구니' },
    });

    // Size 생성
    size1 = await prisma.size.upsert({
      where: { id: 250 },
      update: {},
      create: { id: 250, en: '250', ko: '250' },
    });

    size2 = await prisma.size.upsert({
      where: { id: 260 },
      update: {},
      create: { id: 260, en: '260', ko: '260' },
    });

    // Product 1 생성
    product1 = await prisma.product.create({
      data: {
        name: '테스트상품1장바구니',
        content: '테스트 상품 1입니다.',
        price: 10000,
        storeId,
        categoryId: category.id,
      },
    });

    // Product 2 생성
    product2 = await prisma.product.create({
      data: {
        name: '테스트상품2장바구니',
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
    await prisma.stock.deleteMany({
      where: { id: { in: [stock1.id, stock2.id, stock3.id] } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [product1.id, product2.id] } },
    });
    await prisma.category.deleteMany({ where: { id: category.id } });
    await prisma.store.deleteMany({ where: { id: storeId } });
    await prisma.size.deleteMany({ where: { id: { in: [size1.id, size2.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId] } } });
    await prisma.grade.deleteMany({ where: { id: grade.id } });
    await prisma.$disconnect();
  });

  describe('POST /api/cart - 장바구니 생성', () => {
    test('성공: 장바구니를 생성하고 201을 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(201);
      expect(response.body.buyerId).toBe(buyerId);
      expect(response.body.id).toBeDefined();

      cartId = response.body.id;
    });

    test('성공: 이미 생성된 장바구니가 있으면 기존 장바구니를 반환해야 합니다.', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(cartId);
      expect(response.body.buyerId).toBe(buyerId);
    });
  });

  describe('GET /api/cart - 장바구니 조회', () => {
    test('성공: 장바구니를 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(cartId);
      expect(response.body.buyerId).toBe(buyerId);
      expect(Array.isArray(response.body.items)).toBe(true);
    });
  });

  describe('PATCH /api/cart - 장바구니 아이템 추가/수정', () => {
    test('성공: 장바구니에 상품을 추가하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .patch('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          productId: product1.id,
          sizes: [
            { sizeId: size1.id, quantity: 2 },
            { sizeId: size2.id, quantity: 3 },
          ],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const item1 = response.body.find((item: any) => item.sizeId === size1.id);
      const item2 = response.body.find((item: any) => item.sizeId === size2.id);

      expect(item1.quantity).toBe(2);
      expect(item2.quantity).toBe(3);
      expect(item1.productId).toBe(product1.id);
      expect(item2.productId).toBe(product1.id);
    });

    test('성공: 기존 장바구니 아이템의 수량을 수정하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .patch('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          productId: product1.id,
          sizes: [{ sizeId: size1.id, quantity: 5 }],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const updatedItem = response.body.find((item: any) => item.sizeId === size1.id);
      expect(updatedItem.quantity).toBe(5);
    });

    test('성공: 다른 상품을 장바구니에 추가하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .patch('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send({
          productId: product2.id,
          sizes: [{ sizeId: size1.id, quantity: 1 }],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      const newItem = response.body.find((item: any) => item.productId === product2.id);
      expect(newItem).toBeDefined();
      expect(newItem.quantity).toBe(1);
    });
  });

  describe('DELETE /api/cart/items/:cartItemId - 장바구니 아이템 삭제', () => {
    let deleteTargetItemId: string;

    beforeAll(async () => {
      // 삭제할 아이템을 먼저 조회
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      deleteTargetItemId = cartResponse.body.items[0].id;
    });

    test('성공: 장바구니 아이템을 삭제하고 204를 반환해야 합니다.', async () => {
      const response = await request(app)
        .delete(`/api/cart/${deleteTargetItemId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(204);
    });

    test('실패: 존재하지 않는 아이템 ID로 삭제 시 404를 반환해야 합니다.', async () => {
      const invalidItemId = 'cm0000000000000000000001';
      const response = await request(app)
        .delete(`/api/cart/${invalidItemId}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
