/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 주문 생성
 *     description: 여러 상품을 포함한 주문을 생성합니다. 재고 차감, 포인트 사용, 결제 정보 생성이 트랜잭션으로 처리됩니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *               - orderItems
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 description: 주문자 이름
 *                 example: 홍길동
 *               phone:
 *                 type: string
 *                 minLength: 1
 *                 description: 전화번호
 *                 example: 010-1234-5678
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 description: 배송 주소
 *                 example: 서울시 강남구 테헤란로 123
 *               orderItems:
 *                 type: array
 *                 minItems: 1
 *                 description: 주문할 상품 목록
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - sizeId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: CUID 형식의 상품 ID
 *                       example: clh1234567890
 *                     sizeId:
 *                       type: integer
 *                       description: 사이즈 ID (양의 정수)
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: 수량 (양의 정수)
 *                       example: 2
 *               usePoint:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: 사용할 포인트 (0 이상)
 *                 example: 5000
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 subtotal:
 *                   type: integer
 *                   description: 총 주문 금액
 *                 totalQuantity:
 *                   type: integer
 *                   description: 총 수량
 *                 usePoint:
 *                   type: integer
 *                   description: 사용한 포인트
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       sizeId:
 *                         type: integer
 *                       price:
 *                         type: integer
 *                         description: 주문 시점의 상품 가격
 *                       quantity:
 *                         type: integer
 *                       isReviewed:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                             nullable: true
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           size:
 *                             type: object
 *                             properties:
 *                               en:
 *                                 type: string
 *                               ko:
 *                                 type: string
 *                 payments:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     price:
 *                       type: integer
 *                       description: 최종 결제 금액 (subtotal - usePoint)
 *                     status:
 *                       type: string
 *                       example: CompletedPayment
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 주문 아이템이 없습니다 / 재고 부족 / 포인트 부족 / 사용 포인트가 주문 금액을 초과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '사용 가능한 포인트가 부족합니다. (보유: 3000, 요청: 5000)'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 상품 ID clh1234567890를 찾을 수 없습니다.
 *   get:
 *     summary: 주문 목록 조회
 *     description: 로그인한 사용자의 주문 목록을 조회합니다. 페이지네이션을 지원하며, 주문 상태로 필터링할 수 있습니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *           minimum: 1
 *         description: 페이지당 아이템 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 주문 상태 필터 (optional)
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       address:
 *                         type: string
 *                       subtotal:
 *                         type: integer
 *                       totalQuantity:
 *                         type: integer
 *                       usePoint:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       orderItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             price:
 *                               type: integer
 *                             quantity:
 *                               type: integer
 *                             productId:
 *                               type: string
 *                             isReviewed:
 *                               type: boolean
 *                             product:
 *                               type: object
 *                               description: 상품 상세 정보 (store, stocks, reviews 포함)
 *                             size:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 size:
 *                                   type: object
 *                                   properties:
 *                                     en:
 *                                       type: string
 *                                     ko:
 *                                       type: string
 *                       payments:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           orderId:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 전체 주문 수
 *                     page:
 *                       type: integer
 *                       description: 현재 페이지
 *                     limit:
 *                       type: integer
 *                       description: 페이지당 아이템 수
 *                     totalPages:
 *                       type: integer
 *                       description: 전체 페이지 수
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: 주문 취소
 *     description: 결제 완료된 주문을 취소합니다. 재고가 복원되고 사용한 포인트가 환불됩니다. 본인의 주문만 취소할 수 있습니다.
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 주문 ID
 *     responses:
 *       200:
 *         description: 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               nullable: true
 *       400:
 *         description: 결제 완료된 주문만 취소할 수 있습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 결제 완료된 주문만 취소할 수 있습니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 사용자를 찾을 수 없습니다 (본인 주문이 아님)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: 사용자를 찾을 수 없습니다.
 *       404:
 *         description: 주문을 찾을 수 없습니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 주문을 찾을 수 없습니다.
 */
