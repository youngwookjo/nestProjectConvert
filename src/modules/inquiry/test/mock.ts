import { InquiryStatus, UserType } from '@prisma/client';

export const mockGrade = {
  id: 'grade-id-1',
  name: 'Green',
  rate: 5,
  minAmount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUserBuyer = {
  id: 'user-id-buyer-123',
  name: '구매자',
  email: 'buyer@example.com',
  type: UserType.BUYER,
  gradeId: 'grade-id-1',
  password: 'password',
  points: 1000,
  image: null,
  totalAmount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  grade: mockGrade,
};

export const mockUserSeller = {
  id: 'user-id-seller-456',
  name: '판매자',
  email: 'seller@example.com',
  type: UserType.SELLER,
  gradeId: 'grade-id-1',
  password: 'password',
  points: 0,
  image: null,
  totalAmount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  grade: mockGrade,
};

export const mockStore = {
  id: 'store-id-789',
  userId: mockUserSeller.id,
  name: '테스트 스토어',
  address: '테스트 주소',
  detailAddress: '상세 주소',
  phoneNumber: '010-1234-5678',
  content: '스토어 소개',
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockProduct = {
  id: 'product-id-456',
  name: '테스트 상품',
  storeId: mockStore.id,
  categoryId: 'category-id-101',
  content: '상품 내용',
  price: 10000,
  discountRate: 0,
  image: null,
  discountPrice: null,
  discountStartTime: null,
  discountEndTime: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockInquiryList = [
  {
    id: 'inquiry-id-001',
    userId: mockUserBuyer.id,
    productId: mockProduct.id,
    title: '테스트 문의 1',
    content: '문의 내용 1',
    status: InquiryStatus.WAITING_ANSWER,
    isSecret: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: '사용자 1' },
    reply: null,
  },
  {
    id: 'inquiry-id-002',
    userId: 'user-id-456',
    productId: mockProduct.id,
    title: '테스트 문의 2',
    content: '문의 내용 2',
    status: InquiryStatus.COMPLETED_ANSWER,
    isSecret: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: '사용자 2' },
    reply: {
      id: 'reply-id-001',
      inquiryId: 'inquiry-id-002',
      userId: 'store-user-id-789',
      content: '답변 내용',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { name: '스토어 사용자' },
    },
  },
];

export const mockInquiryWithReply = {
  id: 'inquiry-id-with-reply-003',
  userId: mockUserBuyer.id,
  productId: mockProduct.id,
  title: '답변 있는 문의',
  content: '답변이 달린 문의 내용',
  status: InquiryStatus.COMPLETED_ANSWER,
  isSecret: false,
  createdAt: new Date('2023-01-01T10:00:00Z'),
  updatedAt: new Date('2023-01-01T11:00:00Z'),
  reply: {
    id: 'reply-id-002',
    content: '문의에 대한 답변입니다.',
    createdAt: new Date('2023-01-01T10:30:00Z'),
    updatedAt: new Date('2023-01-01T11:00:00Z'),
    user: {
      id: mockUserSeller.id,
      name: mockUserSeller.name,
    },
  },
};

//문의 답변 테스트용 목데이터
export const mockInquiryReply = {
  id: 'reply-id-001',
  inquiryId: 'inquiry-id-001',
  userId: mockUserSeller.id,
  content: '문의 답변 내용',
  createdAt: new Date(),
  updatedAt: new Date(),
};
