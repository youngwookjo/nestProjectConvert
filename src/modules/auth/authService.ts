import usersService from '@modules/user/userService';
import tokenUtils from '@modules/auth/utils/tokenUtils';
import { isPasswordValid } from '@modules/auth/utils/passwordUtils';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
import type { LoginDto, LoginResponseDto } from '@modules/auth/dto/loginDTO';

class AuthService {
  login = async (loginDto: LoginDto): Promise<LoginResponseDto> => {
    const message = '사용자 또는 비밀번호가 올바르지 않습니다.';
    const user = await usersService.getUserByEmail(loginDto.email);
    assert(user, ApiError.notFound(message));

    const isValid = await isPasswordValid(loginDto.password, user.password);
    assert(isValid, ApiError.unauthorized(message));

    const accessToken = tokenUtils.generateAccessToken({ id: user.id });
    const refreshToken = tokenUtils.generateRefreshToken({ id: user.id });

    const data: LoginResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        points: user.points,
        image: user.image ?? null,
        grade: {
          id: user.grade.id,
          name: user.grade.name,
          discountRate: user.grade.rate,
          minAmount: user.grade.minAmount,
        },
      },
      accessToken,
      refreshToken,
    };
    return data;
  };

  refreshToken = (refreshToken: string): string => {
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);
    const accessToken = tokenUtils.generateAccessToken({ id: decoded.id });
    return accessToken;
  };
}

export default new AuthService();
