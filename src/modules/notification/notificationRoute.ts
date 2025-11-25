import { Router } from 'express';
import notificationController from '@modules/notification/notificationController';
import { authMiddleware } from '@middlewares/authMiddleware';

const router = Router();

router.get('/sse', authMiddleware, notificationController.connectSSE);
router.get('/', authMiddleware, notificationController.getNotificationList);
router.patch('/:alarmId/check', authMiddleware, notificationController.markAsRead);

export default router;
