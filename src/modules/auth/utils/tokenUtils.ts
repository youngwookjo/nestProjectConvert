import jwt from 'jsonwebtoken';
import type { DecodedToken } from '@modules/auth/dto/tokenDTO';
import { ApiError } from '@errors/ApiError';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('❌ Invalid ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET');
}

// TypeScript를 위한 타입 단언
const ACCESS_TOKEN_SECRET = ACCESS_SECRET as string;
const REFRESH_TOKEN_SECRET = REFRESH_SECRET as string;

class TokenUtils {
  generateAccessToken = (user: { id: string }): string => {
    try {
      return jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    } catch (err) {
      throw ApiError.internal('❌ Access Token 생성에 실패했습니다.');
    }
  };

  verifyAccessToken = (token: string): DecodedToken => {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as unknown as DecodedToken;
    } catch {
      throw ApiError.unauthorized('❌ Access Token이 유효하지 않습니다.');
    }
  };

  generateRefreshToken = (user: { id: string }): string => {
    try {
      return jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '14d' });
    } catch (err) {
      throw ApiError.internal('❌ Refresh Token 생성에 실패했습니다.');
    }
  };

  verifyRefreshToken = (token: string): DecodedToken => {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as unknown as DecodedToken;
    } catch {
      throw ApiError.unauthorized('❌ Refresh Token이 유효하지 않습니다.');
    }
  };
}

export default new TokenUtils();
