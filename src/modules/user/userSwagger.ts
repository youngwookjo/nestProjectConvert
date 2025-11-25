/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - type
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 유효한 MX 레코드를 가진 이메일
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: 8-20자 비밀번호
 *                 example: password123!
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: 2-10자 닉네임 (특수문자 불가)
 *                 example: 홍길동
 *               type:
 *                 type: string
 *                 enum: [BUYER, SELLER]
 *                 description: 사용자 유형
 *                 example: BUYER
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: clh1234567890
 *                 gradeId:
 *                   type: string
 *                   example: clg1234567890
 *                 name:
 *                   type: string
 *                   example: 홍길동
 *                 email:
 *                   type: string
 *                   example: newuser@example.com
 *                 type:
 *                   type: string
 *                   enum: [BUYER, SELLER]
 *                   example: BUYER
 *                 points:
 *                   type: number
 *                   example: 0
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 image:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *                 grade:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Green
 *                     id:
 *                       type: string
 *                       example: clg1234567890
 *                     rate:
 *                       type: number
 *                       example: 0.05
 *                     minAmount:
 *                       type: number
 *                       example: 0
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: 이메일 또는 이름 중복
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: CONFLICT
 *                 status:
 *                   type: number
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: 이미 존재하는 이메일입니다.
 *             examples:
 *               이메일 중복:
 *                 value:
 *                   code: CONFLICT
 *                   status: 409
 *                   message: 이미 존재하는 이메일입니다.
 *               이름 중복:
 *                 value:
 *                   code: CONFLICT
 *                   status: 409
 *                   message: 이미 존재하는 이름입니다.
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [User]
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
 *                   example: clh1234567890
 *                 gradeId:
 *                   type: string
 *                   example: clg1234567890
 *                 name:
 *                   type: string
 *                   example: 홍길동
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 type:
 *                   type: string
 *                   enum: [BUYER, SELLER]
 *                   example: BUYER
 *                 points:
 *                   type: number
 *                   example: 1000
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 image:
 *                   type: string
 *                   nullable: true
 *                   example: https://s3.amazonaws.com/bucket/profile.jpg
 *                 grade:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Green
 *                     id:
 *                       type: string
 *                       example: clg1234567890
 *                     rate:
 *                       type: number
 *                       example: 0.05
 *                     minAmount:
 *                       type: number
 *                       example: 0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 사용자입니다.
 *   patch:
 *     summary: 내 정보 수정
 *     tags: [User]
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
 *               - newPassword
 *               - currentPassword
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 description: 2-10자 닉네임 (특수문자 불가)
 *                 example: 홍길동
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: 새 비밀번호 (8-20자)
 *                 example: newpassword123!
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 20
 *                 description: 현재 비밀번호 (8-20자)
 *                 example: password123!
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 프로필 이미지 파일
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
 *                   example: clh1234567890
 *                 gradeId:
 *                   type: string
 *                   example: clg1234567890
 *                 name:
 *                   type: string
 *                   example: 홍길동
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 type:
 *                   type: string
 *                   enum: [BUYER, SELLER]
 *                   example: BUYER
 *                 points:
 *                   type: number
 *                   example: 1000
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 image:
 *                   type: string
 *                   nullable: true
 *                   example: https://s3.amazonaws.com/bucket/profile-updated.jpg
 *                 grade:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Green
 *                     id:
 *                       type: string
 *                       example: clg1234567890
 *                     rate:
 *                       type: number
 *                       example: 0.05
 *                     minAmount:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: 잘못된 요청 또는 비밀번호 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: BAD_REQUEST
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.
 *             examples:
 *               Validation Error:
 *                 $ref: '#/components/responses/ValidationError'
 *               같은 비밀번호:
 *                 value:
 *                   code: BAD_REQUEST
 *                   status: 400
 *                   message: 새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.
 *               현재 비밀번호 불일치:
 *                 value:
 *                   code: BAD_REQUEST
 *                   status: 400
 *                   message: 현재 비밀번호가 올바르지 않습니다.
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 사용자입니다.
 *       409:
 *         description: 이름 중복
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: CONFLICT
 *                 status:
 *                   type: number
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: 이미 존재하는 이름입니다.
 */

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: 회원탈퇴
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: 탈퇴 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *                 status:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 존재하지 않는 사용자입니다.
 */

/**
 * @swagger
 * /api/users/me/likes:
 *   get:
 *     summary: 좋아하는 스토어 목록 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
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
 *                   storeId:
 *                     type: string
 *                     example: cls1234567890
 *                   userId:
 *                     type: string
 *                     example: clh1234567890
 *                   store:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: cls1234567890
 *                       name:
 *                         type: string
 *                         example: 홍길동 스토어
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       userId:
 *                         type: string
 *                         example: clh1234567890
 *                       address:
 *                         type: string
 *                         example: 서울시 강남구
 *                       detailAddress:
 *                         type: string
 *                         nullable: true
 *                         example: 101호
 *                       phoneNumber:
 *                         type: string
 *                         example: 010-1234-5678
 *                       content:
 *                         type: string
 *                         example: 멋진 스토어입니다
 *                       image:
 *                         type: string
 *                         nullable: true
 *                         example: https://s3.amazonaws.com/bucket/store.jpg
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
