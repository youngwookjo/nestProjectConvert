/**
 * @swagger
 * /api/products/{productId}/inquiries:
 *   get:
 *     summary: 상품 문의 목록 조회
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
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
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       isSecret:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                         enum: [WaitingAnswer, AnswerCompleted]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: integer
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *   post:
 *     summary: 상품 문의 작성
 *     tags: [Inquiry]
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
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 제목 (최소 1자)
 *               content:
 *                 type: string
 *                 description: 내용 (최소 1자)
 *               isSecret:
 *                 type: boolean
 *                 default: false
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
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 isSecret:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 상품을 찾을 수 없습니다
 */

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     summary: 내 문의 목록 조회
 *     description: 구매자는 자신이 등록한 문의 목록을 조회하고, 판매자는 자신의 스토어 상품에 등록된 문의 목록을 조회합니다.
 *     tags: [Inquiry]
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: 페이지당 아이템 수
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WaitingAnswer, CompletedAnswer]
 *         description: 문의 상태 필터
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: clh1234567890
 *                       title:
 *                         type: string
 *                         example: 배송 문의드립니다
 *                       isSecret:
 *                         type: boolean
 *                         example: false
 *                       status:
 *                         type: string
 *                         enum: [WaitingAnswer, CompletedAnswer]
 *                         example: CompletedAnswer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       content:
 *                         type: string
 *                         example: 언제 배송되나요?
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
 *                           store:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                 totalCount:
 *                   type: integer
 *                   example: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 유저를 찾을 수 없습니다 / 스토어를 찾을 수 없습니다
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
 *                   example: 유저를 찾을 수 없습니다.
 */

/**
 * @swagger
 * /api/inquiries/{inquiryId}:
 *   get:
 *     summary: 문의 상세 조회
 *     description: 특정 문의의 상세 정보와 답변을 조회합니다.
 *     tags: [Inquiry]
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 문의 ID
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
 *                   example: clh1234567890
 *                 userId:
 *                   type: string
 *                 productId:
 *                   type: string
 *                 title:
 *                   type: string
 *                   example: 배송 문의드립니다
 *                 content:
 *                   type: string
 *                   example: 언제 배송되나요?
 *                 isSecret:
 *                   type: boolean
 *                   example: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [WaitingAnswer, CompletedAnswer]
 *                   example: CompletedAnswer
 *                 reply:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     content:
 *                       type: string
 *                       example: 2-3일 내에 배송될 예정입니다.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                           example: 판매자명
 *       404:
 *         description: 문의가 존재하지 않습니다
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
 *                   example: 문의가 존재하지 않습니다.
 *   patch:
 *     summary: 문의 수정
 *     description: 자신이 등록한 문의를 수정합니다. 답변이 등록되기 전(WaitingAnswer 상태)에만 수정할 수 있습니다.
 *     tags: [Inquiry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 문의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 example: 배송 문의드립니다
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: 언제 배송되나요?
 *               isSecret:
 *                 type: boolean
 *                 example: false
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
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 isSecret:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [WaitingAnswer, CompletedAnswer]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 자신이 등록한 문의만 수정할 수 있습니다 / 답변이 등록된 문의는 수정할 수 없습니다
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
 *                   example: 답변이 등록된 문의는 수정할 수 없습니다.
 *       404:
 *         description: 문의를 찾을 수 없습니다
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
 *                   example: 문의를 찾을 수 없습니다.
 *   delete:
 *     summary: 문의 삭제
 *     description: 자신이 등록한 문의를 삭제합니다.
 *     tags: [Inquiry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 문의 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
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
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 isSecret:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   enum: [WaitingAnswer, CompletedAnswer]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 자신이 등록한 문의만 삭제할 수 있습니다
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
 *                   example: 자신이 등록한 문의만 삭제할 수 있습니다.
 *       404:
 *         description: 문의를 찾을 수 없습니다
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
 *                   example: 문의를 찾을 수 없습니다.
 */

/**
 * @swagger
 * /api/inquiries/{inquiryId}/replies:
 *   post:
 *     summary: 문의 답변 작성
 *     description: 판매자가 문의에 대한 답변을 작성합니다. 해당 상품의 판매자만 답변을 작성할 수 있습니다.
 *     tags: [Inquiry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiryId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 문의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: 2-3일 내에 배송될 예정입니다.
 *     responses:
 *       201:
 *         description: 답변 작성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: clh0987654321
 *                 inquiryId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 content:
 *                   type: string
 *                   example: 2-3일 내에 배송될 예정입니다.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 판매자만 답변을 등록할 수 있습니다 / 해당 상품의 판매자만 답변을 등록할 수 있습니다
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
 *                   example: 판매자만 답변을 등록할 수 있습니다.
 *       404:
 *         description: 문의를 찾을 수 없습니다 / 유저를 찾을 수 없습니다 / 상품을 찾을 수 없습니다
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
 *                   example: 문의를 찾을 수 없습니다.
 *       409:
 *         description: 이미 답변이 등록된 문의입니다
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: 이미 답변이 등록된 문의입니다.
 */

/**
 * @swagger
 * /api/inquiries/{replyId}/replies:
 *   patch:
 *     summary: 문의 답변 수정
 *     description: 자신이 작성한 답변을 수정합니다.
 *     tags: [Inquiry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 답변 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 example: 수정된 답변 내용입니다.
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
 *                 inquiryId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 자신이 등록한 답변만 수정할 수 있습니다
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
 *                   example: 자신이 등록한 답변만 수정할 수 있습니다.
 *       404:
 *         description: 답변을 찾을 수 없습니다
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
 *                   example: 답변을 찾을 수 없습니다.
 */
