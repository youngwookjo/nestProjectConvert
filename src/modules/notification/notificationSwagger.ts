/**
 * @swagger
 * /api/notifications/sse:
 *   get:
 *     summary: SSE 알림 연결
 *     description: 실시간 알림을 받기 위한 Server-Sent Events 연결을 설정합니다. 연결 후 서버로부터 실시간 푸시 알림을 수신할 수 있습니다.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSE 연결 성공
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: SSE 스트림 데이터
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: 알림 목록 조회
 *     description: 로그인한 사용자가 받은 알림 목록을 조회합니다.
 *     tags: [Notification]
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
 *                   id:
 *                     type: string
 *                     example: clh1234567890
 *                   userId:
 *                     type: string
 *                   content:
 *                     type: string
 *                     example: 등록한 문의:"배송 문의드립니다"에 답변이 달렸습니다.
 *                   isChecked:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 사용자를 찾을 수 없습니다
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
 *                   example: 사용자를 찾을 수 없습니다.
 */

/**
 * @swagger
 * /api/notifications/{alarmId}/check:
 *   patch:
 *     summary: 알림 읽음 처리
 *     description: 특정 알림을 읽음 상태로 변경합니다. 본인의 알림만 읽음 처리할 수 있습니다.
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alarmId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID 형식의 알림 ID
 *     responses:
 *       204:
 *         description: 읽음 처리 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 본인의 알림만 읽음 처리할 수 있습니다
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
 *                   example: 본인의 알림만 읽음 처리할 수 있습니다.
 *       404:
 *         description: 알림을 찾을 수 없습니다 / 사용자를 찾을 수 없습니다
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
 *                   example: 알림을 찾을 수 없습니다.
 */
