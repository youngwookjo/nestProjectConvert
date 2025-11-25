import { Request, Response } from 'express';
import orderService from '@modules/order/orderService';
import { CreateOrderDto, GetOrdersQueryDto } from '@modules/order/dto/orderDTO';

class OrderController {
  /**
   * 주문을 생성합니다.
   *
   * 사용자 ID와 주문 정보를 기반으로 주문을 생성합니다.
   * 인증된 사용자만 접근 가능하며, 주문 생성 시 재고 차감 및 포인트 차감이 이루어집니다.
   * 여러 스토어의 상품들을 하나의 주문에 포함할 수 있습니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 주문 상세 정보 (HTTP 201)
   *
   * @throws {ApiError} 400 - 잘못된 요청 (유효성 검사 실패, 재고 부족, 포인트 부족)
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 404 - 상품을 찾을 수 없음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  createOrder = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const createOrderDto: CreateOrderDto = { ...req.validatedBody };

    // 주문 생성
    const order = await orderService.createOrder(userId, createOrderDto);

    // response 반환
    res.status(201).json(order);
  };

  /**
   * 로그인한 사용자의 주문 목록을 조회합니다.
   *
   * 페이지네이션을 지원하며, 주문 상태로 필터링할 수 있습니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns 주문 목록 및 페이지네이션 정보 (HTTP 200)
   *
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getOrderList = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const query: GetOrdersQueryDto = { ...req.validatedQuery };

    // 주문 목록 조회
    const orders = await orderService.getOrderList(userId, query);

    // response 반환
    res.status(200).json(orders);
  };

  /**
   * 주문을 취소합니다.
   *
   * 주문 상태가 "CompletedPayment"인 경우에만 취소할 수 있습니다.
   * 주문 취소 시 재고가 복원되고 사용한 포인트가 환불됩니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns null (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 요청 (주문 상태가 결제 대기 중이 아님)
   * @throws {ApiError} 401 - 인증되지 않은 사용자
   * @throws {ApiError} 403 - 사용자를 찾을 수 없습니다 (본인 주문이 아님)
   * @throws {ApiError} 404 - 주문을 찾을 수 없습니다
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  deleteOrder = async (req: Request, res: Response) => {
    // 전달할 파라미터 정의
    const userId = req.user.id;
    const { orderId } = req.validatedParams;

    // 주문 취소
    await orderService.deleteOrder(userId, orderId);

    // response 반환
    res.status(200).json(null);
  };
}

export default new OrderController();
