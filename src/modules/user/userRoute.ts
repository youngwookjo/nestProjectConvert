import express from 'express';
import userValidator from '@modules/user/userValidator';
import userController from '@modules/user/userController';
import { authMiddleware } from '@middlewares/authMiddleware';
import { uploadSingleImage } from '@middlewares/s3Middleware';

const userRouter = express.Router();

//회원가입
userRouter.route('/').post(userValidator.validateCreateUser, userController.createUser);
//내 정보 조회, 수정
userRouter
  .route('/me')
  .get(authMiddleware, userController.getUser)
  .patch(
    authMiddleware,
    uploadSingleImage,
    userValidator.validateUpdateUser,
    userController.updateUser,
  );
//회원탈퇴
userRouter.delete('/delete', authMiddleware, userController.deleteUser);
//좋아하는 store 목록 조회
userRouter.get('/me/likes', authMiddleware, userController.getFavoriteStoreList);

export default userRouter;
