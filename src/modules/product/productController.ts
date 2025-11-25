import { Request, Response } from 'express';
import productService from '@modules/product/productService';
import {
  CreateProductDto,
  GetProductListDto,
  UpdateProductDto,
} from '@modules/product/dto/productDTO';

class ProductController {
  /**
   * @description
   * 새로운 상품을 생성합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 생성된 상품 정보 (HTTP 201)
   *
   * @throws {ApiError} 404 - 존재하지 않는 스토어 또는 존재하지 않는 카테고리
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  createProduct = async (req: Request, res: Response) => {
    // 1. DTO 생성 (validator + 인증 미들웨어로 검증한 데이터 사용)
    const userId = req.user.id;
    const createProductDto: CreateProductDto = { ...req.validatedBody };

    // 2. 상품 목록 조회
    const product = await productService.createProduct(userId, createProductDto);

    res.status(201).json(product);
  };

  /**
   * @description
   * 상품 목록을 조회합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 상품 목록 (HTTP 200)
   *
   * @throws {ApiError} 404 - 존재하지 않는 카테고리
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getProductList = async (req: Request, res: Response) => {
    // 1. DTO 생성 (validator로 검증한 데이터 사용)
    const getProductListDto: GetProductListDto = { ...req.validatedQuery };

    // 2. 상품 목록 조회
    const products = await productService.getProductList(getProductListDto);

    res.status(200).json(products);
  };

  /**
   * @description
   * 상품 정보를 수정합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 수정된 상품 정보 (HTTP 200)
   *
   * @throws {ApiError} 403 - 상품 수정 권한이 없음
   * @throws {ApiError} 404 - 존재하지 않는 상품, 존재하지 않는 스토어 또는 존재하지 않는 카테고리
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  updateProduct = async (req: Request, res: Response) => {
    // 1. DTO 생성 (validator + 인증 미들웨어로 검증한 데이터 사용)
    const userId = req.user.id;
    const { id: productId } = req.validatedParams;
    const updateProductDto: UpdateProductDto = { ...req.validatedBody };

    // 2. 상품 수정
    const product = await productService.updateProduct(userId, productId, updateProductDto);

    res.status(200).json(product);
  };

  /**
   * @description
   * 특정 상품의 상세 정보를 조회합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 상품 상세 정보 (HTTP 200)
   *
   * @throws {ApiError} 404 - 존재하지 않는 상품
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getProduct = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const { id: productId } = req.validatedParams;

    // 2. 상품 조회
    const product = await productService.getProduct(productId);

    res.status(200).json(product);
  };

  /**
   * @description
   * 상품을 삭제합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {void} (HTTP 204)
   *
   * @throws {ApiError} 403 - 상품 삭제 권한이 없음
   * @throws {ApiError} 404 - 존재하지 않는 상품 또는 존재하지 않는 스토어
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  deleteProduct = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: productId } = req.validatedParams;

    // 2. 상품 삭제
    await productService.deleteProduct(userId, productId);

    res.status(204).send();
  };
}

export default new ProductController();
