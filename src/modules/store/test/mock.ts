import { CreateStoreDto, UpdateStoreDto } from '@modules/store/dto/storeDTO';

export const mockUser = {
  id: 'test-user-id',
};

export const mockStoreOwner = {
  id: 'store-owner-id',
};

export const mockCategory = {
  id: 'category-id',
};

export const mockStore = {
  id: 'test-store-id',
  name: '테스트 스토어',
  userId: mockStoreOwner.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  address: '서울시 테스트구 테스트동',
  detailAddress: '123-456',
  phoneNumber: '010-0000-0000',
  content: '테스트 스토어입니다.',
  image: 'test.jpg',
};

export const createStoreDto: CreateStoreDto = {
  name: '생성스토어',
  address: '생성된 스토어 주소 123',
  detailAddress: '456호',
  phoneNumber: '010-1234-5678',
  content: '생성된 스토어입니다.',
  image: 'https://example.com/store1.jpg',
};

export const updateStoreDto: UpdateStoreDto = {
  name: '수정된 스토어명',
  content: '수정된 내용!',
  image: 'updatedImage.jpg',
};

export const mockProducts = [
  {
    id: 'product-id-1',
    storeId: mockStore.id,
    categoryId: mockCategory.id,
    name: 'mock-product1-name',
    content: 'mock product 설명.',
    image: 'image-url-1',
    price: 25000,
    discountPrice: 20000,
    discountRate: 20,
    discountStartTime: new Date('2024-01-01'),
    discountEndTime: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'product-id-2',
    storeId: mockStore.id,
    categoryId: mockCategory.id,
    name: 'mock-product2-name',
    content: 'mock product2 설명.',
    image: 'image-url-2',
    price: 60000,
    discountPrice: 6000,
    discountRate: 10,
    discountStartTime: new Date('2024-01-01'),
    discountEndTime: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
];

export const mockStoreLike = {
  id: 'like-id',
  userId: mockUser.id,
  storeId: mockStore.id,
  createdAt: new Date(),
};
