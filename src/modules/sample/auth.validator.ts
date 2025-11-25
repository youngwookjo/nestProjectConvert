import type { RequestHandler } from 'express';
import { forwardZodError } from '../../utils/zod';
import { authCreateSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';

const validateAuthRegister: RequestHandler = async (req, res, next) => {
  try {
    const parsedBody = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      profileImage: req.body.profileImage,
    };
    await authCreateSchema.parseAsync(parsedBody);
    next();
  } catch (err) {
    forwardZodError(err, '사용자 등록', next);
  }
};

const validateAuthLogin: RequestHandler = async (req, res, next) => {
  try {
    const parsedBody = {
      email: req.body.email,
      password: req.body.password,
    };
    await loginSchema.parseAsync(parsedBody);
    next();
  } catch (err) {
    forwardZodError(err, '사용자 로그인', next);
  }
};

export default {
  validateAuthRegister,
  validateAuthLogin,
};
