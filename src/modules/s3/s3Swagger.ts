/**
 * @swagger
 * /api/s3/upload:
 *   post:
 *     summary: 이미지 업로드
 *     description: 이미지 파일을 S3에 업로드합니다. multipart/form-data 형식으로 전송하며, 최대 5MB까지 업로드 가능합니다.
 *     tags: [S3]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일 (최대 5MB, jpg/jpeg/png/gif/webp)
 *     responses:
 *       200:
 *         description: 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 업로드 성공
 *                 url:
 *                   type: string
 *                   description: 업로드된 이미지 URL
 *                   example: https://s3.amazonaws.com/bucket-name/images/filename.jpg
 *                 key:
 *                   type: string
 *                   description: S3 객체 키
 *                   example: images/filename.jpg
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
