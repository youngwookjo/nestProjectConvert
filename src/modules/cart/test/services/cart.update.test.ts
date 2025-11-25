import { afterEach, describe, test, expect, jest } from '@jest/globals';
import cartService from '@modules/cart/cartService';
import cartRepository from '@modules/cart/cartRepo';
import productRepository from '@modules/product/productRepo';
import { CartItemResponseDto } from '@modules/cart/dto/cartDTO';
import { ApiError } from '@errors/ApiError';
import { TEST_USER_ID, createEmptyCartMock, createSimpleCartItemMock } from '../mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('updateCart 메소드 테스트', () => {
  test('성공 - 장바구니가 없는 경우 (장바구니 생성 후 아이템 추가)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();
    const productId = 'product-1';
    const sizeId = 1;
    const quantity = 3;

    const requestData = {
      productId,
      sizes: [{ sizeId, quantity }],
    };

    const mockNewCart = createEmptyCartMock(testDate, {
      id: 'new-cart-id',
    });

    const mockStock = { quantity: 100 }; // 재고 충분

    const mockCartItem = createSimpleCartItemMock(testDate, {
      id: 'cart-item-1',
      cartId: 'new-cart-id',
      productId,
      sizeId,
      quantity,
    });

    const expectedResult: CartItemResponseDto[] = [mockCartItem];

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(true); // 상품 존재
    const getByUserIdMock = jest.spyOn(cartRepository, 'getByUserId').mockResolvedValue(null); // 장바구니 없음
    const createMock = jest.spyOn(cartRepository, 'createCart').mockResolvedValue(mockNewCart); // 새 장바구니 생성
    const getStockMock = jest.spyOn(productRepository, 'getStock').mockResolvedValue(mockStock); // 재고 충분
    const upsertCartItemMock = jest
      .spyOn(cartRepository, 'upsertCartItem')
      .mockResolvedValue(mockCartItem);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.updateCart(userId, requestData);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalledWith(productId);
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(createMock).toHaveBeenCalledWith(userId);
    expect(getStockMock).toHaveBeenCalledWith(productId, sizeId);
    expect(upsertCartItemMock).toHaveBeenCalledWith('new-cart-id', productId, sizeId, quantity);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공 - 기존 장바구니가 있는 경우 (아이템 추가/수정)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();
    const productId = 'product-1';
    const sizeId = 1;
    const quantity = 5;

    const requestData = {
      productId,
      sizes: [{ sizeId, quantity }],
    };

    const mockExistingCart = createEmptyCartMock(testDate, {
      id: 'existing-cart-id',
    });

    const mockStock = { quantity: 100 }; // 재고 충분

    const mockCartItem = createSimpleCartItemMock(testDate, {
      id: 'cart-item-1',
      cartId: 'existing-cart-id',
      productId,
      sizeId,
      quantity,
    });

    const expectedResult: CartItemResponseDto[] = [mockCartItem];

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(true);
    const getByUserIdMock = jest
      .spyOn(cartRepository, 'getByUserId')
      .mockResolvedValue(mockExistingCart); // 기존 장바구니 존재
    const createMock = jest.spyOn(cartRepository, 'createCart');
    const getStockMock = jest.spyOn(productRepository, 'getStock').mockResolvedValue(mockStock);
    const upsertCartItemMock = jest
      .spyOn(cartRepository, 'upsertCartItem')
      .mockResolvedValue(mockCartItem);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.updateCart(userId, requestData);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalledWith(productId);
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(createMock).not.toHaveBeenCalled(); // 기존 장바구니가 있으므로 create 호출되지 않음
    expect(getStockMock).toHaveBeenCalledWith(productId, sizeId);
    expect(upsertCartItemMock).toHaveBeenCalledWith(
      'existing-cart-id',
      productId,
      sizeId,
      quantity,
    );

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공 - 여러 사이즈를 한 번에 추가하는 경우', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();
    const productId = 'product-1';

    const requestData = {
      productId,
      sizes: [
        { sizeId: 1, quantity: 3 },
        { sizeId: 2, quantity: 5 },
      ],
    };

    const mockExistingCart = createEmptyCartMock(testDate, {
      id: 'existing-cart-id',
    });

    const mockStock1 = { quantity: 100 };
    const mockStock2 = { quantity: 50 };

    const mockCartItem1 = createSimpleCartItemMock(testDate, {
      id: 'cart-item-1',
      cartId: 'existing-cart-id',
      productId,
      sizeId: 1,
      quantity: 3,
    });

    const mockCartItem2 = createSimpleCartItemMock(testDate, {
      id: 'cart-item-2',
      cartId: 'existing-cart-id',
      productId,
      sizeId: 2,
      quantity: 5,
    });

    const expectedResult: CartItemResponseDto[] = [mockCartItem1, mockCartItem2];

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(true);
    const getByUserIdMock = jest
      .spyOn(cartRepository, 'getByUserId')
      .mockResolvedValue(mockExistingCart);
    const getStockMock = jest
      .spyOn(productRepository, 'getStock')
      .mockResolvedValueOnce(mockStock1) // 첫 번째 사이즈
      .mockResolvedValueOnce(mockStock2); // 두 번째 사이즈
    const upsertCartItemMock = jest
      .spyOn(cartRepository, 'upsertCartItem')
      .mockResolvedValueOnce(mockCartItem1) // 첫 번째 아이템
      .mockResolvedValueOnce(mockCartItem2); // 두 번째 아이템

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.updateCart(userId, requestData);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalledWith(productId);
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(getStockMock).toHaveBeenCalledTimes(2);
    expect(getStockMock).toHaveBeenNthCalledWith(1, productId, 1);
    expect(getStockMock).toHaveBeenNthCalledWith(2, productId, 2);
    expect(upsertCartItemMock).toHaveBeenCalledTimes(2);
    expect(upsertCartItemMock).toHaveBeenNthCalledWith(1, 'existing-cart-id', productId, 1, 3);
    expect(upsertCartItemMock).toHaveBeenNthCalledWith(2, 'existing-cart-id', productId, 2, 5);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
  test('실패 - 상품이 존재하지 않는 경우', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const productId = 'non-existent-product';

    const requestData = {
      productId,
      sizes: [{ sizeId: 1, quantity: 3 }],
    };

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(false); // 상품 존재하지 않음

    // 3. 서비스 함수를 실행하고 에러가 발생하는지 확인
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(ApiError);
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(
      '상품을 찾을 수 없습니다.',
    );

    // 4. 모킹된 메소드가 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalled();
  });

  test('실패 - 재고가 존재하지 않는 경우', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();
    const productId = 'product-1';
    const sizeId = 999; // 존재하지 않는 사이즈

    const requestData = {
      productId,
      sizes: [{ sizeId, quantity: 3 }],
    };

    const mockExistingCart = createEmptyCartMock(testDate, {
      id: 'existing-cart-id',
    });

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(true);
    const getByUserIdMock = jest
      .spyOn(cartRepository, 'getByUserId')
      .mockResolvedValue(mockExistingCart);
    const getStockMock = jest.spyOn(productRepository, 'getStock').mockResolvedValue(null); // 재고 존재하지 않음

    // 3. 서비스 함수를 실행하고 에러가 발생하는지 확인
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(ApiError);
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(
      `사이즈 ID ${sizeId}에 대한 재고를 찾을 수 없습니다.`,
    );

    // 4. 모킹된 메소드가 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalledWith(productId);
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(getStockMock).toHaveBeenCalledWith(productId, sizeId);
  });

  test('실패 - 재고가 부족한 경우', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();
    const productId = 'product-1';
    const sizeId = 1;
    const requestedQuantity = 100;
    const availableStock = 50; // 재고 부족

    const requestData = {
      productId,
      sizes: [{ sizeId, quantity: requestedQuantity }],
    };

    const mockExistingCart = createEmptyCartMock(testDate, {
      id: 'existing-cart-id',
    });

    const mockStock = { quantity: availableStock }; // 재고 부족

    // 2. 레포지토리 함수 모킹
    const checkProductExistsMock = jest
      .spyOn(productRepository, 'checkProductExists')
      .mockResolvedValue(true);
    const getByUserIdMock = jest
      .spyOn(cartRepository, 'getByUserId')
      .mockResolvedValue(mockExistingCart);
    const getStockMock = jest.spyOn(productRepository, 'getStock').mockResolvedValue(mockStock);

    // 3. 서비스 함수를 실행하고 에러가 발생하는지 확인
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(ApiError);
    await expect(cartService.updateCart(userId, requestData)).rejects.toThrow(
      `사이즈 ID ${sizeId}의 재고가 부족합니다. (요청: ${requestedQuantity}, 재고: ${availableStock})`,
    );

    // 4. 모킹된 메소드가 호출되었는지 확인
    expect(checkProductExistsMock).toHaveBeenCalledWith(productId);
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(getStockMock).toHaveBeenCalledWith(productId, sizeId);
  });
});
