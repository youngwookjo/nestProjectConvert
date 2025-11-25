import { CreateUserDto } from '@modules/user/dto/userDTO';

// 공통 상수
export const MOCK_CONSTANTS = {
  USER_ID: 'user123',
  GRADE_ID: 'grade123',
  USER_NAME: '테스트유저',
  USER_EMAIL: 'test@example.com',
  ORIGINAL_PASSWORD: 'password123',
  HASHED_PASSWORD: 'hashedPassword123',
  MOCK_DATE: new Date('2024-01-01'),
  NEW_PASSWORD: 'newPassword123',
  IMAGE: 'http://example.com/image.jpg',
  STORE_ID_1: 'store123',
  STORE_ID_2: 'store456',
  SELLER_ID: 'seller123',
  STORE_NAME_1: '테스트상점1',
  STORE_NAME_2: '테스트상점2',
  STORE_ADDRESS: '서울시 강남구 테스트로 123',
  STORE_DETAIL_ADDRESS: '1층',
  STORE_PHONE: '02-1234-5678',
  STORE_CONTENT: '테스트 상점 설명',
  STORE_IMAGE: 'http://example.com/store.jpg',
} as const;

// 기본 객체들
const baseGrade = {
  id: MOCK_CONSTANTS.GRADE_ID,
  name: 'Green',
  rate: 1,
  minAmount: 0,
} as const;

const baseGradeWithDates = {
  ...baseGrade,
  createdAt: MOCK_CONSTANTS.MOCK_DATE,
  updatedAt: MOCK_CONSTANTS.MOCK_DATE,
} as const;

const baseUser = {
  type: 'BUYER',
  createdAt: MOCK_CONSTANTS.MOCK_DATE,
  updatedAt: MOCK_CONSTANTS.MOCK_DATE,
  image: null,
} as const;

const baseCreatedUser = {
  ...baseUser,
  id: MOCK_CONSTANTS.USER_ID,
  gradeId: MOCK_CONSTANTS.GRADE_ID,
  name: MOCK_CONSTANTS.USER_NAME,
  email: MOCK_CONSTANTS.USER_EMAIL,
  password: MOCK_CONSTANTS.HASHED_PASSWORD,
  points: 0,
  totalAmount: 0,
  grade: baseGradeWithDates,
} as const;

