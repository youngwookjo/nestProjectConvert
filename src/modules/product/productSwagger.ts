/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 16
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [highRating, lowPrice, highPrice, newest]
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *       - in: query
 *         name: favoriteStore
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryName
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
 *                       storeId:
 *                         type: string
 *                       categoryId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       image:
 *                         type: string
 *                         nullable: true
 *                       price:
 *                         type: integer
 *                       discountPrice:
 *                         type: integer
 *                       discountRate:
 *                         type: integer
 *                       storeName:
 *                         type: string
 *                       reviewsCount:
 *                         type: integer
 *                       reviewsRating:
 *                         type: number
 *                       sales:
 *                         type: integer
 *                       isSoldOut:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: integer
 *       404:
 *         description: 존재하지 않는 카테고리 입니다
 *   post:
 *     summary: 상품 생성
 *     tags: [Product]
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
 *               - price
 *               - content
 *               - categoryName
 *               - stocks
 *             properties:
 *               name:
 *                 type: string
 *                 description: 상품명 (2-50자)
 *               price:
 *                 type: integer
 *                 description: 가격 (0 이상)
 *               content:
 *                 type: string
 *                 description: 상품 설명 (1-500자)
 *               categoryName:
 *                 type: string
 *               discountRate:
 *                 type: integer
 *                 description: 할인율 (0-100)
 *               discountStartTime:
 *                 type: string
 *                 format: date-time
 *               discountEndTime:
 *                 type: string
 *                 format: date-time
 *               stocks:
 *                 type: string
 *                 description: 'JSON 배열 형식: [{"sizeId": 1, "quantity": 10}]'
 *               image:
 *                 type: string
 *                 format: binary
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
 *                 storeId:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 price:
 *                   type: integer
 *                 discountPrice:
 *                   type: integer
 *                   nullable: true
 *                 discountRate:
 *                   type: integer
 *                 storeName:
 *                   type: string
 *                 stocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 reviewsRating:
 *                   type: number
 *                 reviews:
 *                   type: object
 *                   properties:
 *                     rate1Length:
 *                       type: integer
 *                     rate2Length:
 *                       type: integer
 *                     rate3Length:
 *                       type: integer
 *                     rate4Length:
 *                       type: integer
 *                     rate5Length:
 *                       type: integer
 *                     sumScore:
 *                       type: integer
 *                 isSoldOut:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 스토어를 찾을수 없습니다 / 존재하지 않는 카테고리 입니다
 */

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Product]
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
 *                 id:
 *                   type: string
 *                 storeId:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 price:
 *                   type: integer
 *                 discountPrice:
 *                   type: integer
 *                   nullable: true
 *                 discountRate:
 *                   type: integer
 *                 discountStartTime:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 discountEndTime:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 storeName:
 *                   type: string
 *                 stocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 reviewsRating:
 *                   type: number
 *                 reviews:
 *                   type: object
 *                   properties:
 *                     rate1Length:
 *                       type: integer
 *                     rate2Length:
 *                       type: integer
 *                     rate3Length:
 *                       type: integer
 *                     rate4Length:
 *                       type: integer
 *                     rate5Length:
 *                       type: integer
 *                     sumScore:
 *                       type: integer
 *                 isSoldOut:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *   patch:
 *     summary: 상품 수정
 *     tags: [Product]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               content:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               discountRate:
 *                 type: integer
 *               discountStartTime:
 *                 type: string
 *                 format: date-time
 *               discountEndTime:
 *                 type: string
 *                 format: date-time
 *               stocks:
 *                 type: string
 *                 description: 'JSON 배열 형식'
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 수정 성공 (ProductResponseDto와 동일한 구조)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 storeId:
 *                   type: string
 *                 categoryId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 content:
 *                   type: string
 *                 image:
 *                   type: string
 *                   nullable: true
 *                 price:
 *                   type: integer
 *                 discountPrice:
 *                   type: integer
 *                   nullable: true
 *                 discountRate:
 *                   type: integer
 *                 storeName:
 *                   type: string
 *                 stocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       size:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                 reviewsRating:
 *                   type: number
 *                 reviews:
 *                   type: object
 *                   properties:
 *                     rate1Length:
 *                       type: integer
 *                     rate2Length:
 *                       type: integer
 *                     rate3Length:
 *                       type: integer
 *                     rate4Length:
 *                       type: integer
 *                     rate5Length:
 *                       type: integer
 *                     sumScore:
 *                       type: integer
 *                 isSoldOut:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 상품을 수정할 권한이 없습니다
 *       404:
 *         description: 상품을 찾을 수 없습니다 / 스토어를 찾을수 없습니다 / 존재하지 않는 카테고리 입니다
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 삭제 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 상품을 삭제할 권한이 없습니다
 *       404:
 *         description: 상품을 찾을 수 없습니다 / 스토어를 찾을수 없습니다
 */
