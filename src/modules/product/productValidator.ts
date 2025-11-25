import type { RequestHandler } from 'express';
import { forwardZodError } from '@utils/zod';
import {
  createProductSchema,
  getProductListSchema,
  updateProductSchema,
  productIdSchema,
} from '@modules/product/dto/productDTO';

class ProductValidator {
  validateCreateProduct: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        name: req.body.name,
        categoryName: req.body.categoryName.toUpperCase(),
        price: req.body.price,
        image: req.body.image ?? null,
        discountRate: req.body.discountRate ?? 0,
        discountStartTime: req.body.discountStartTime,
        discountEndTime: req.body.discountEndTime,
        content: req.body.content,
        stocks: JSON.parse(req.body.stocks), // stocks는 JSON 배열로 올 것임
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await createProductSchema.parseAsync(parsedBody);

      next();
    } catch (err) {
      forwardZodError(err, '상품 등록', next);
    }
  };

  validateGetProductList: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedQuery = {
        page: req.query.page,
        pageSize: req.query.pageSize,
        search: req.query.search as string | undefined,
        sort: req.query.sort as string | undefined,
        priceMin: req.query.priceMin,
        priceMax: req.query.priceMax,
        size: req.query.size as string | undefined,
        favoriteStore: req.query.favoriteStore ? (req.query.favoriteStore as string) : undefined,
        categoryName: req.query.categoryName
          ? (req.query.categoryName as string).toUpperCase()
          : undefined,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedQuery = await getProductListSchema.parseAsync(parsedQuery);

      next();
    } catch (err) {
      forwardZodError(err, '상품 목록 조회', next);
    }
  };

  validateUpdateProduct: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedBody = {
        name: req.body.name,
        categoryName: req.body.categoryName ? req.body.categoryName.toUpperCase() : undefined,
        price: req.body.price,
        image: req.body.image,
        discountRate: req.body.discountRate,
        discountStartTime: req.body.discountStartTime,
        discountEndTime: req.body.discountEndTime,
        content: req.body.content,
        stocks: JSON.parse(req.body.stocks), // stocks는 JSON 배열로 올 것임 + 필수값이라 무조건 들어옴
      };
      const parsedParams = {
        id: req.params.productId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedBody = await updateProductSchema.parseAsync(parsedBody);
      req.validatedParams = await productIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '상품 수정', next);
    }
  };

  validateGetProduct: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        id: req.params.productId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedParams = await productIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '상품 조회', next);
    }
  };

  validateDeleteProduct: RequestHandler = async (req, res, next) => {
    try {
      // 1. 검사할 속성 정의
      const parsedParams = {
        id: req.params.productId,
      };

      // 2. 스키마에 맞춰 유효성 검사
      req.validatedParams = await productIdSchema.parseAsync(parsedParams);

      next();
    } catch (err) {
      forwardZodError(err, '상품 삭제', next);
    }
  };
}

export default new ProductValidator();
