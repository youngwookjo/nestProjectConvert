import { afterEach, describe, test, expect, jest } from '@jest/globals';
import cartService from '@modules/cart/cartService';
import cartRepository from '@modules/cart/cartRepo';
import { GetCartDto } from '@modules/cart/dto/cartDTO';
import { TEST_USER_ID, createEmptyCartWithDetailsMock, createComplexCartMock } from '../mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('getCart 메소드 테스트', () => {
  test('성공 - 기존 장바구니가 없는 경우 (빈 장바구니 생성)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const mockNewCartFromDB = createEmptyCartWithDetailsMock(testDate, {
      id: 'new-cart-id',
    });

    const expectedResult: GetCartDto = {
      id: 'new-cart-id',
      buyerId: userId,
      quantity: 0, // items가 비어있으므로 0
      createdAt: testDate,
      updatedAt: testDate,
      items: [],
    };

    // 2. 레포지토리 함수 모킹
    const getCartWithDetailsMock = jest
      .spyOn(cartRepository, 'getCartWithDetails')
      .mockResolvedValue(null); // 기존 장바구니가 없음
    const createMock = jest
      .spyOn(cartRepository, 'createCart')
      .mockResolvedValue(mockNewCartFromDB);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.getCart(userId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartWithDetailsMock).toHaveBeenCalledWith(userId);
    expect(createMock).toHaveBeenCalledWith(userId);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공 - 기존 장바구니가 있지만 items가 비어있는 경우', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const mockCartFromDB = createEmptyCartWithDetailsMock(testDate, {
      id: 'existing-cart-id',
    });

    const expectedResult: GetCartDto = {
      id: 'existing-cart-id',
      buyerId: userId,
      quantity: 0,
      createdAt: testDate,
      updatedAt: testDate,
      items: [],
    };

    // 2. 레포지토리 함수 모킹
    const getCartWithDetailsMock = jest
      .spyOn(cartRepository, 'getCartWithDetails')
      .mockResolvedValue(mockCartFromDB);
    const createMock = jest.spyOn(cartRepository, 'createCart');

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.getCart(userId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartWithDetailsMock).toHaveBeenCalledWith(userId);
    expect(createMock).not.toHaveBeenCalled(); // 기존 장바구니가 있으므로 create가 호출되지 않음

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공 - 기존 장바구니가 있고 items가 있는 경우 (상세 정보 포함)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const mockCartFromDB = createComplexCartMock(testDate);

    const expectedResult: GetCartDto = {
      id: 'cart-with-items-id',
      buyerId: userId,
      quantity: 5, // 2 + 3 = 5
      createdAt: testDate,
      updatedAt: testDate,
      items: [
        {
          id: 'item-1',
          cartId: 'cart-with-items-id',
          productId: 'product-1',
          sizeId: 1,
          quantity: 2,
          createdAt: testDate,
          updatedAt: testDate,
          product: {
            id: 'product-1',
            storeId: 'store-1',
            name: '테스트 상품',
            price: 10000,
            image: 'https://example.com/image.jpg',
            discountRate: 10,
            discountStartTime: testDate,
            discountEndTime: testDate,
            createdAt: testDate,
            updatedAt: testDate,
            store: {
              id: 'store-1',
              userId: 'seller-id',
              name: '테스트 스토어',
              address: '서울시 강남구',
              phoneNumber: '010-1234-5678',
              content: '스토어 설명',
              image: 'https://example.com/store.jpg',
              createdAt: testDate,
              updatedAt: testDate,
            },
            stocks: [
              {
                id: 'stock-1',
                productId: 'product-1',
                sizeId: 1,
                quantity: 100,
                size: {
                  id: 1,
                  size: {
                    en: 'M',
                    ko: '중',
                  },
                },
              },
            ],
          },
        },
        {
          id: 'item-2',
          cartId: 'cart-with-items-id',
          productId: 'product-2',
          sizeId: 2,
          quantity: 3,
          createdAt: testDate,
          updatedAt: testDate,
          product: {
            id: 'product-2',
            storeId: 'store-2',
            name: '테스트 상품2',
            price: 20000,
            image: 'https://example.com/image2.jpg',
            discountRate: 0,
            discountStartTime: null,
            discountEndTime: null,
            createdAt: testDate,
            updatedAt: testDate,
            store: {
              id: 'store-2',
              userId: 'seller-id-2',
              name: '테스트 스토어2',
              address: '서울시 서초구',
              phoneNumber: '010-9876-5432',
              content: '스토어 설명2',
              image: 'https://example.com/store2.jpg',
              createdAt: testDate,
              updatedAt: testDate,
            },
            stocks: [
              {
                id: 'stock-2',
                productId: 'product-2',
                sizeId: 2,
                quantity: 50,
                size: {
                  id: 2,
                  size: {
                    en: 'L',
                    ko: '대',
                  },
                },
              },
            ],
          },
        },
      ],
    };

    // 2. 레포지토리 함수 모킹
    const getCartWithDetailsMock = jest
      .spyOn(cartRepository, 'getCartWithDetails')
      .mockResolvedValue(mockCartFromDB);
    const createMock = jest.spyOn(cartRepository, 'createCart');

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.getCart(userId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartWithDetailsMock).toHaveBeenCalledWith(userId);
    expect(createMock).not.toHaveBeenCalled(); // 기존 장바구니가 있으므로 create가 호출되지 않음

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
