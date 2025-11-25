import { afterEach, describe, test, expect, jest } from '@jest/globals';
import usersService from '@modules/user/userService';
import authService from '@modules/auth/authService';
import { LoginDto } from '@modules/auth/dto/loginDTO';
import * as passwordUtils from '@modules/auth/utils/passwordUtils';
import tokenUtils from '@modules/auth/utils/tokenUtils';

describe('AuthService 단위 테스트', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login 메소드 테스트', () => {
    test('login 성공 테스트 - mock방식', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: '테스트유저',
        password: 'hashedPassword123',
        type: 'BUYER',
        points: 100,
        image: null,
        grade: {
          id: 'grade123',
          name: 'Green',
          rate: 0.01,
          minAmount: 0,
        },
      };

      const expectedResult = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          type: mockUser.type,
          points: mockUser.points,
          image: mockUser.image,
          grade: {
            id: mockUser.grade.id,
            name: mockUser.grade.name,
            discountRate: mockUser.grade.rate,
            minAmount: mockUser.grade.minAmount,
          },
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      // 사용자 조회와 비밀번호 검증, 토큰 생성을 mock
      const getUserByEmailMock = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(mockUser as any);
      const isPasswordValidMock = jest
        .spyOn(passwordUtils, 'isPasswordValid')
        .mockResolvedValue(true);
      const generateAccessTokenMock = jest
        .spyOn(tokenUtils, 'generateAccessToken')
        .mockReturnValue('mock-access-token');
      const generateRefreshTokenMock = jest
        .spyOn(tokenUtils, 'generateRefreshToken')
        .mockReturnValue('mock-refresh-token');

      const result = await authService.login(loginDto);

      expect(getUserByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordValidMock).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(generateAccessTokenMock).toHaveBeenCalledWith({ id: mockUser.id });
      expect(generateRefreshTokenMock).toHaveBeenCalledWith({ id: mockUser.id });
      expect(result).toEqual(expectedResult);
    });

    test('login 실패 테스트 - 존재하지 않는 이메일', async () => {
      const loginDto: LoginDto = {
        email: 'notexist@example.com',
        password: 'password123',
      };

      // 존재하지 않는 사용자를 mock
      const getUserByEmailMock = jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null);

      // 에러가 발생하는지 확인
      await expect(authService.login(loginDto)).rejects.toMatchObject({
        code: 404,
        message: '사용자 또는 비밀번호가 올바르지 않습니다.',
      });

      // getUserByEmail이 호출되었는지 확인
      expect(getUserByEmailMock).toHaveBeenCalledWith(loginDto.email);
    });

    test('login 실패 테스트 - 잘못된 비밀번호', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: '테스트유저',
        password: 'hashedPassword123',
        type: 'BUYER' as const,
        points: 100,
        image: null,
        grade: {
          id: 'grade123',
          name: 'Green',
          rate: 0.01,
          minAmount: 0,
        },
      };

      // 사용자는 존재하지만 비밀번호가 틀렸을 때를 mock합니다.
      const getUserByEmailMock = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(mockUser as any);
      const isPasswordValidMock = jest
        .spyOn(passwordUtils, 'isPasswordValid')
        .mockResolvedValue(false);

      // 에러가 발생하는지 확인
      await expect(authService.login(loginDto)).rejects.toMatchObject({
        code: 401,
        message: '사용자 또는 비밀번호가 올바르지 않습니다.',
      });

      // 메소드 호출 확인
      expect(getUserByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordValidMock).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    test('login 실패 테스트 - 토큰 생성 실패', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: '테스트유저',
        password: 'hashedPassword123',
        type: 'BUYER' as const,
        points: 100,
        image: null,
        grade: {
          id: 'grade123',
          name: 'Green',
          rate: 0.01,
          minAmount: 0,
        },
      };

      // 사용자 조회와 비밀번호 검증은 성공하지만 토큰 생성에서 실패하는 경우
      const getUserByEmailMock = jest
        .spyOn(usersService, 'getUserByEmail')
        .mockResolvedValue(mockUser as any);
      const isPasswordValidMock = jest
        .spyOn(passwordUtils, 'isPasswordValid')
        .mockResolvedValue(true);

      // 토큰 생성에서 에러가 발생
      jest.spyOn(tokenUtils, 'generateAccessToken').mockImplementation(() => {
        throw new Error('토큰 생성 실패');
      });

      //에러 발생 확인
      await expect(authService.login(loginDto)).rejects.toThrow('토큰 생성 실패');
      expect(getUserByEmailMock).toHaveBeenCalledWith(loginDto.email);
      expect(isPasswordValidMock).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });
  });
});
