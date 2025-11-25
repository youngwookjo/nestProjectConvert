import { afterAll, beforeAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@shared/prisma';
import { UserType, Grade, Category, Product, Store, Inquiry, InquiryReply } from '@prisma/client';
import { hashPassword } from '@modules/auth/utils/passwordUtils';

describe('Inquiry API', () => {
  let buyerAccessToken: string = '';
  let sellerAccessToken: string = '';
  let buyerId: string = '';
  let sellerId: string = '';
  let store: Store;
  let category: Category;
  let product: Product;
  let inquiry: Inquiry;
  let inquiryReply: InquiryReply;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('password123');

    const grade =
      (await prisma.grade.findFirst({ where: { name: 'inquiry-test-grade' } })) ??
      (await prisma.grade.create({
        data: { name: 'inquiry-test-grade', rate: 1, minAmount: 0 },
      }));

    const buyer = await prisma.user.upsert({
      where: { email: 'buyer-inquiry-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'buyer-inquiry-test@test.com',
        password: hashedPassword,
        name: 'inquiry-test-buyer',
        type: UserType.BUYER,
        gradeId: grade.id,
      },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.upsert({
      where: { email: 'seller-inquiry-test@test.com' },
      update: { password: hashedPassword },
      create: {
        email: 'seller-inquiry-test@test.com',
        password: hashedPassword,
        name: 'inquiry-test-seller',
        type: UserType.SELLER,
        gradeId: grade.id,
      },
    });
    sellerId = seller.id;

    const buyerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'buyer-inquiry-test@test.com', password: 'password123' });
    buyerAccessToken = buyerLoginResponse.body.accessToken;

    const sellerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'seller-inquiry-test@test.com', password: 'password123' });
    sellerAccessToken = sellerLoginResponse.body.accessToken;

    store = await prisma.store.create({
      data: {
        userId: sellerId,
        name: 'Inquiry Test Store',
        address: 'Inquiry Test Address',
        phoneNumber: '010-9999-8888',
        content: 'Store for inquiry testing',
      },
    });

    category = await prisma.category.upsert({
      where: { name: 'inquiry-test-category' },
      update: {},
      create: { name: 'inquiry-test-category' },
    });

    product = await prisma.product.create({
      data: {
        name: 'Inquiry Test Product',
        content: 'Product for inquiry testing',
        price: 20000,
        storeId: store.id,
        categoryId: category.id,
      },
    });

    inquiry = await prisma.inquiry.create({
      data: {
        userId: buyerId,
        productId: product.id,
        title: 'Initial Inquiry Title',
        content: 'Initial inquiry content',
      },
    });

    inquiryReply = await prisma.inquiryReply.create({
      data: {
        inquiryId: inquiry.id,
        userId: sellerId,
        content: 'Initial reply content',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId] } } });
    await prisma.store.deleteMany({ where: { id: store.id } });
    await prisma.product.deleteMany({ where: { id: product.id } });
    await prisma.category.deleteMany({ where: { name: 'inquiry-test-category' } });
    await prisma.grade.deleteMany({ where: { name: 'inquiry-test-grade' } });
    await prisma.$disconnect();
  });

  describe('POST /products/:productId/inquiries - 상품 문의 생성', () => {
    test('성공: 구매자가 상품에 대한 문의를 생성하고 201을 반환해야 합니다.', async () => {
      const inquiryData = {
        title: '새로운 문의 제목',
        content: '새로운 문의 내용입니다.',
        isSecret: false,
      };
      const response = await request(app)
        .post(`/api/products/${product.id}/inquiries`)
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(inquiryData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(inquiryData.title);
      await prisma.inquiry.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /products/:productId/inquiries - 상품 문의 목록 조회', () => {
    test('성공: 상품의 문의 목록을 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app).get(`/api/products/${product.id}/inquiries`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.list)).toBe(true);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(1);
      expect(response.body.list.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /inquiries - 내 문의 목록 조회', () => {
    test('성공: 구매자가 자신의 문의 목록을 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${buyerAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.list)).toBe(true);
      expect(response.body.totalCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /inquiries/:inquiryId - 문의 상세 조회', () => {
    test('성공: 문의 작성자가 자신의 문의를 상세 조회하고 200을 반환해야 합니다.', async () => {
      const response = await request(app)
        .get(`/api/inquiries/${inquiry.id}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(inquiry.id);
    });
  });

  describe('PATCH /inquiries/:inquiryId - 문의 수정', () => {
    test('성공: 문의 작성자가 자신의 문의를 수정하고 200을 반환해야 합니다.', async () => {
      const updateData = { title: '수정된 문의 제목' };
      const response = await request(app)
        .patch(`/api/inquiries/${inquiry.id}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`)
        .send(updateData);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });
  });

  describe('DELETE /inquiries/:inquiryId - 문의 삭제', () => {
    test('성공: 문의 작성자가 자신의 문의를 삭제하고 200을 반환해야 합니다.', async () => {
      const tempInquiry = await prisma.inquiry.create({
        data: { userId: buyerId, productId: product.id, title: '삭제될 문의', content: '삭제될 내용' },
      });
      const response = await request(app)
        .delete(`/api/inquiries/${tempInquiry.id}`)
        .set('Authorization', `Bearer ${buyerAccessToken}`);
      expect(response.status).toBe(200);
      const deleted = await prisma.inquiry.findUnique({ where: { id: tempInquiry.id } });
      expect(deleted).toBeNull();
    });
  });

  describe('POST /inquiries/:inquiryId/replies - 문의 답변 생성', () => {
    test('성공: 판매자가 문의에 답변을 생성하고 201을 반환해야 합니다.', async () => {
      const tempInquiry = await prisma.inquiry.create({
        data: { userId: buyerId, productId: product.id, title: '답변달릴 문의', content: '내용' },
      });
      const replyData = { content: '이것은 답변입니다.' };

      const response = await request(app)
        .post(`/api/inquiries/${tempInquiry.id}/replies`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(replyData);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(replyData.content);
      await prisma.inquiry.delete({ where: { id: tempInquiry.id } }); // cascades to reply
    });
  });

  describe('PATCH /inquiries/:replyId/replies - 문의 답변 수정', () => {
    test('성공: 판매자가 자신의 답변을 수정하고 200을 반환해야 합니다.', async () => {
      const updateData = { content: '수정된 답변 내용입니다.' };
      const response = await request(app)
        .patch(`/api/inquiries/${inquiryReply.id}/replies`)
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updateData.content);
    });
  });
});
