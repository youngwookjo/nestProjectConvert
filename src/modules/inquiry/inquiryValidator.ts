import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import {
  createInquirySchema,
  getMyInquiryListSchema,
  inquiryIdSchema,
  updateInquirySchema,
  InquiryReplySchema,
  replyIdSchema,
} from '@modules/inquiry/dto/inquiryDTO';
import { productIdSchema } from '@modules/product/dto/productDTO';

class InquiryValidator {
  validateCreateInquiry: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        title: req.body.title,
        content: req.body.content,
        isSecret: req.body.isSecret,
      };

      const parsedParams = {
        id: req.params.productId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await createInquirySchema.parseAsync(parsedBody);
      req.validatedParams = await productIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '상품 문의 등록', next);
    }
  };

  validateGetInquiryList: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        id: req.params.productId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedParams = await productIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '상품 문의 목록 조회', next);
    }
  };

  validateGetMyInquiryList: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedQuery = {
        page: req.query.page,
        pageSize: req.query.pageSize,
        status: req.query.status,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedQuery = await getMyInquiryListSchema.parseAsync(parsedQuery);

      next();
    } catch (err) {
      forwardZodError(err, '내 문의 목록 조회', next);
    }
  };

  validateGetInquiry: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        id: req.params.inquiryId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedParams = await inquiryIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '내 문의 목록 조회', next);
    }
  };

  validateUpdateInquiry: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        title: req.body.title,
        content: req.body.content,
        isSecret: req.body.isSecret,
      };

      const parsedParams = {
        id: req.params.inquiryId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await updateInquirySchema.parseAsync(parsedBody);
      req.validatedParams = await inquiryIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '문의 수정', next);
    }
  };

  validateDeleteInquiry: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        id: req.params.inquiryId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedParams = await inquiryIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '문의 삭제', next);
    }
  };

  validateCreateInquiryReply: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        content: req.body.content,
      };

      const parsedParams = {
        id: req.params.inquiryId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await InquiryReplySchema.parseAsync(parsedBody);
      req.validatedParams = await inquiryIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '문의 답변 등록', next);
    }
  };

  validateUpdateInquiryReply: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        content: req.body.content,
      };

      const parsedParams = {
        id: req.params.replyId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await InquiryReplySchema.parseAsync(parsedBody);
      req.validatedParams = await replyIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '문의 답변 수정', next);
    }
  };
}

export default new InquiryValidator();
