import { afterEach, describe, test, expect, jest } from '@jest/globals';
import userService from '@modules/user/userService';
import userRepository from '@modules/user/userRepo';
import * as passwordUtils from '@modules/auth/utils/passwordUtils';
import { MOCK_CONSTANTS, MOCK_DATA } from '@modules/user/test/services/mock';

describe('userCreate 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser 메소드 테스트', () => {
    test('createUser 성공 테스트', async () => {
      // 공통 mock 데이터 사용
      const createUserDto = MOCK_DATA.createUserDto;
      const hashedPassword = MOCK_CONSTANTS.HASHED_PASSWORD;
      const mockCreatedUser = MOCK_DATA.createdUser;
      const expectedResult = MOCK_DATA.resUser;

      // Repository 메소드들을 mock
      //prettier-ignore
      const getUserByEmailMock = jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue(null);
      const getUserByNameMock = jest.spyOn(userRepository, 'getUserByName').mockResolvedValue(null);
      const createUserMock = jest
        .spyOn(userRepository, 'createUser')
        .mockResolvedValue(mockCreatedUser);

      const hashPasswordMock = jest
        .spyOn(passwordUtils, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      const result = await userService.createUser(createUserDto);

      // Mock된 메소드들이 올바른 인자와 함께 호출되었는지 확인
      expect(getUserByEmailMock).toHaveBeenCalledWith(createUserDto.email);
      expect(getUserByNameMock).toHaveBeenCalledWith(createUserDto.name);
      expect(hashPasswordMock).toHaveBeenCalledWith(MOCK_CONSTANTS.ORIGINAL_PASSWORD); // 원본 비밀번호 사용
      expect(createUserMock).toHaveBeenCalledWith({
        name: MOCK_CONSTANTS.USER_NAME,
        email: MOCK_CONSTANTS.USER_EMAIL,
        password: hashedPassword, // 해시된 비밀번호
        type: 'BUYER',
      });
      expect(result).toEqual(expectedResult);
    });

    test('createUser 실패 테스트 - 이메일 중복', async () => {
      const createUserDto = MOCK_DATA.createUserDto;
      const existingUser = MOCK_DATA.existingUserByEmail;

      // 이미 존재하는 이메일을 mock
      const getUserByEmailMock = jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue(existingUser);

      await expect(userService.createUser(createUserDto)).rejects.toMatchObject({
        code: 409,
        message: '이미 존재하는 이메일입니다.',
      });

      // 메소드가 호출되었는지 확인
      expect(getUserByEmailMock).toHaveBeenCalledWith(createUserDto.email);
    });

    test('createUser 실패 테스트 - 이름 중복', async () => {
      const createUserDto = MOCK_DATA.createUserDto;
      const existingUser = MOCK_DATA.existingUserByName;

      const getUserByEmailMock = jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue(null);
      // 이미 존재하는 이름을 mock합니다.
      const getUserByNameMock = jest
        .spyOn(userRepository, 'getUserByName')
        .mockResolvedValue(existingUser);

      await expect(userService.createUser(createUserDto)).rejects.toMatchObject({
        code: 409,
        message: '이미 존재하는 이름입니다.',
      });

      // 메소드들이 호출되었는지 확인
      expect(getUserByEmailMock).toHaveBeenCalledWith(createUserDto.email);
      expect(getUserByNameMock).toHaveBeenCalledWith(createUserDto.name);
    });
  });
});
