/**
 * @swagger
 * /api/metadata/grades:
 *   get:
 *     summary: 등급 목록 조회
 *     description: 사용자 등급 목록을 조회합니다. 등급별 할인율과 최소 구매 금액 정보를 제공합니다.
 *     tags: [Metadata]
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
 *                     description: 등급 ID
 *                     example: grade_bronze
 *                   name:
 *                     type: string
 *                     description: 등급 이름
 *                     example: BRONZE
 *                   rate:
 *                     type: number
 *                     description: 할인율 (%)
 *                     example: 0
 *                   minAmount:
 *                     type: number
 *                     description: 해당 등급 달성을 위한 최소 구매 금액
 *                     example: 0
 *             example:
 *               - id: grade_bronze
 *                 name: BRONZE
 *                 rate: 0
 *                 minAmount: 0
 *               - id: grade_silver
 *                 name: SILVER
 *                 rate: 3
 *                 minAmount: 100000
 *               - id: grade_gold
 *                 name: GOLD
 *                 rate: 5
 *                 minAmount: 500000
 *               - id: grade_platinum
 *                 name: PLATINUM
 *                 rate: 7
 *                 minAmount: 1000000
 *               - id: grade_diamond
 *                 name: DIAMOND
 *                 rate: 10
 *                 minAmount: 5000000
 */
