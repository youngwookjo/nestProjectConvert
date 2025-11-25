import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product, Store, Size } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Product API', () => {
  let sellerAccessToken: string = '';
  let sellerId: string = '';
  let store: Store;
  let category: Category;
  let initialProduct: Product;
  let size: Size;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    const grade =
      (await prisma.grade.findFirst({ where: { name: '테스트등급' } })) ??
      (await prisma.grade.create({
        data: { name: '테스트등급', rate: 1, minAmount: 0 },
      }));

    const seller = await prisma.user.upsert({
      where: { email: 'seller-product-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-product-test@test.com',
        password: hashedPassword,
        name: 'test-product-seller',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-product-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    store =
      (await prisma.store.findFirst({ where: { userId: sellerId } })) ??
      (await prisma.store.create({
        data: {
          userId: sellerId,
          name: '테스트 프로덕트 스토어',
          address: '서울특별시 강남구 테스트로 123',
          phoneNumber: '010-1234-5678',
          content: '테스트 스토어입니다.',
        },
      }));

    category = await prisma.category.upsert({
      where: { name: '테스트카테고리' },
      update: {},
      create: { name: '테스트카테고리' },
    });

    // 사이즈 데이터가 없는 경우, 새로운 사이즈를 생성합니다.
    size = await prisma.size.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, en: 'Free', ko: '프리' },
    });

    initialProduct = await prisma.product.create({
      data: {
        name: '초기테스트상품',
        content: '테스트 상품입니다.',
        price: 15000,
        storeId: store.id,
        categoryId: category.id,
        stocks: {
          create: {
            sizeId: size.id,
            quantity: 100,
          },
        },
      },
    });
  });

  afterAll(async () => {
    // 이 테스트에서 생성된 데이터만 정리합니다.
    await prisma.user.deleteMany({ where: { id: sellerId } });
    await prisma.store.deleteMany({ where: { id: store.id } });
    await prisma.category.deleteMany({ where: { name: '테스트카테고리' } });
    // 시드된 사이즈 데이터는 삭제하지 않습니다.
    await prisma.$disconnect();
  });

  describe('POST /api/products - 상품 생성', () => {
    test('성공: 상품을 생성하고 201을 반환해야 합니다.', async () => {
      const productData = {
        name: '새로운 테스트 상품',
        price: '20000',
        content: '새로운 상품입니다.',
        categoryName: category.name,
        stocks: JSON.stringify([{ sizeId: size.id, quantity: 50 }]), // 유효한 size.id 사용
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', productData.name)
        .field('price', productData.price)
        .field('content', productData.content)
        .field('categoryName', productData.categoryName)
        .field('stocks', productData.stocks);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(Number(productData.price));

      // 생성된 상품 정리
      await prisma.product.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /api/products - 상품 목록 조회', () => {
    test('성공: 상품 목록을 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.list)).toBe(true);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/products/:productId - 상품 상세 조회', () => {
    test('성공: 존재하는 상품 ID로 조회하면 200과 상품 정보를 반환해야 합니다.', async () => {
      const response = await request(app).get(`/api/products/${initialProduct.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(initialProduct.id);
      expect(response.body.name).toBe(initialProduct.name);
    });
  });

  describe('PATCH /api/products/:productId - 상품 수정', () => {
    test('성공: 상품 정보를 수정하고 200을 반환해야 합니다.', async () => {
      const updatedData = {
        name: '수정된 상품 이름',
        content: '수정된 상품 설명입니다.',
        stocks: JSON.stringify([{ sizeId: size.id, quantity: 99 }]), // stocks는 수정 시 필수 항목입니다.
      };

      const response = await request(app)
        .patch(`/api/products/${initialProduct.id}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', updatedData.name)
        .field('content', updatedData.content)
        .field('stocks', updatedData.stocks);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.content).toBe(updatedData.content);
      expect(response.body.stocks[0].quantity).toBe(99);
    });
  });

  describe('DELETE /api/products/:productId - 상품 삭제', () => {
    test('성공: 상품을 생성한 뒤 삭제하고 204를 반환해야 합니다.', async () => {
      // 1. API를 호출하여 삭제할 상품을 생성합니다.
      const productToCreate = {
        name: '삭제될 상품',
        price: '9900',
        content: '이 상품은 삭제될 것입니다.',
        categoryName: category.name,
        stocks: JSON.stringify([{ sizeId: size.id, quantity: 10 }]),
      };

      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .field('name', productToCreate.name)
        .field('price', productToCreate.price)
        .field('content', productToCreate.content)
        .field('categoryName', productToCreate.categoryName)
        .field('stocks', productToCreate.stocks);

      const productIdToDelete = createResponse.body.id;

      // 2. 새로 생성된 상품을 삭제합니다.
      const deleteResponse = await request(app)
        .delete(`/api/products/${productIdToDelete}`)
        .set('Authorization', `Bearer ${sellerAccessToken}`);

      expect(deleteResponse.status).toBe(204);

      // 3. 상품이 실제로 삭제되었는지 확인합니다.
      const deletedProduct = await prisma.product.findUnique({
        where: { id: productIdToDelete },
      });
      expect(deletedProduct).toBeNull();
    });
  });
});
