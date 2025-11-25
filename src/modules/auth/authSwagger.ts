/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123!
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=None
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: clh1234567890
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: 홍길동
 *                     type:
 *                       type: string
 *                       enum: [BUYER, SELLER]
 *                       example: BUYER
 *                     points:
 *                       type: number
 *                       example: 1000
 *                     image:
 *                       type: string
 *                       nullable: true
 *                       example: https://s3.amazonaws.com/bucket/profile.jpg
 *                     grade:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: clg1234567890
 *                         name:
 *                           type: string
 *                           example: Green
 *                         discountRate:
 *                           type: number
 *                           example: 0.05
 *                         minAmount:
 *                           type: number
 *                           example: 0
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: 사용자 또는 비밀번호가 올바르지 않습니다.
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 액세스 토큰 재발급
 *     description: 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: 로그아웃 성공 (쿠키의 refreshToken 삭제)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
