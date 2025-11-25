import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import {
  createOrderSchema,
  getOrdersQuerySchema,
  deleteOrderParamsSchema,
} from '@modules/order/dto/orderDTO';

class OrderValidator {
  validateCreateOrder: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        orderItems: req.body.orderItems,
        usePoint: req.body.usePoint,
      };

      // 2. 스키마에 맞춰 유효성 검사 후 validatedBody에 저장
      req.validatedBody = await createOrderSchema.parseAsync(parsedBody);
      next();
    } catch (err) {
      forwardZodError(err, '주문 생성', next);
    }
  };

  validateGetOrders: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedQuery = {
        status: req.query.status,
        limit: req.query.limit,
        page: req.query.page,
      };

      // 2. 스키마에 맞춰 유효성 검사 후 validatedQuery에 저장
      req.validatedQuery = await getOrdersQuerySchema.parseAsync(parsedQuery);
      next();
    } catch (err) {
      forwardZodError(err, '주문 목록 조회', next);
    }
  };

  validateDeleteOrder: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        orderId: req.params.orderId,
      };

      // 2. 스키마에 맞춰 유효성 검사 후 validatedParams에 저장
      req.validatedParams = await deleteOrderParamsSchema.parseAsync(parsedParams);
      next();
    } catch (err) {
      forwardZodError(err, '주문 취소', next);
    }
  };
}

export default new OrderValidator();
