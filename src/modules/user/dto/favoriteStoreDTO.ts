export interface ResFavoriteStoreDto {
  storeId: string;
  userId: string;
  store: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    address: string;
    detailAddress: string | null;
    phoneNumber: string;
    content: string;
    image: string | null;
  };
}
