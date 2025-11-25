import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import { createUserSchema, updateUserSchema } from '@modules/user/dto/userDTO';

class UserValidator {
  validateCreateUser: RequestHandler = async (req, res, next) => {
    try {
      const parsedBody = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        type: req.body.type,
      };
      req.validatedBody = await createUserSchema.parseAsync(parsedBody);
      next();
    } catch (err) {
      forwardZodError(err, '사용자 생성', next);
    }
  };

  validateUpdateUser: RequestHandler = async (req, res, next) => {
    try {
      const parsedBody = {
        name: req.body.name,
        newPassword: req.body.newPassword,
        currentPassword: req.body.currentPassword,
        image: req.body.image,
      };
      req.validatedBody = await updateUserSchema.parseAsync(parsedBody);
      next();
    } catch (err) {
      forwardZodError(err, '사용자 수정', next);
    }
  };
}

export default new UserValidator();
