import { Request, Response } from 'express';
import authService from '@modules/auth/authService';
import type { LoginDto } from '@modules/auth/dto/loginDTO';
import { ApiError } from '@errors/ApiError';

class AuthController {
  /**
   * @description
   * 로그인 요청을 처리합니다.
   * 로그인을 시도하는 사용자의 이메일과 비밀번호를 받아 인증을 수행합니다.
   * 인증에 성공하면 액세스 토큰과 사용자 정보를 반환합니다.
   *
   * @param req - Express 요청 객체
   * @param res - Express 응답 객체
   *
   * @returns {Object} 사용자 정보와 액세스 토큰
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 401 - 인증 실패 (잘못된 이메일 또는 비밀번호)
   * @throws {ApiError} 500 - 서버 내부 오류
   */

  login = async (req: Request, res: Response) => {
    const loginDto: LoginDto = { ...req.validatedBody };
    const tokens = await authService.login(loginDto);
    const { refreshToken, ...resUser } = tokens;

    // 배포 환경에서는 https로 무조건 설정
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // 개발: lax, 프로덕션: none
      path: '/',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
    res.json(resUser);
  };

  /**
   * @description
   * 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.
   * 리프레시 토큰은 쿠키에서 추출되며, 유효한 경우 새로운 액세스 토큰을 반환합니다.
   *
   * @param req - Express 요청 객체
   * @param res - Express 응답 객체
   * @return {Object} 새로운 액세스 토큰
   * @throws {ApiError} 401 - 리프레시 토큰이 없거나 유효하지 않은 경우
   * @throws {ApiError} 500 - 서버 내부 오류
   */

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw ApiError.unauthorized('리프레시 토큰이 없습니다.');
    }

    const accessToken = await authService.refreshToken(refreshToken);
    res.json({ accessToken });
  };

  logout = async (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    res.status(204).send();
  };
}

export default new AuthController();
