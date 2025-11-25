import { afterEach, describe, test, expect, jest } from '@jest/globals';
import authService from '@modules/auth/authService';
import tokenUtils from '@modules/auth/utils/tokenUtils';

describe('AuthService - refreshToken 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('refreshToken 메소드 테스트', () => {
    test('refreshToken 성공 테스트', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockUserId = 'user123';
      const mockAccessToken = 'new-access-token';

      const mockDecodedToken = {
        id: mockUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      };

      // 리프레시 토큰 검증과 새로운 액세스 토큰 생성을 mock
      const verifyRefreshTokenMock = jest
        .spyOn(tokenUtils, 'verifyRefreshToken')
        .mockReturnValue(mockDecodedToken);
      const generateAccessTokenMock = jest
        .spyOn(tokenUtils, 'generateAccessToken')
        .mockReturnValue(mockAccessToken);

      const result = authService.refreshToken(mockRefreshToken);

      // Mock된 메소드들이 올바른 인자와 함께 호출되었는지 확인
      expect(verifyRefreshTokenMock).toHaveBeenCalledWith(mockRefreshToken);
      expect(generateAccessTokenMock).toHaveBeenCalledWith({ id: mockUserId });
      expect(result).toBe(mockAccessToken);
    });

    test('refreshToken 실패 테스트 - 유효하지 않은 토큰', async () => {
      const invalidRefreshToken = 'invalid-refresh-token';

      // 유효하지 않은 토큰으로 검증 실패를 시뮬레이션
      const verifyRefreshTokenMock = jest
        .spyOn(tokenUtils, 'verifyRefreshToken')
        .mockImplementation(() => {
          throw new Error('Invalid token');
        });

      // 에러가 발생하는지 확인
      expect(() => authService.refreshToken(invalidRefreshToken)).toThrow('Invalid token');

      // verifyRefreshToken이 호출되었는지 확인
      expect(verifyRefreshTokenMock).toHaveBeenCalledWith(invalidRefreshToken);
    });

    test('refreshToken 실패 테스트 - 만료된 토큰', async () => {
      const expiredRefreshToken = 'expired-refresh-token';

      // 만료된 토큰으로 검증 실패를 시뮬레이션
      const verifyRefreshTokenMock = jest
        .spyOn(tokenUtils, 'verifyRefreshToken')
        .mockImplementation(() => {
          throw new Error('Token expired');
        });

      // 에러가 발생하는지 확인
      expect(() => authService.refreshToken(expiredRefreshToken)).toThrow('Token expired');

      // verifyRefreshToken이 호출되었는지 확인
      expect(verifyRefreshTokenMock).toHaveBeenCalledWith(expiredRefreshToken);
    });

    test('refreshToken 실패 테스트 - 액세스 토큰 생성 실패', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockUserId = 'user123';

      const mockDecodedToken = {
        id: mockUserId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      };

      // 리프레시 토큰 검증은 성공하지만 액세스 토큰 생성에서 실패
      const verifyRefreshTokenMock = jest
        .spyOn(tokenUtils, 'verifyRefreshToken')
        .mockReturnValue(mockDecodedToken);
      const generateAccessTokenMock = jest
        .spyOn(tokenUtils, 'generateAccessToken')
        .mockImplementation(() => {
          throw new Error('액세스 토큰 생성 실패');
        });

      // 에러가 발생하는지 확인
      expect(() => authService.refreshToken(mockRefreshToken)).toThrow('액세스 토큰 생성 실패');

      // 메소드 호출 확인
      expect(verifyRefreshTokenMock).toHaveBeenCalledWith(mockRefreshToken);
      expect(generateAccessTokenMock).toHaveBeenCalledWith({ id: mockUserId });
    });
  });
});
