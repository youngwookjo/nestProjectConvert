/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: 스토어 생성
 *     description: 판매자가 새로운 스토어를 생성합니다. 판매자만 생성할 수 있으며, 한 판매자당 하나의 스토어만 생성 가능합니다.
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - phoneNumber
 *               - content
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 description: 스토어 이름 (특수문자 불가)
 *                 example: 패션스토어
 *               address:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 200
 *                 description: 주소
 *                 example: 서울시 강남구 테헤란로 123
 *               detailAddress:
 *                 type: string
 *                 maxLength: 20
 *                 description: 상세주소 (optional)
 *                 example: 3층 301호
 *               phoneNumber:
 *                 type: string
 *                 pattern: ^01[0|1|6|7|8|9]-[0-9]{3,4}-[0-9]{4}$
 *                 description: 전화번호 (010-1234-5678 형식)
 *                 example: 010-1234-5678
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: 스토어 소개
 *                 example: 트렌디한 패션 아이템을 판매합니다
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 스토어 이미지 (optional)
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 address:
 *                   type: string
 *                 detailAddress:
 *                   type: string
 *                   nullable: true
 *                 phoneNumber:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: 스토어는 판매자만 만들수 있습니다
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
 *                   example: 스토어는 판매자만 만들수 있습니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 존재하지 않는 유저입니다
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
 *                   example: 존재하지 않는 유저입니다.
 *       409:
 *         description: 이미 스토어가 있습니다
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
 *                   example: 이미 스토어가 있습니다.
 */

/**
 * @swagger
 * /api/stores/detail/my/product:
 *   get:
 *     summary: 내 스토어 상품 목록 조회
 *     description: 로그인한 판매자의 스토어에 등록된 상품 목록을 조회합니다. 페이지네이션을 지원합니다.
 *     tags: [Store]
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
 *           maximum: 100
 *         description: 페이지당 아이템 수
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   stock:
 *                     type: integer
 *                     description: 총 재고 수량
 *                   isDiscount:
 *                     type: boolean
 *                     description: 할인 중 여부
 *                   isSoldOut:
 *                     type: boolean
 *                     description: 품절 여부
 *                   image:
 *                     type: string
 *                     nullable: true
 *                     description: 상품 대표 이미지 URL
 *                   totalCount:
 *                     type: integer
 *                     description: 전체 상품 수
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 스토어가 존재하지 않습니다
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
 *                   example: 스토어가 존재하지 않습니다.
 */

/**
 * @swagger
 * /api/stores/detail/my:
 *   get:
 *     summary: 내 스토어 정보 조회
 *     description: 로그인한 판매자의 스토어 상세 정보를 조회합니다. 좋아요 수, 상품 수, 월별 좋아요, 총 판매량 등의 통계 정보를 포함합니다.
 *     tags: [Store]
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
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 userId:
 *                   type: string
 *                 address:
 *                   type: string
 *                 detailAddress:
 *                   type: string
 *                   nullable: true
 *                 phoneNumber:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 favoriteCount:
 *                   type: integer
 *                   description: 총 좋아요 수
 *                 productCount:
 *                   type: integer
 *                   description: 등록된 상품 수
 *                 monthFavoriteCount:
 *                   type: integer
 *                   description: 이번 달 좋아요 수
 *                 totalSoldCount:
 *                   type: integer
 *                   description: 총 판매 수량
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 스토어가 존재하지 않습니다
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
 *                   example: 스토어가 존재하지 않습니다.
 */

/**
 * @swagger
 * /api/stores/{storeId}/favorite:
 *   post:
 *     summary: 스토어 좋아요
 *     description: 특정 스토어를 좋아요(관심 스토어로 등록)합니다.
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 스토어 ID
 *     responses:
 *       201:
 *         description: 좋아요 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: register
 *                 store:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     userId:
 *                       type: string
 *                     address:
 *                       type: string
 *                     detailAddress:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     content:
 *                       type: string
 *                     image:
 *                       type: string
 *                       nullable: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 스토어가 존재하지 않습니다
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
 *                   example: 스토어가 존재하지 않습니다.
 *       409:
 *         description: 이미 관심 스토어로 등록되어 있습니다
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
 *                   example: 이미 관심 스토어로 등록되어 있습니다.
 *   delete:
 *     summary: 스토어 좋아요 취소
 *     description: 관심 스토어로 등록된 스토어를 해제합니다.
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 스토어 ID
 *     responses:
 *       200:
 *         description: 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: delete
 *                 store:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     userId:
 *                       type: string
 *                     address:
 *                       type: string
 *                     detailAddress:
 *                       type: string
 *                       nullable: true
 *                     phoneNumber:
 *                       type: string
 *                     content:
 *                       type: string
 *                     image:
 *                       type: string
 *                       nullable: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 관심 스토어로 등록되지 않은 스토어입니다
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
 *                   example: 관심 스토어로 등록되지 않은 스토어입니다.
 */

/**
 * @swagger
 * /api/stores/{storeId}:
 *   get:
 *     summary: 스토어 상세 조회
 *     description: 특정 스토어의 상세 정보를 조회합니다. 좋아요 수를 포함합니다.
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 스토어 ID
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
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 userId:
 *                   type: string
 *                 address:
 *                   type: string
 *                 detailAddress:
 *                   type: string
 *                   nullable: true
 *                 phoneNumber:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 favoriteCount:
 *                   type: integer
 *                   description: 좋아요 수
 *       404:
 *         description: 스토어가 존재하지 않습니다
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
 *                   example: 스토어가 존재하지 않습니다.
 *   patch:
 *     summary: 스토어 정보 수정
 *     description: 자신의 스토어 정보를 수정합니다. 본인의 스토어만 수정할 수 있습니다.
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 스토어 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               address:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 200
 *               detailAddress:
 *                 type: string
 *                 maxLength: 20
 *               phoneNumber:
 *                 type: string
 *                 pattern: ^01[0|1|6|7|8|9]-[0-9]{3,4}-[0-9]{4}$
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
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
 *                 name:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 address:
 *                   type: string
 *                 detailAddress:
 *                   type: string
 *                   nullable: true
 *                 phoneNumber:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 올바른 접근이 아닙니다 (본인 스토어가 아님)
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
 *                   example: 올바른 접근이 아닙니다.
 *       404:
 *         description: 스토어가 존재하지 않습니다
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
 *                   example: 스토어가 존재하지 않습니다.
 */
