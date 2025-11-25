export interface CreateNotificationDto {
  userId: string;
  content: string;
}

export interface ResNotificationDto {
  id: string;
  userId: string;
  content: string;
  isChecked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResnotifyOutOfStockDto {
  sellerId: string;
  storeName: string;
  productName: string;
  sizeName: string; // 품절된 사이즈 이름
  cartUserIds: string[];
}