// 미리 정의된 mock 데이터들
export const MOCK_DATA = {
  // 기본 사용자 생성 DTO
  createUserDto: {
    name: MOCK_CONSTANTS.USER_NAME,
    email: MOCK_CONSTANTS.USER_EMAIL,
    password: MOCK_CONSTANTS.ORIGINAL_PASSWORD,
    type: 'BUYER',
  } as CreateUserDto,

  // 기본 생성된 사용자
  createdUser: baseCreatedUser,

  // 기본 응답용 사용자 (ResUserDto)
  resUser: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: MOCK_CONSTANTS.USER_NAME,
    email: MOCK_CONSTANTS.USER_EMAIL,
    type: 'BUYER',
    points: 0,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    grade: baseGrade,
    image: null,
  },

  // 이메일 중복 검사용 기존 사용자
  existingUserByEmail: {
    ...baseCreatedUser,
    id: 'existing123',
    name: '기존유저',
  },

  // 이름 중복 검사용 기존 사용자
  existingUserByName: {
    ...baseCreatedUser,
    id: 'existing123',
    email: 'existing@example.com',
  },

  // getUser 테스트용 (points, totalAmount가 다른 값)
  getUser: {
    ...baseCreatedUser,
    points: 100,
    totalAmount: 5000,
  },

  // getUser 응답용 (ResUserDto)
  getUserResponse: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: MOCK_CONSTANTS.USER_NAME,
    email: MOCK_CONSTANTS.USER_EMAIL,
    type: 'BUYER',
    points: 100,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    grade: baseGrade,
    image: null,
  },

  // 업데이트용 DTO
  updateUserDto: {
    userId: MOCK_CONSTANTS.USER_ID,
    name: '업데이트된이름',
    newPassword: MOCK_CONSTANTS.NEW_PASSWORD,
    currentPassword: MOCK_CONSTANTS.ORIGINAL_PASSWORD,
    image: MOCK_CONSTANTS.IMAGE,
  },

  // 업데이트된 사용자
  updatedUser: {
    ...baseCreatedUser,
    name: '업데이트된이름',
    points: 100,
    totalAmount: 5000,
    image: MOCK_CONSTANTS.IMAGE,
  },

  // 업데이트된 사용자 응답 (ResUserDto)
  updatedUserResponse: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: '업데이트된이름',
    email: MOCK_CONSTANTS.USER_EMAIL,
    type: 'BUYER',
    points: 100,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    grade: baseGrade,
    image: MOCK_CONSTANTS.IMAGE,
  },

  // 찜한 상점 리스트
  favoriteStoreList: [
    {
      storeId: MOCK_CONSTANTS.STORE_ID_1,
      userId: MOCK_CONSTANTS.USER_ID,
      store: {
        id: MOCK_CONSTANTS.STORE_ID_1,
        name: MOCK_CONSTANTS.STORE_NAME_1,
        createdAt: MOCK_CONSTANTS.MOCK_DATE,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE,
        userId: MOCK_CONSTANTS.SELLER_ID,
        address: MOCK_CONSTANTS.STORE_ADDRESS,
        detailAddress: MOCK_CONSTANTS.STORE_DETAIL_ADDRESS,
        phoneNumber: MOCK_CONSTANTS.STORE_PHONE,
        content: MOCK_CONSTANTS.STORE_CONTENT,
        image: MOCK_CONSTANTS.STORE_IMAGE,
      },
    },
    {
      storeId: MOCK_CONSTANTS.STORE_ID_2,
      userId: MOCK_CONSTANTS.USER_ID,
      store: {
        id: MOCK_CONSTANTS.STORE_ID_2,
        name: MOCK_CONSTANTS.STORE_NAME_2,
        createdAt: MOCK_CONSTANTS.MOCK_DATE,
        updatedAt: MOCK_CONSTANTS.MOCK_DATE,
        userId: MOCK_CONSTANTS.SELLER_ID,
        address: MOCK_CONSTANTS.STORE_ADDRESS,
        detailAddress: MOCK_CONSTANTS.STORE_DETAIL_ADDRESS,
        phoneNumber: MOCK_CONSTANTS.STORE_PHONE,
        content: MOCK_CONSTANTS.STORE_CONTENT,
        image: MOCK_CONSTANTS.STORE_IMAGE,
      },
    },
  ],

  // 빈 찜한 상점 리스트
  emptyFavoriteStoreList: [],

  // 삭제된 사용자 (이미지 있음)
  deletedUser: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: MOCK_CONSTANTS.USER_NAME,
    email: MOCK_CONSTANTS.USER_EMAIL,
    password: MOCK_CONSTANTS.HASHED_PASSWORD,
    type: 'BUYER' as const,
    points: 0,
    totalAmount: 0,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    image: MOCK_CONSTANTS.IMAGE,
  },

  // 삭제된 사용자 (이미지 없음)
  deletedUserWithoutImage: {
    id: MOCK_CONSTANTS.USER_ID,
    gradeId: MOCK_CONSTANTS.GRADE_ID,
    name: MOCK_CONSTANTS.USER_NAME,
    email: MOCK_CONSTANTS.USER_EMAIL,
    password: MOCK_CONSTANTS.HASHED_PASSWORD,
    type: 'BUYER' as const,
    points: 0,
    totalAmount: 0,
    createdAt: MOCK_CONSTANTS.MOCK_DATE,
    updatedAt: MOCK_CONSTANTS.MOCK_DATE,
    image: null,
  },
};
