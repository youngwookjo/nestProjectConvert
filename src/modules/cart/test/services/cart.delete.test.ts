import { afterEach, describe, test, expect, jest } from '@jest/globals';
import cartService from '@modules/cart/cartService';
import cartRepository from '@modules/cart/cartRepo';
import { ApiError } from '@errors/ApiError';
import { TEST_USER_ID, createMockCartItemWithCart } from '../mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('deleteCartItem 메소드 테스트', () => {
  test('성공 - 장바구니 아이템 삭제', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const cartItemId = 'cart-item-1';
    const testDate = new Date();

    const mockCartItem = createMockCartItemWithCart(testDate, {
      id: cartItemId,
      cart: {
        userId: userId,
      },
    });

    // 2. 레포지토리 함수 모킹
    const getCartItemByIdMock = jest
      .spyOn(cartRepository, 'getCartItemById')
      .mockResolvedValue(mockCartItem);
    const deleteCartItemMock = jest
      .spyOn(cartRepository, 'deleteCartItem')
      .mockResolvedValue(mockCartItem as any);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    await cartService.deleteCartItem(userId, cartItemId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartItemByIdMock).toHaveBeenCalledWith(cartItemId);
    expect(deleteCartItemMock).toHaveBeenCalledWith(cartItemId);
  });

  test('실패 - 존재하지 않는 장바구니 아이템 (404)', async () => {
    // 1. 테스트에 사용할 데이터
    const userId = TEST_USER_ID;
    const cartItemId = 'non-existent-item-id';

    // 2. 레포지토리 함수 모킹
    const getCartItemByIdMock = jest
      .spyOn(cartRepository, 'getCartItemById')
      .mockResolvedValue(null); // 아이템이 존재하지 않음
    const deleteCartItemMock = jest.spyOn(cartRepository, 'deleteCartItem');

    // 3. 서비스 함수를 올바른 인자들로 실행하고 에러 확인
    await expect(cartService.deleteCartItem(userId, cartItemId)).rejects.toThrow(
      ApiError.notFound('장바구니에 아이템이 없습니다.'),
    );

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartItemByIdMock).toHaveBeenCalledWith(cartItemId);
    expect(deleteCartItemMock).not.toHaveBeenCalled(); // 아이템이 없으므로 삭제가 호출되지 않음
  });

  test('실패 - 다른 사용자의 장바구니 아이템 삭제 시도 (403)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const otherUserId = 'other-user-id';
    const cartItemId = 'cart-item-1';
    const testDate = new Date();

    const mockCartItem = createMockCartItemWithCart(testDate, {
      id: cartItemId,
      cart: {
        userId: otherUserId, // 다른 사용자의 장바구니 아이템
      },
    });

    // 2. 레포지토리 함수 모킹
    const getCartItemByIdMock = jest
      .spyOn(cartRepository, 'getCartItemById')
      .mockResolvedValue(mockCartItem);
    const deleteCartItemMock = jest.spyOn(cartRepository, 'deleteCartItem');

    // 3. 서비스 함수를 올바른 인자들로 실행하고 에러 확인
    await expect(cartService.deleteCartItem(userId, cartItemId)).rejects.toThrow(
      ApiError.forbidden('접근 권한이 없습니다.'),
    );

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getCartItemByIdMock).toHaveBeenCalledWith(cartItemId);
    expect(deleteCartItemMock).not.toHaveBeenCalled(); // 권한이 없으므로 삭제가 호출되지 않음
  });
});
