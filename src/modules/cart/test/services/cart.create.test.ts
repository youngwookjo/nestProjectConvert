import { afterEach, describe, test, expect, jest } from '@jest/globals';
import cartService from '@modules/cart/cartService';
import cartRepository from '@modules/cart/cartRepo';
import { CreatedCartDto } from '@modules/cart/dto/cartDTO';
import { TEST_USER_ID, createEmptyCartMock, createCartWithSimpleItemsMock } from '../mock';

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('createOrGetCart 메소드 테스트', () => {
  test('성공 - 기존 장바구니가 없는 경우 (장바구니 생성)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const mockCartFromDB = createEmptyCartMock(testDate, {
      id: 'mock-cart-id',
    });

    const expectedResult: CreatedCartDto = {
      id: 'mock-cart-id',
      buyerId: userId,
      quantity: 0, // items가 비어있으므로 0
      createdAt: testDate,
      updatedAt: testDate,
    };

    // 2. 레포지토리 함수 모킹
    const getByUserIdMock = jest.spyOn(cartRepository, 'getByUserId').mockResolvedValue(null); // 기존 장바구니가 없음
    const createMock = jest.spyOn(cartRepository, 'createCart').mockResolvedValue(mockCartFromDB);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.createOrGetCart(userId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(createMock).toHaveBeenCalledWith(userId);

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });

  test('성공 - 기존 장바구니가 있는 경우 (장바구니 조회)', async () => {
    // 1. 테스트에 사용할 mock 데이터 생성
    const userId = TEST_USER_ID;
    const testDate = new Date();

    const mockCartFromDB = createCartWithSimpleItemsMock(
      testDate,
      [{ quantity: 2 }, { quantity: 3 }, { quantity: 1 }], // 총 6개 아이템
      { id: 'existing-cart-id' },
    );

    const expectedResult: CreatedCartDto = {
      id: 'existing-cart-id',
      buyerId: userId,
      quantity: 6,
      createdAt: testDate,
      updatedAt: testDate,
    };

    // 2. 레포지토리 함수 모킹
    const getByUserIdMock = jest
      .spyOn(cartRepository, 'getByUserId')
      .mockResolvedValue(mockCartFromDB); // 기존 장바구니가 있음
    const createMock = jest.spyOn(cartRepository, 'createCart').mockResolvedValue(mockCartFromDB);

    // 3. 서비스 함수를 올바른 인자들로 실행합니다.
    const result = await cartService.createOrGetCart(userId);

    // 4. 모킹된 메소드가 올바른 인자와 함께 호출되었는지 확인
    expect(getByUserIdMock).toHaveBeenCalledWith(userId);
    expect(createMock).not.toHaveBeenCalled(); // 기존 장바구니가 있으므로 create가 호출되지 않음

    // 5. 서비스 메소드가 모킹된 결과를 반환하는지 확인
    expect(result).toEqual(expectedResult);
  });
});
