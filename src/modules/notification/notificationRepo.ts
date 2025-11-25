import { prisma } from '@shared/prisma';
import {
  CreateNotificationDto,
  ResNotificationDto,
} from '@modules/notification/dto/notificationDTO';

class NotificationRepository {
  createNotification = async (data: CreateNotificationDto): Promise<ResNotificationDto> => {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        content: data.content,
        isChecked: false,
      },
    });
  };

  getNotificationList = async (userId: string): Promise<ResNotificationDto[]> => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  };

  markAsRead = async (notificationId: string): Promise<ResNotificationDto> => {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isChecked: true },
    });
  };

  getNotificationById = async (notificationId: string): Promise<ResNotificationDto | null> => {
    return prisma.notification.findUnique({
      where: { id: notificationId },
    });
  };
}

export default new NotificationRepository();
