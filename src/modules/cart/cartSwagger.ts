/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: 장바구니 생성 또는 조회
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 장바구니 조회/생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: clh1234567890
 *                 buyerId:
 *                   type: string
 *                   example: clh0987654321
 *                 quantity:
 *                   type: integer
 *                   example: 3
 *                   description: 장바구니 내 전체 아이템 수량 합계
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: 장바구니 조회 (상세 정보 포함)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 buyerId:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                   description: 전체 아이템 수량 합계
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       cartId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       sizeId:
 *                         type: integer
 *                       quantity:
 *                         type: integer
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
 *                           storeId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           image:
 *                             type: string
 *                             nullable: true
 *                           discountRate:
 *                             type: integer
 *                           discountStartTime:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           discountEndTime:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           store:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               userId:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               address:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *                               content:
 *                                 type: string
 *                               image:
 *                                 type: string
 *                                 nullable: true
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                           stocks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 productId:
 *                                   type: string
 *                                 sizeId:
 *                                   type: integer
 *                                 quantity:
 *                                   type: integer
 *                                 size:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                     size:
 *                                       type: object
 *                                       properties:
 *                                         en:
 *                                           type: string
 *                                         ko:
 *                                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   patch:
 *     summary: 장바구니 아이템 추가/수정
 *     description: 여러 사이즈의 상품을 한 번에 추가하거나 수량을 수정합니다.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - sizes
 *             properties:
 *               productId:
 *                 type: string
 *                 description: CUID 형식의 상품 ID
 *                 example: clh1234567890
 *               sizes:
 *                 type: array
 *                 description: 추가할 사이즈별 수량 정보 (최소 1개)
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - sizeId
 *                     - quantity
 *                   properties:
 *                     sizeId:
 *                       type: integer
 *                       description: 사이즈 ID (양의 정수)
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       description: 수량 (양의 정수)
 *                       minimum: 1
 *                       example: 2
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   cartId:
 *                     type: string
 *                   productId:
 *                     type: string
 *                   sizeId:
 *                     type: integer
 *                   quantity:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: 재고가 부족합니다
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
 *                   example: '사이즈 ID 1의 재고가 부족합니다. (요청: 10, 재고: 5)'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 상품을 찾을 수 없습니다 / 사이즈에 대한 재고를 찾을 수 없습니다
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
 *                   example: 상품을 찾을 수 없습니다.
 */

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   delete:
 *     summary: 장바구니 아이템 삭제
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 장바구니 아이템 ID
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 접근 권한이 없습니다
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
 *                   example: 접근 권한이 없습니다.
 *       404:
 *         description: 장바구니에 아이템이 없습니다
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
 *                   example: 장바구니에 아이템이 없습니다.
 */
