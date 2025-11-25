import { Request, Response } from 'express';
import inquiryService from '@modules/inquiry/inquiryService';
import {
  CreateInquiryDTO,
  GetMyInquiryListDTO,
  UpdateInquiryDTO,
  InquiryReplyDTO,
} from '@modules/inquiry/dto/inquiryDTO';

class InquiryController {
  /**
   * @description
   * 특정 상품의 새로운 문의를 생성합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 생성된 문의 정보 (HTTP 201)
   *
   * @throws {ApiError} 404 - 존재하지 않는 상품
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  createInquiry = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: productId } = req.validatedParams;
    const createInquiryDto: CreateInquiryDTO = { ...req.validatedBody };

    // 2. 문의 생성
    const inquiry = await inquiryService.createInquiry(userId, productId, createInquiryDto);

    res.status(201).json(inquiry);
  };

  /**
   * @description
   * 특정 상품의 문의 목록을 조회합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 문의 목록 (HTTP 200)
   *
   * @throws {ApiError} 404 - 존재하지 않는 상품
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getInquiryList = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const { id: productId } = req.validatedParams;

    // 2. 문의 목록 조회
    const inquiries = await inquiryService.getInquiryList(productId);

    res.status(200).json(inquiries);
  };

  /**
   * @description
   * 내 문의 목록을 조회합니다.
   * 구매자일 경우 등록한 문의
   * 판매자일 경우 등록한 상품에 있는 문의
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @throws {ApiError} 404 - 유저를 찾을 수 없음
   * @throws {ApiError} 404 - 스토어를 찾을 수 없음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getMyInquiryList = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const getMyInquiryListDTO: GetMyInquiryListDTO = { ...req.validatedQuery };

    // 2. 내 문의 목록 조회
    const inquiries = await inquiryService.getMyInquiryList(userId, getMyInquiryListDTO);

    res.status(200).json(inquiries);
  };

  /**
   * @description
   * 특정 문의의 상세 정보를 조회합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 문의 상세 정보 (HTTP 200)
   *
   * @throws {ApiError} 404 - 문의를 찾을 수 없음
   */
  getInquiry = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const { id: inquiryId } = req.validatedParams;

    // 2. 문의 상세 조회
    const inquiry = await inquiryService.getInquiry(inquiryId);

    res.status(200).json(inquiry);
  };

  /**
   * @description
   * 특정 문의를 수정합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 수정된 문의 정보 (HTTP 200)
   *
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 존재하지 않는 문의
   */
  updateInquiry = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: inquiryId } = req.validatedParams;
    const updateInquiryDto: UpdateInquiryDTO = { ...req.validatedBody };

    // 2. 문의 수정
    const updatedInquiry = await inquiryService.updateInquiry(userId, inquiryId, updateInquiryDto);

    res.status(200).json(updatedInquiry);
  };

  /**
   * @description
   * 특정 문의를 삭제합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 삭제된 문의 정보 (HTTP 200)
   *
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 존재하지 않는 문의
   */
  deleteInquiry = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: inquiryId } = req.validatedParams;

    // 2. 문의 삭제
    const deletedInquiry = await inquiryService.deleteInquiry(userId, inquiryId);

    res.status(200).json(deletedInquiry);
  };

  /**
   * @description
   * 특정 문의에 답변을 등록합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 생성된 답변 정보 (HTTP 201)
   *
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 존재하지 않는 문의
   * @throws {ApiError} 409 - 이미 답변이 등록된 문의
   */
  createInquiryReply = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: inquiryId } = req.validatedParams;
    const inquiryReplyDto: InquiryReplyDTO = { ...req.validatedBody };

    // 2. 문의 답변 생성
    const inquiryReply = await inquiryService.createInquiryReply(
      userId,
      inquiryId,
      inquiryReplyDto,
    );

    res.status(201).json(inquiryReply);
  };

  /**
   * @description
   * 특정 문의에 등록된 답변을 수정합니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 수정된 답변 정보 (HTTP 200)
   *
   * @throws {ApiError} 403 - 권한 없음
   * @throws {ApiError} 404 - 존재하지 않는 답변
   */
  updateInquiryReply = async (req: Request, res: Response) => {
    // 1. 파라미터 정의
    const userId = req.user.id;
    const { id: replyId } = req.validatedParams;
    const inquiryReplyDto: InquiryReplyDTO = { ...req.validatedBody };

    // 2. 문의 답변 수정
    const updatedInquiryReply = await inquiryService.updateInquiryReply(
      userId,
      replyId,
      inquiryReplyDto,
    );

    res.status(200).json(updatedInquiryReply);
  };
}

export default new InquiryController();
