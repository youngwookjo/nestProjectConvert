import { prisma } from '@shared/prisma';
import { Prisma } from '@prisma/client'; // raw query 작성을 위한 import
import {
  CreateStoreDto,
  UpdateStoreDto,
  DBProductDto,
  GetMyProductListDto,
} from '@modules/store/dto/storeDTO';

// create와 update에서 사용할 select 옵션
const selectOptionDB = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  address: true,
  detailAddress: true,
  phoneNumber: true,
  content: true,
  image: true,
};

class StoreRepository {
  createStore = async (userId: string, createStoreDto: CreateStoreDto) => {
    return await prisma.store.create({
      data: { userId, ...createStoreDto },
      select: selectOptionDB,
    });
  };

  updateStore = async (storeId: string, updateStoreDto: UpdateStoreDto) => {
    return await prisma.store.update({
      where: {
        id: storeId,
      },
      data: updateStoreDto,
      select: selectOptionDB,
    });
  };

  getStoreById = async (storeId: string) => {
    return await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        address: true,
        detailAddress: true,
        phoneNumber: true,
        content: true,
        image: true,
        _count: {
          select: {
            storeLikes: true, // favoriteCount
            products: true, // productCount
          },
        },
      },
    });
  };

  getStoreIdByUserId = async (userId: string) => {
    // 스토어 존재 여부만 확인하기 위한 최소데이터 조회
    const store = await prisma.store.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
      },
    });
    return store;
  };

  /**
   * DashboardService에서 사용하는 메소드입니다.
   * 작성자: 박재성 (Dashboard 리팩토링)
   * - getStoreIdBySellerId: 판매자 ID로 스토어 ID 조회
   */

  // 판매자 ID로 스토어 ID 조회
  getStoreIdBySellerId = async (sellerId: string): Promise<string | null> => {
    const store = await prisma.store.findUnique({
      where: { userId: sellerId },
      select: { id: true },
    });
    return store?.id || null;
  };

  getProductListByStoreId = async (storeId: string, getMyProductListDto: GetMyProductListDto) => {
    const { page, pageSize } = getMyProductListDto;
    const offset = (page - 1) * pageSize;
    const products = await prisma.$queryRaw(Prisma.sql`
      SELECT
        p.id,
        p.name,
        p.price,
        p.image,
        p."createdAt",
        CAST(COALESCE(SUM(s.quantity), 0) AS INTEGER) AS stock, -- COALESCE : left join시 stock이 없는 경우 대비
        CASE WHEN p."discountEndTime" > NOW() THEN true ELSE false END AS "isDiscount",
        CASE WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN true ELSE false END AS "isSoldOut",
        CAST(COUNT(*) OVER() AS INTEGER) AS "totalCount" -- 집계함수 + OVER()로 페이지네이션에서도 전체 개수 조회 가능
      FROM
        products p
      LEFT JOIN
        stocks s ON p.id = s."productId"
      WHERE
        p."storeId" = ${storeId}
      GROUP BY
        p.id
      LIMIT ${pageSize} OFFSET ${offset}
    `);

    // $queryRaw 반환 타입은 any[] 이므로, 타입 캐스팅이 필요.
    const typedProducts = products as DBProductDto[];

    // 스토어에 상품이 없는 경우
    if (!typedProducts || typedProducts.length === 0) {
      return { list: [], totalCount: 0 };
    }

    // 형식에 맞게 가공
    const totalCount = typedProducts[0].totalCount;
    const list = typedProducts.map((p) => {
      const { totalCount, ...product } = p;
      return product;
    });

    return { list, totalCount };
  };

  getUserTypeByUserId = async (userId: string) => {
    // 스토어 생성 권한 여부만 확인하기 위한 최소데이터 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        type: true,
      },
    });
    return user;
  };

  getMonthlyLikesByStoreId = async (storeId: string) => {
    // 현재 날짜의 달을 기준으로 좋아요 수 계산
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return await prisma.storeLike.count({
      where: {
        storeId: storeId,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });
  };

  getTotalSalesByStoreId = async (storeId: string) => {
    const result = await prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        product: {
          storeId: storeId,
        },
      },
    });
    // _sum.quantity는 상품이 하나도 판매되지 않았을 경우 null이므로 아래와 같이 처리
    return result._sum.quantity || 0;
  };

  getStoreLike = async (userId: string, storeId: string) => {
    return await prisma.storeLike.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId,
        },
      },
    });
  };

  favoriteStore = async (userId: string, storeId: string) => {
    await prisma.storeLike.create({
      data: {
        userId,
        storeId,
      },
    });
  };

  unfavoriteStore = async (userId: string, storeId: string) => {
    await prisma.storeLike.delete({
      where: {
        storeId_userId: { userId, storeId },
      },
    });
  };

  // S3 이미지 삭제를 위한 이미지 url 조회 메소드
  getImageUrlById = async (storeId: string) => {
    return await prisma.store.findUnique({
      where: {
        id: storeId,
      },
      select: {
        image: true,
      },
    });
  };
}

export default new StoreRepository();
