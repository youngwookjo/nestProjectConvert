import argon2 from 'argon2';

const PEPPER = process.env.PASSWORD_PEPPER ?? '';

/**
 * 문자열을 유니코드 정규화(NFKC) 방식으로 변환
 */
const normalize = (s: string) => s.normalize('NFKC');

/**
 * 평문 비밀번호 + pepper를 argon2로 해싱
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return argon2.hash(`${PEPPER}${normalize(plain)}`);
};

/**
 * 평문 비밀번호와 해시 비교
 */
export const isPasswordValid = async (plain: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, `${PEPPER}${normalize(plain)}`);
  } catch (err) {
    console.error('비밀번호 검증 중 서버 에러:', err);
    throw new Error('비밀번호 검증 중 서버 에러가 발생했습니다');
  }
};
