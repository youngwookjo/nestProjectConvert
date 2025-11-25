import { prisma } from '../src/shared/prisma';
import {
  GRADES,
  USERS,
  STORES,
  CATEGORIES,
  SIZES,
  PRODUCTS,
  STOCKS,
  CART_ITEMS,
  ORDERS,
  ORDER_ITEMS,
  PAYMENTS,
  REVIEWS,
  INQUIRIES,
  INQUIRY_REPLIES,
  NOTIFICATIONS,
  STORE_LIKES,
  MockUser,
} from './mock';
import { hashPassword } from '../src/modules/auth/utils/passwordUtils';

const seed = async () => {
  console.log('🌱 시드 데이터 삽입 시작...');

  // 기존 데이터 삭제 (외래키 제약조건 순서 고려)
  console.log('🗑️ 기존 데이터 삭제 중...');
  await prisma.notification.deleteMany();
  await prisma.inquiryReply.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeLike.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.grade.deleteMany();
  console.log('✅ 기존 데이터 삭제 완료');

  // 등급 데이터 삽입
  console.log('📊 등급 데이터 삽입 중...');
  await prisma.grade.createMany({
    data: GRADES,
    skipDuplicates: true,
  });
  console.log('✅ 등급 데이터 삽입 완료');

  // 등급 데이터 조회
  const grades = await prisma.grade.findMany();
  console.log('📊 등급 데이터 조회 완료');

  // 사용자 데이터 삽입 (비밀번호 해시 및 등급 할당)
  console.log('👥 사용자 데이터 삽입 중...');
  const hashedUsers = await Promise.all(
    USERS.map(async (user: MockUser) => {
      // 사용자 totalAmount에 따라 등급 결정
      let gradeName = 'Green';
      if (user.totalAmount >= 1000000) gradeName = 'VIP';
      else if (user.totalAmount >= 500000) gradeName = 'Black';
      else if (user.totalAmount >= 300000) gradeName = 'Red';
      else if (user.totalAmount >= 100000) gradeName = 'Orange';

      const grade = grades.find((g) => g.name === gradeName);
      if (!grade) {
        throw new Error(`등급을 찾을 수 없습니다: ${gradeName}`);
      }

      return {
        ...user,
        password: await hashPassword(user.password),
        gradeId: grade.id,
      };
    }),
  );

  await prisma.user.createMany({
    data: hashedUsers,
    skipDuplicates: true,
  });
  console.log('✅ 사용자 데이터 삽입 완료');

  // 사용자 데이터 조회
  const users = await prisma.user.findMany();
  console.log('👥 사용자 데이터 조회 완료');

  // 스토어 데이터 삽입
  console.log('🏪 스토어 데이터 삽입 중...');
  await prisma.store.createMany({
    data: STORES.map((store, index) => ({
      ...store,
      userId: users[index + 52].id, // 판매자들 (53번째, 54번째 사용자)
    })),
    skipDuplicates: true,
  });
  console.log('✅ 스토어 데이터 삽입 완료');

  // 스토어 데이터 조회
  const stores = await prisma.store.findMany();
  console.log('🏪 스토어 데이터 조회 완료');

  // 카테고리 데이터 삽입
  console.log('📂 카테고리 데이터 삽입 중...');
  await prisma.category.createMany({
    data: CATEGORIES,
    skipDuplicates: true,
  });
  console.log('✅ 카테고리 데이터 삽입 완료');

  // 카테고리 데이터 조회
  const categories = await prisma.category.findMany();
  console.log('📂 카테고리 데이터 조회 완료');

  // 사이즈 데이터 삽입
  console.log('📏 사이즈 데이터 삽입 중...');
  await prisma.size.createMany({
    data: SIZES.map((size, index) => ({
      id: index + 1,
      en: size.en,
      ko: size.ko,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 사이즈 데이터 삽입 완료');

  // 사이즈 데이터 조회
  const sizes = await prisma.size.findMany();
  console.log('📏 사이즈 데이터 조회 완료');

  // 상품 데이터 삽입
  console.log('🛍️ 상품 데이터 삽입 중...');
  await prisma.product.createMany({
    data: PRODUCTS.map((product, index) => ({
      ...product,
      storeId: stores[Math.floor(index / 2)].id, // 2개씩 스토어에 배분
      categoryId: categories[index % categories.length].id,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 상품 데이터 삽입 완료');

  // 상품 데이터 조회
  const products = await prisma.product.findMany();
  console.log('🛍️ 상품 데이터 조회 완료');

  // 재고 데이터 삽입
  console.log('📦 재고 데이터 삽입 중...');
  await prisma.stock.createMany({
    data: STOCKS.map((stock) => ({
      productId: products[stock.productIndex].id,
      sizeId: sizes[stock.sizeIndex].id,
      quantity: stock.quantity,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 재고 데이터 삽입 완료');

  // 장바구니 데이터 삽입
  console.log('🛒 장바구니 데이터 삽입 중...');
  await prisma.cart.createMany({
    data: users.slice(0, 2).map((user) => ({ userId: user.id })), // 구매자들만
    skipDuplicates: true,
  });
  console.log('✅ 장바구니 데이터 삽입 완료');

  // 장바구니 데이터 조회
  const carts = await prisma.cart.findMany();
  console.log('🛒 장바구니 데이터 조회 완료');

  // 장바구니 아이템 데이터 삽입
  console.log('🛒 장바구니 아이템 데이터 삽입 중...');
  await prisma.cartItem.createMany({
    data: CART_ITEMS.map((item) => ({
      cartId: carts[item.userIndex].id,
      productId: products[item.productIndex].id,
      sizeId: sizes[item.sizeIndex].id,
      quantity: item.quantity,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 장바구니 아이템 데이터 삽입 완료');

  // 주문 데이터 삽입
  console.log('📋 주문 데이터 삽입 중...');
  await prisma.order.createMany({
    data: ORDERS.map((order) => ({
      userId: users[order.userIndex].id,
      name: order.name,
      address: order.address,
      phoneNumber: order.phoneNumber,
      subtotal: order.subtotal,
      totalQuantity: order.totalQuantity,
      usePoint: order.usePoint,
      createdAt: order.createdAt, // 날짜 분산 적용
    })),
    skipDuplicates: true,
  });
  console.log('✅ 주문 데이터 삽입 완료');

  // 주문 데이터 조회
  const orders = await prisma.order.findMany();
  console.log('📋 주문 데이터 조회 완료');

  // 주문 아이템 데이터 삽입
  console.log('📋 주문 아이템 데이터 삽입 중...');
  await prisma.orderItem.createMany({
    data: ORDER_ITEMS.map((item) => ({
      orderId: orders[item.orderIndex].id,
      productId: products[item.productIndex].id,
      sizeId: sizes[item.sizeIndex].id,
      price: item.price,
      quantity: item.quantity,
      isReviewed: item.isReviewed,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 주문 아이템 데이터 삽입 완료');

  // 주문 아이템 데이터 조회
  const orderItems = await prisma.orderItem.findMany();
  console.log('📋 주문 아이템 데이터 조회 완료');

  // 결제 데이터 삽입
  console.log('💳 결제 데이터 삽입 중...');
  await prisma.payment.createMany({
    data: PAYMENTS.map((payment) => ({
      orderId: orders[payment.orderIndex].id,
      price: payment.price,
      status: payment.status,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 결제 데이터 삽입 완료');

  // 리뷰 데이터 삽입
  console.log('⭐ 리뷰 데이터 삽입 중...');
  await prisma.review.createMany({
    data: REVIEWS.map((review) => ({
      userId: users[review.userIndex].id,
      productId: products[review.productIndex].id,
      orderItemId: orderItems[review.orderItemIndex].id,
      content: review.content,
      rating: review.rating,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 리뷰 데이터 삽입 완료');

  // 문의 데이터 삽입
  console.log('❓ 문의 데이터 삽입 중...');
  await prisma.inquiry.createMany({
    data: INQUIRIES.map((inquiry) => ({
      userId: users[inquiry.userIndex].id,
      productId: products[inquiry.productIndex].id,
      title: inquiry.title,
      content: inquiry.content,
      status: inquiry.status,
      isSecret: inquiry.isSecret,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 문의 데이터 삽입 완료');

  // 문의 데이터 조회
  const inquiries = await prisma.inquiry.findMany();
  console.log('❓ 문의 데이터 조회 완료');

  // 문의 답변 데이터 삽입
  console.log('❓ 문의 답변 데이터 삽입 중...');
  await prisma.inquiryReply.createMany({
    data: INQUIRY_REPLIES.map((reply) => ({
      inquiryId: inquiries[reply.inquiryIndex].id,
      userId: users[reply.userIndex].id,
      content: reply.content,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 문의 답변 데이터 삽입 완료');

  // 알림 데이터 삽입
  console.log('🔔 알림 데이터 삽입 중...');
  await prisma.notification.createMany({
    data: NOTIFICATIONS.map((notification) => ({
      userId: users[notification.userIndex].id,
      content: notification.content,
      isChecked: notification.isChecked,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 알림 데이터 삽입 완료');

  // 스토어 좋아요 데이터 삽입
  console.log('❤️ 스토어 좋아요 데이터 삽입 중...');
  await prisma.storeLike.createMany({
    data: STORE_LIKES.map((like) => ({
      storeId: stores[like.storeIndex].id,
      userId: users[like.userIndex].id,
    })),
    skipDuplicates: true,
  });
  console.log('✅ 스토어 좋아요 데이터 삽입 완료');

  console.log('🎉 모든 시드 데이터 삽입 완료!');
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

export default seed;
