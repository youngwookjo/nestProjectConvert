import { afterEach, describe, test, expect, jest } from '@jest/globals';
import userService from '@modules/user/userService';
import userRepository from '@modules/user/userRepo';
import * as passwordUtils from '@modules/auth/utils/passwordUtils';
import { MOCK_CONSTANTS, MOCK_DATA } from '@modules/user/test/services/mock';

describe('userUpdate 단위 테스트', () => {
  // 각 테스트 후에 모든 모의(mock)를 복원
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updateUser 메소드 테스트', () => {
    test('updateUser 성공 테스트', async () => {
      // 공통 mock 데이터 사용
      const updateUserDto = MOCK_DATA.updateUserDto;
      const hashedPassword = MOCK_CONSTANTS.HASHED_PASSWORD;
      const mockExistingUser = MOCK_DATA.getUser;
      const mockUpdatedUser = MOCK_DATA.updatedUser;
      const expectedResult = MOCK_DATA.updatedUserResponse;

      // Repository 메소드들을 mock
      const getUserByIdMock = jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockExistingUser);
      const updateUserMock = jest
        .spyOn(userRepository, 'updateUser')
        .mockResolvedValue(mockUpdatedUser);
      const isPasswordValidMock = jest
        .spyOn(passwordUtils, 'isPasswordValid')
        .mockResolvedValue(true);
      const hashPasswordMock = jest
        .spyOn(passwordUtils, 'hashPassword')
        .mockResolvedValue(hashedPassword);

      const result = await userService.updateUser(updateUserDto);
      // Mock된 메소드들이 올바른 인자와 함께 호출되었는지 확인
      expect(getUserByIdMock).toHaveBeenCalledWith(updateUserDto.userId);
      expect(isPasswordValidMock).toHaveBeenCalledWith(
        updateUserDto.currentPassword,
        mockExistingUser.password,
      );
      expect(hashPasswordMock).toHaveBeenCalledWith(MOCK_CONSTANTS.NEW_PASSWORD);
      expect(updateUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateUserDto.name,
          newPassword: hashedPassword,
          image: updateUserDto.image,
        }),
      );
      expect(result).toEqual(expectedResult);
    });

    test('updateUser 실패 테스트 - 새 비밀번호가 현재 비밀번호와 동일', async () => {
      const updateUserDto = {
        ...MOCK_DATA.updateUserDto,
        newPassword: MOCK_CONSTANTS.ORIGINAL_PASSWORD,
        currentPassword: MOCK_CONSTANTS.ORIGINAL_PASSWORD,
      };

      await expect(userService.updateUser(updateUserDto)).rejects.toMatchObject({
        code: 400,
        message: '새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.',
      });
    });

    test('updateUser 실패 테스트 - 존재하지 않는 사용자', async () => {
      const updateUserDto = MOCK_DATA.updateUserDto;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(null);

      await expect(userService.updateUser(updateUserDto)).rejects.toMatchObject({
        code: 404,
        message: '존재하지 않는 사용자입니다.',
      });
    });

    test('updateUser 실패 테스트 - 현재 비밀번호가 올바르지 않음', async () => {
      const updateUserDto = MOCK_DATA.updateUserDto;
      const mockExistingUser = MOCK_DATA.getUser;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockExistingUser);
      jest.spyOn(passwordUtils, 'isPasswordValid').mockResolvedValue(false);

      await expect(userService.updateUser(updateUserDto)).rejects.toMatchObject({
        code: 400,
        message: '현재 비밀번호가 올바르지 않습니다.',
      });
    });

    test('updateUser 실패 테스트 - prisma 업데이트 에러', async () => {
      const updateUserDto = MOCK_DATA.updateUserDto;
      const mockExistingUser = MOCK_DATA.getUser;
      const hashedPassword = MOCK_CONSTANTS.HASHED_PASSWORD;

      jest.spyOn(userRepository, 'getUserById').mockResolvedValue(mockExistingUser);
      jest.spyOn(passwordUtils, 'isPasswordValid').mockResolvedValue(true);
      jest.spyOn(passwordUtils, 'hashPassword').mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'updateUser').mockRejectedValue(new Error('Prisma Client Error'));
      await expect(userService.updateUser(updateUserDto)).rejects.toThrow('Prisma Client Error');
    });
  });
});
