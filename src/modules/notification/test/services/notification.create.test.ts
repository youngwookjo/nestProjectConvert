import { afterEach, describe, test, expect, jest } from '@jest/globals';
import notificationService from '@modules/notification/notificationService';
import notificationRepository from '@modules/notification/notificationRepo';
import notificationServer from '@modules/notification/notificationServer';
import { MOCK_CONSTANTS, MOCK_DATA } from './mock';

describe('NotificationService - Create', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createNotification 메소드 테스트', () => {
    test('알림 생성 성공 - SSE 연결 없음', async () => {
      const createDto = MOCK_DATA.createNotificationDto;
      const mockNotification = MOCK_DATA.createdNotification;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue(mockNotification);
      const isConnectedMock = jest.spyOn(notificationServer, 'isConnected').mockReturnValue(false);
      const sendMock = jest.spyOn(notificationServer, 'send');

      const result = await notificationService.createNotification(createDto);

      expect(createNotificationMock).toHaveBeenCalledWith(createDto);
      expect(isConnectedMock).toHaveBeenCalledWith(MOCK_CONSTANTS.USER_ID);
      expect(sendMock).not.toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });

    test('알림 생성 성공 - SSE 연결됨 (실시간 전송)', async () => {
      const createDto = MOCK_DATA.createNotificationDto;
      const mockNotification = MOCK_DATA.createdNotification;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue(mockNotification);
      const isConnectedMock = jest.spyOn(notificationServer, 'isConnected').mockReturnValue(true);
      const sendMock = jest.spyOn(notificationServer, 'send');

      const result = await notificationService.createNotification(createDto);

      expect(createNotificationMock).toHaveBeenCalledWith(createDto);
      expect(isConnectedMock).toHaveBeenCalledWith(MOCK_CONSTANTS.USER_ID);
      expect(sendMock).toHaveBeenCalledWith(
        MOCK_CONSTANTS.USER_ID,
        'notification',
        mockNotification,
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('notifyOutOfStock 메소드 테스트', () => {
    test('품절 알림 전송 성공 - 판매자 + 장바구니 유저 2명', async () => {
      const stockDto = MOCK_DATA.outOfStockDto;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue({} as any);
      jest.spyOn(notificationServer, 'isConnected').mockReturnValue(false);

      await notificationService.notifyOutOfStock(stockDto);

      expect(createNotificationMock).toHaveBeenCalledTimes(3);
      expect(createNotificationMock).toHaveBeenNthCalledWith(1, {
        userId: MOCK_CONSTANTS.SELLER_ID,
        content: `${MOCK_CONSTANTS.STORE_NAME}의 '${MOCK_CONSTANTS.PRODUCT_NAME} ${MOCK_CONSTANTS.SIZE_NAME} 사이즈' 상품이 품절되었습니다.`,
      });
      expect(createNotificationMock).toHaveBeenNthCalledWith(2, {
        userId: MOCK_CONSTANTS.BUYER_ID_1,
        content: `장바구니의 '${MOCK_CONSTANTS.PRODUCT_NAME} ${MOCK_CONSTANTS.SIZE_NAME} 사이즈' 상품이 품절되었습니다.`,
      });
      expect(createNotificationMock).toHaveBeenNthCalledWith(3, {
        userId: MOCK_CONSTANTS.BUYER_ID_2,
        content: `장바구니의 '${MOCK_CONSTANTS.PRODUCT_NAME} ${MOCK_CONSTANTS.SIZE_NAME} 사이즈' 상품이 품절되었습니다.`,
      });
    });

    test('품절 알림 전송 성공 - 장바구니 유저 없음 (판매자만)', async () => {
      const stockDto = MOCK_DATA.outOfStockDtoNoCart;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue({} as any);
      jest.spyOn(notificationServer, 'isConnected').mockReturnValue(false);

      await notificationService.notifyOutOfStock(stockDto);

      expect(createNotificationMock).toHaveBeenCalledTimes(1);
      expect(createNotificationMock).toHaveBeenCalledWith({
        userId: MOCK_CONSTANTS.SELLER_ID,
        content: `${MOCK_CONSTANTS.STORE_NAME}의 '${MOCK_CONSTANTS.PRODUCT_NAME} ${MOCK_CONSTANTS.SIZE_NAME} 사이즈' 상품이 품절되었습니다.`,
      });
    });
  });

  describe('notifyInquiryAnswered 메소드 테스트', () => {
    test('문의 답변 알림 전송 성공', async () => {
      const buyerId = MOCK_CONSTANTS.USER_ID;
      const inquiryTitle = MOCK_CONSTANTS.INQUIRY_TITLE;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue({} as any);
      jest.spyOn(notificationServer, 'isConnected').mockReturnValue(false);

      await notificationService.notifyInquiryAnswered(buyerId, inquiryTitle);

      expect(createNotificationMock).toHaveBeenCalledWith({
        userId: buyerId,
        content: `등록한 문의:"${inquiryTitle}"에 답변이 달렸습니다.`,
      });
    });
  });

  describe('notifyNewInquiry 메소드 테스트', () => {
    test('새 문의 알림 전송 성공', async () => {
      const sellerId = MOCK_CONSTANTS.SELLER_ID;
      const productName = MOCK_CONSTANTS.PRODUCT_NAME;

      const createNotificationMock = jest
        .spyOn(notificationRepository, 'createNotification')
        .mockResolvedValue({} as any);
      jest.spyOn(notificationServer, 'isConnected').mockReturnValue(false);

      await notificationService.notifyNewInquiry(sellerId, productName);

      expect(createNotificationMock).toHaveBeenCalledWith({
        userId: sellerId,
        content: `등록된 상품:${productName}에 새로운 문의가 등록되었습니다.`,
      });
    });
  });
});
