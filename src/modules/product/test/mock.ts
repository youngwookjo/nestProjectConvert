import { CreateProductDto } from '@modules/product/dto/productDTO';

export const mockUser = {
  id: 'test-user-id',
};

export const mockStore = {
  id: 'test-store-id',
  name: '테스트 스토어',
};

export const mockCategory = {
  id: 'test-category-id',
  name: 'TOP',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSize = {
  id: 1,
  en: 'M',
};

export const mockStock = {
  id: 'test-stock-id',
  sizeId: mockSize.id,
  quantity: 100,
};

export const createProductDto: CreateProductDto = {
  categoryName: '상의',
  name: '테스트 상품',
  price: 30000,
  image: 'https://example.com/product.jpg',
  content: '테스트 상품입니다.',
  discountRate: 10,
  discountStartTime: new Date('2025-01-01'),
  discountEndTime: new Date('2025-12-31'),
  stocks: [
    {
      sizeId: mockStock.sizeId,
      quantity: mockStock.quantity,
    },
  ],
};

export const mockProduct = {
  id: 'product-id-1',
  storeId: mockStore.id,
  categoryId: mockCategory.id,
  name: '테스트 상품',
  content: '테스트 상품입니다.',
  image: 'https://example.com/product.jpg',
  price: 30000,
  discountPrice: 27000,
  discountRate: 10,
  discountStartTime: new Date('2025-01-01'),
  discountEndTime: new Date('2025-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
  reviews: [],
  category: {
    id: mockCategory.id,
    name: mockCategory.name,
  },
  stocks: [
    {
      id: mockStock.id,
      productId: 'product-id-1',
      sizeId: mockSize.id,
      quantity: mockStock.quantity,
      size: {
        id: mockSize.id,
        en: mockSize.en,
      },
    },
  ],
  inquiries: [],
};

export const mockReview = {
  id: 'test-review-id',
  userId: 'test-user-id',
  productId: 'product-id-1',
  orderItemId: 'test-order-item-id',
  content: '테스트 리뷰입니다.',
  rating: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOrderItem = {
  id: 'test-order-item-id',
  orderId: 'test-order-id',
  productId: 'product-id-1',
  sizeId: mockSize.id,
  price: 30000,
  quantity: 2,
  isReviewed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
