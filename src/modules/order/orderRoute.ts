import express from 'express';
import orderController from '@modules/order/orderController';
import orderValidator from '@modules/order/orderValidator';
import { authMiddleware } from '@middlewares/authMiddleware';

const orderRouter = express.Router();

// POST /api/orders - 주문 생성 (인증 필요)
// GET /api/orders - 주문 목록 조회 (인증 필요)
orderRouter
  .route('/')
  .post(authMiddleware, orderValidator.validateCreateOrder, orderController.createOrder)
  .get(authMiddleware, orderValidator.validateGetOrders, orderController.getOrderList);

// DELETE /api/orders/:orderId - 주문 취소 (인증 필요)
orderRouter
  .route('/:orderId')
  .delete(authMiddleware, orderValidator.validateDeleteOrder, orderController.deleteOrder);

export default orderRouter;
