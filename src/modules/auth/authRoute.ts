import express from 'express';
import authValidator from '@modules/auth/authValidator';
import authController from '@modules/auth/authController';

const authRouter = express.Router();

authRouter.post('/login', authValidator.validateLogin, authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.post('/logout', authController.logout);

export default authRouter;
