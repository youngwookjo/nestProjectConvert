import { Request, Response } from 'express';
import cartService from '@modules/cart/cartService';
import { UpdateCartDto } from '@modules/cart/dto/cartDTO';

class CartController {
  /**
   * 장바구니를 생성하거나 조회합니다.
   *
   * 사용자 ID를 기반으로 장바구니를 생성하거나 기존 장바구니를 조회합니다.
   * 인증된 사용자만 접근 가능하며, 장바구니가 없으면 새로 생성됩니다.
   * 서버 오류로 인해 장바구니 생성/조회에 실패할 수 있습니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 장바구니 정보 (HTTP 201)
   *
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  postCart = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;

    // 장바구니 생성 또는 조회
    const cart = await cartService.createOrGetCart(userId);

    // response 반환
    res.status(201).json(cart);
  };

  /**
   * 장바구니를 조회합니다.
   *
   * 사용자의 장바구니와 장바구니 아이템들을 조회합니다.
   * 각 아이템에는 상품, 스토어, 재고 정보가 포함됩니다.
   * 장바구니가 없으면 빈 장바구니를 생성하고 빈 items 배열을 반환합니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 장바구니 상세 정보 (HTTP 200)
   *
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getCart = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;

    // 장바구니 조회
    const cart = await cartService.getCart(userId);

    // response 반환
    res.status(200).json(cart);
  };

  /**
   * 장바구니를 수정합니다 (아이템 추가/수량 수정).
   *
   * 상품을 장바구니에 추가하거나 기존 아이템의 수량을 수정합니다.
   * 여러 사이즈의 상품을 한 번에 추가/수정할 수 있습니다.
   * 재고가 부족하거나 상품/사이즈가 존재하지 않으면 에러를 반환합니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 수정된 장바구니 아이템 배열 (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 요청 (유효성 검사 실패, 재고 부족)
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 404 - 상품 또는 사이즈를 찾을 수 없음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  updateCart = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const updateCartDto: UpdateCartDto = { ...req.validatedBody };

    // 장바구니 수정
    const updatedItems = await cartService.updateCart(userId, updateCartDto);

    // response 반환
    res.status(200).json(updatedItems);
  };

  /**
   * 장바구니 아이템을 삭제합니다.
   *
   * 특정 장바구니 아이템을 삭제합니다.
   * 아이템의 소유자(장바구니의 사용자)만 삭제할 수 있습니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 204 No Content
   *
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 403 - 권한이 없음 (다른 사용자의 장바구니 아이템)
   * @throws {ApiError} 404 - 장바구니에 아이템이 없음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  deleteCartItem = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const { cartItemId } = req.validatedParams;

    // 장바구니 아이템 삭제
    await cartService.deleteCartItem(userId, cartItemId);

    // response 반환
    res.status(204).send();
  };
}

export default new CartController();
