/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: 상품 리뷰 목록 조회
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       orderItemId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *       400:
 *         description: 상품을 찾지 못했습니다
 *   post:
 *     summary: 상품 리뷰 작성
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - rating
 *               - orderItemId
 *             properties:
 *               content:
 *                 type: string
 *                 description: 리뷰 내용 (최소 10자)
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               orderItemId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 rating:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 orderItemId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: 사용자를 찾지 못했습니다 / 상품을 찾지 못했습니다 / 주문 내역을 찾지 못했습니다
 *       403:
 *         description: 본인의 주문 내역에 대해서만 리뷰를 작성할 수 있습니다
 */

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: 리뷰 수정
 *     description: 자신이 작성한 리뷰를 수정합니다. 본인의 리뷰만 수정할 수 있습니다.
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 리뷰 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 description: 리뷰 내용 (최소 10자)
 *                 example: 상품이 정말 마음에 듭니다. 품질도 좋고 배송도 빨라요!
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: 평점 (1-5)
 *                 example: 5
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 rating:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 orderItemId:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *       400:
 *         description: 사용자를 찾지 못했습니다 / 리뷰를 찾지 못했습니다
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
 *                   example: 리뷰를 찾지 못했습니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 본인의 리뷰만 수정할 수 있습니다
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
 *                   example: 본인의 리뷰만 수정할 수 있습니다.
 *   delete:
 *     summary: 리뷰 삭제
 *     description: 자신이 작성한 리뷰를 삭제합니다. 본인의 리뷰만 삭제할 수 있습니다.
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 리뷰 ID
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       400:
 *         description: 사용자를 찾지 못했습니다 / 리뷰를 찾지 못했습니다
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
 *                   example: 리뷰를 찾지 못했습니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 본인의 리뷰만 삭제할 수 있습니다
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
 *                   example: 본인의 리뷰만 삭제할 수 있습니다.
 */
