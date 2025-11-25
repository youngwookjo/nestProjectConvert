/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: 판매자 대시보드 조회
 *     description: 판매자의 매출 통계, 최다 판매 상품, 가격 범위별 매출 등을 조회합니다. 일/주/월/년 단위의 현재/이전 기간 비교 통계를 제공합니다.
 *     tags: [Dashboard]
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
 *                 today:
 *                   $ref: '#/components/schemas/PeriodStats'
 *                 week:
 *                   $ref: '#/components/schemas/PeriodStats'
 *                 month:
 *                   $ref: '#/components/schemas/PeriodStats'
 *                 year:
 *                   $ref: '#/components/schemas/PeriodStats'
 *                 topSales:
 *                   type: array
 *                   description: 최다 판매 상품 TOP 5
 *                   items:
 *                     type: object
 *                     properties:
 *                       totalOrders:
 *                         type: integer
 *                         description: 총 판매 수량
 *                         example: 150
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: clh1234567890
 *                           name:
 *                             type: string
 *                             example: 베이직 면 티셔츠
 *                           price:
 *                             type: integer
 *                             example: 29000
 *                 priceRange:
 *                   type: array
 *                   description: 가격 범위별 매출 분석
 *                   items:
 *                     type: object
 *                     properties:
 *                       priceRange:
 *                         type: string
 *                         example: ~20,000원
 *                       totalSales:
 *                         type: integer
 *                         description: 해당 범위의 총 매출액
 *                         example: 5800000
 *                       percentage:
 *                         type: number
 *                         format: float
 *                         description: 전체 매출 대비 비율 (%)
 *                         example: 35.2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 판매자가 아닌 사용자 (구매자는 접근 불가)
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
 *                   example: 대시보드는 판매자만 접근할 수 있습니다.
 *       404:
 *         description: 사용자를 찾을 수 없습니다 / 스토어를 찾을 수 없습니다
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
 *                   example: 스토어를 찾을 수 없습니다.
 */
