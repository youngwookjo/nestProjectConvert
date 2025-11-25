import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import { loginSchema } from '@modules/auth/dto/loginDTO';

class AuthValidator {
  validateLogin: RequestHandler = async (req, res, next) => {
    try {
      const parsedBody = {
        email: req.body.email,
        password: req.body.password,
      };
      req.validatedBody = await loginSchema.parseAsync(parsedBody);
      next();
    } catch (err) {
      forwardZodError(err, '로그인', next);
    }
  };
}

export default new AuthValidator();
