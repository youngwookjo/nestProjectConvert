import express from 'express';
import cartController from '@modules/cart/cartController';
import cartValidator from '@modules/cart/cartValidator';
import { authMiddleware } from '@middlewares/authMiddleware';

const cartRouter = express.Router();

// POST /api/cart - 장바구니 생성 또는 조회 (인증 필요)
// GET /api/cart - 장바구니 조회 (인증 필요)
// PATCH /api/cart - 장바구니 수정 (아이템 추가/수량 수정) (인증 필요)
cartRouter
  .route('/')
  .post(authMiddleware, cartController.postCart)
  .get(authMiddleware, cartController.getCart)
  .patch(authMiddleware, cartValidator.validateUpdateCart, cartController.updateCart);

// DELETE /api/cart/items/:cartItemId - 장바구니 아이템 삭제 (인증 필요)
cartRouter
  .route('/:cartItemId')
  .delete(authMiddleware, cartValidator.validateDeleteCartItem, cartController.deleteCartItem);

export default cartRouter;
