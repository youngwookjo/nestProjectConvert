import { CreateReviewDto } from '@modules/review/dto/reviewDTO';
import { UserType } from '@prisma/client';

// 공통 상수
export const MOCK_CONSTANTS = {
  REVIEW_ID: 'review123',
  REVIEW_ID_2: 'review456',
  USER_ID: 'user123',
  PRODUCT_ID: 'product123',
  ORDER_ITEM_ID: 'orderItem123',
  RATING: 5,
  CONTENT: '정말 좋은 상품이에요! 추천합니다.',
  UPDATED_RATING: 4,
  UPDATED_CONTENT: '생각보다 괜찮은 상품이에요. 추천합니다. 업데이트된 리뷰입니다.',
  MOCK_DATE: new Date('2024-01-01'),
  MOCK_DATE_2: new Date('2024-01-02'),
  GRADE_ID: 'grade123',
  OTHER_USER_ID: 'otherUser123',
  PAGE: 1,
  LIMIT: 5,
} as const;

// 미리 정의된 mock 데이터들
export const MOCK_DATA = {
  // 리뷰 생성 DTO
  createReviewDto: {
    userId: MOCK_CONSTANTS.USER_ID,
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
    rating: MOCK_CONSTANTS.RATING,
    content: MOCK_CONSTANTS.CONTENT,
  } as CreateReviewDto,

  // 생성된 리뷰 (응답)
  createdReview: {
    id: MOCK_CONSTANTS.REVIEW_ID,
    userId: MOCK_CONSTANTS.USER_ID,
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    rating: MOCK_CONSTANTS.RATING,
    content: MOCK_CONSTANTS.CONTENT,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
    user: {
      name: '테스트유저',
    },
  },

  // 사용자 데이터
  existingUser: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: '테스트유저',
    email: 'test@example.com',
    password: 'hashedPassword',
    points: 0,
    totalAmount: 0,
    type: UserType.BUYER,
    image: null,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    grade: {
      id: MOCK_CONSTANTS.GRADE_ID,
      name: 'Green',
      rate: 1,
      minAmount: 0,
      createdAt: MOCK_CONSTANTS.MOCK_DATE,
      updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    },
  },

  // 업데이트용 DTO
  updateReviewDto: {
    userId: MOCK_CONSTANTS.USER_ID,
    reviewId: MOCK_CONSTANTS.REVIEW_ID,
    rating: MOCK_CONSTANTS.UPDATED_RATING,
    content: MOCK_CONSTANTS.UPDATED_CONTENT,
  },

  // 업데이트된 리뷰
  updatedReview: {
    id: MOCK_CONSTANTS.REVIEW_ID,
    userId: MOCK_CONSTANTS.USER_ID,
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    rating: MOCK_CONSTANTS.UPDATED_RATING,
    content: MOCK_CONSTANTS.UPDATED_CONTENT,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
    user: {
      name: '테스트유저',
    },
  },

  // 다른 사용자 소유의 리뷰 (권한 테스트용)
  otherUserReview: {
    id: MOCK_CONSTANTS.REVIEW_ID,
    userId: MOCK_CONSTANTS.OTHER_USER_ID,
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
    rating: MOCK_CONSTANTS.RATING,
    content: MOCK_CONSTANTS.CONTENT,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
  },

  // getReviewById용 (전체 필드 포함)
  fullReview: {
    id: MOCK_CONSTANTS.REVIEW_ID,
    userId: MOCK_CONSTANTS.USER_ID,
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
    rating: MOCK_CONSTANTS.RATING,
    content: MOCK_CONSTANTS.CONTENT,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
  },

  // orderItem 데이터 (getOrderItemById용)
  existingOrderItem: {
    order: {
      userId: MOCK_CONSTANTS.USER_ID,
    },
  },

  // 다른 사용자의 orderItem (권한 테스트용)
  otherUserOrderItem: {
    order: {
      userId: MOCK_CONSTANTS.OTHER_USER_ID,
    },
  },

  // getReviewList용 DTO
  getReviewListQueryDto: {
    productId: MOCK_CONSTANTS.PRODUCT_ID,
    page: MOCK_CONSTANTS.PAGE,
    limit: MOCK_CONSTANTS.LIMIT,
  },

  // Repository에서 반환하는 데이터 (count + reviewList)
  repositoryReviewListData: {
    count: 10,
    reviewList: [
      {
        id: MOCK_CONSTANTS.REVIEW_ID,
        userId: MOCK_CONSTANTS.USER_ID,
        productId: MOCK_CONSTANTS.PRODUCT_ID,
        rating: MOCK_CONSTANTS.RATING,
        content: MOCK_CONSTANTS.CONTENT,
        createdAt: MOCK_CONSTANTS.MOCK_DATE,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE,
        orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
        user: {
          name: '테스트유저',
        },
      },
      {
        id: MOCK_CONSTANTS.REVIEW_ID_2,
        userId: MOCK_CONSTANTS.OTHER_USER_ID,
        productId: MOCK_CONSTANTS.PRODUCT_ID,
        rating: 4,
        content: '좋아요!',
        createdAt: MOCK_CONSTANTS.MOCK_DATE_2,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE_2,
        orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
        user: {
          name: '다른유저',
        },
      },
    ],
  },

  // Repository에서 반환하는 빈 데이터
  repositoryEmptyReviewListData: {
    count: 0,
    reviewList: [],
  },

  // Service에서 반환하는 응답 (items + meta)
  expectedReviewListResponse: {
    items: [
      {
        id: MOCK_CONSTANTS.REVIEW_ID,
        userId: MOCK_CONSTANTS.USER_ID,
        productId: MOCK_CONSTANTS.PRODUCT_ID,
        rating: MOCK_CONSTANTS.RATING,
        content: MOCK_CONSTANTS.CONTENT,
        createdAt: MOCK_CONSTANTS.MOCK_DATE,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE,
        orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
        user: {
          name: '테스트유저',
        },
      },
      {
        id: MOCK_CONSTANTS.REVIEW_ID_2,
        userId: MOCK_CONSTANTS.OTHER_USER_ID,
        productId: MOCK_CONSTANTS.PRODUCT_ID,
        rating: 4,
        content: '좋아요!',
        createdAt: MOCK_CONSTANTS.MOCK_DATE_2,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE_2,
        orderItemId: MOCK_CONSTANTS.ORDER_ITEM_ID,
        user: {
          name: '다른유저',
        },
      },
    ],
    meta: {
      total: 10,
      page: 1,
      limit: 5,
      hasNextPage: true,
    },
  },

  // Service에서 반환하는 빈 응답
  expectedEmptyReviewListResponse: {
    items: [],
    meta: {
      total: 0,
      page: 1,
      limit: 5,
      hasNextPage: false,
    },
  },

  // 리뷰 리스트 (getReviewList 응답) - 이전 버전 (deprecated)
  reviewList: [
    {
      id: MOCK_CONSTANTS.REVIEW_ID,
      userId: MOCK_CONSTANTS.USER_ID,
      productId: MOCK_CONSTANTS.PRODUCT_ID,
      rating: MOCK_CONSTANTS.RATING,
      content: MOCK_CONSTANTS.CONTENT,
      createdAt: MOCK_CONSTANTS.MOCK_DATE,
    },
    {
      id: MOCK_CONSTANTS.REVIEW_ID_2,
      userId: MOCK_CONSTANTS.OTHER_USER_ID,
      productId: MOCK_CONSTANTS.PRODUCT_ID,
      rating: 4,
      content: '좋아요!',
      createdAt: MOCK_CONSTANTS.MOCK_DATE_2,
    },
  ],

  // 빈 리뷰 리스트
  emptyReviewList: [],

  // 삭제용 DTO
  deleteReviewDto: {
    userId: MOCK_CONSTANTS.USER_ID,
    reviewId: MOCK_CONSTANTS.REVIEW_ID,
  },
};
