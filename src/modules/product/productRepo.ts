import { prisma } from '@shared/prisma';
import { Prisma } from '@prisma/client';
import {
  StockDto,
  CreateProductRepoDto,
  GetProductListDto,
  UpdateProductRepoDto,
} from '@modules/product/dto/productDTO';

class ProductRepository {
  createProduct = async (storeId: string, productData: CreateProductRepoDto) => {
    const { stocks, ...restProductData } = productData;

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId,
          ...restProductData,
        },
      });

      const stockData = stocks.map((stock: StockDto) => ({
        ...stock,
        productId: product.id,
      }));

      await tx.stock.createMany({
        data: stockData,
      });

      return await tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          stocks: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              size: {
                select: {
                  id: true,
                  en: true,
                },
              },
            },
          },
          inquiries: true,
          reviews: true,
        },
      });
    });
  };

  getCategoryByName = async (name: string) => {
    return await prisma.category.findUnique({
      where: {
        name,
      },
    });
  };

  /**
   * CartService에서 사용하는 메소드입니다.
   * 작성자: 박재성 (Cart API 담당)
   * - checkProductExists: 상품 존재 여부 확인
   * - getStock: 재고 확인
   */

  // 상품 존재 여부 확인
  checkProductExists = async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    return product !== null;
  };

  // 재고 확인
  getStock = async (productId: string, sizeId: number) => {
    return await prisma.stock.findUnique({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      select: {
        quantity: true,
      },
    });
  };

  getProductList = async (getProductListDto: GetProductListDto) => {
    const { page, pageSize, search, sort, priceMin, priceMax, size, categoryName } =
      getProductListDto;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // highRating(평점순) 또는 salesRanking(판매량순) 정렬은 Prisma에서 직접 지원하지 않는 관계 테이블에 대한 집계(AVG, SUM)가 필요.
    // 따라서 Raw Query를 사용하여 정렬된 상품 ID 목록을 먼저 가져온 후, 해당 ID를 사용해 전체 상품 정보를 조회.
    if (sort === 'highRating' || sort === 'salesRanking') {
      // 1. Raw Query에 사용될 동적 WHERE 조건 생성
      const whereConditions = [];
      if (search) {
        whereConditions.push(Prisma.sql`p.name ILIKE ${'%' + search + '%'}`);
      }
      if (priceMin !== undefined) {
        whereConditions.push(Prisma.sql`p.price >= ${priceMin}`);
      }
      if (priceMax !== undefined) {
        whereConditions.push(Prisma.sql`p.price <= ${priceMax}`);
      }
      if (categoryName) {
        whereConditions.push(Prisma.sql`c.name = ${categoryName}`);
      }
      if (size) {
        whereConditions.push(
          Prisma.sql`EXISTS (SELECT 1 FROM "stocks" s JOIN "sizes" z ON s."sizeId" = z.id WHERE s."productId" = p.id AND z.en = ${size})`,
        );
      }

      const whereSql =
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty;

      // categoryName 필터가 있을 경우에만 categories 테이블과 JOIN
      const categoryJoin = categoryName
        ? Prisma.sql`JOIN "categories" c ON p."categoryId" = c.id`
        : Prisma.empty;

      // 2. 정렬 기준에 따라 JOIN 및 ORDER BY 절 설정
      let orderByClause;
      let joinClause = Prisma.empty;

      if (sort === 'highRating') {
        joinClause = Prisma.sql`LEFT JOIN "reviews" r ON p.id = r."productId"`;
        orderByClause = Prisma.sql`ORDER BY COALESCE(AVG(r.rating), 0) DESC, p.id`;
      } else {
        // salesRanking
        joinClause = Prisma.sql`LEFT JOIN "order_items" oi ON p.id = oi."productId"`;
        orderByClause = Prisma.sql`ORDER BY COALESCE(SUM(oi.quantity), 0) DESC, p.id`;
      }

      // 3. 정렬된 상품 ID를 가져오는 Raw Query 실행
      const productIdsQuery = Prisma.sql`
        SELECT p.id
        FROM "products" p
        ${categoryJoin}
        ${joinClause}
        ${whereSql}
        GROUP BY p.id
        ${orderByClause}
        LIMIT ${take}
        OFFSET ${skip}
      `;

      const productIdsResult: { id: string }[] = await prisma.$queryRaw(productIdsQuery);
      const productIds = productIdsResult.map((p) => p.id);

      if (productIds.length === 0) {
        return [];
      }

      // 4. 조회된 ID 목록을 사용해 전체 상품 정보 조회 (관계 포함)
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          stocks: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              size: {
                select: {
                  id: true,
                  en: true,
                },
              },
            },
          },
          reviews: true,
          orderItems: true,
          store: true,
        },
      });

      // 5. Raw Query에서 정렬된 순서대로 상품 목록을 재정렬
      const productMap = new Map(products.map((p) => [p.id, p]));
      return productIds.map((id) => productMap.get(id)!);
    }

    // 그 외의 정렬(recent, lowPrice, highPrice, mostReviewed)은 Prisma의 findMany를 직접 사용합니다.
    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    if (size) {
      where.stocks = { some: { size: { en: size } } };
    }

    if (categoryName) {
      where.category = { name: categoryName };
    }

    const orderBy: any = {};
    switch (sort) {
      case 'recent':
        orderBy.createdAt = 'desc';
        break;
      case 'lowPrice':
        orderBy.price = 'asc';
        break;
      case 'highPrice':
        orderBy.price = 'desc';
        break;
      case 'mostReviewed':
        orderBy.reviews = { _count: 'desc' };
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    return await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        stocks: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            size: {
              select: {
                id: true,
                en: true,
              },
            },
          },
        },
        reviews: true,
        orderItems: true,
        store: true,
      },
    });
  };

  getProductCount = async (getProductListDto: GetProductListDto) => {
    const { search, priceMin, priceMax, size, categoryName } = getProductListDto;

    const where: any = {};

    // 해당 단어를 포함한 상품 검색
    if (search) {
      where.name = { contains: search };
    }

    // 가격 최소, 최대값 있을 경우 정의
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // 상품에 조건에 넣은 사이즈가 있는 경우
    if (size) {
      where.stocks = { some: { size: { en: size } } };
    }

    // 카테고리가 있는 경우 동일한 카테고리에 포함된 상품 포함
    if (categoryName) {
      where.category = { name: categoryName };
    }

    return await prisma.product.count({
      where,
    });
  };

  /**
   * OrderService에서 사용하는 메소드입니다.
   * 작성자: 박재성 (Order API 담당)
   * - getStoreIdByProductId: 상품의 스토어 ID 조회
   * - getProductPriceInfo: 상품 가격 및 할인 정보 조회
   */

  // 상품의 스토어 ID 조회
  getStoreIdByProductId = async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { storeId: true },
    });
    return product?.storeId || null;
  };

  // 상품 가격 및 할인 정보 조회
  getProductPriceInfo = async (productId: string) => {
    return await prisma.product.findUnique({
      where: { id: productId },
      select: {
        price: true,
        discountRate: true,
        discountStartTime: true,
        discountEndTime: true,
      },
    });
  };

  /**
   * DashboardService에서 사용하는 메소드입니다.
   * 작성자: 박재성 (Dashboard API 담당)
   * - getProductListByIds: 상품 ID 목록으로 상품 정보 조회
   */

  // 상품 ID 목록으로 상품 정보 조회
  getProductListByIds = async (productIds: string[]) => {
    return await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
  };

  getProductById = async (productId: string) => {
    return await prisma.product.findUnique({
      where: { id: productId },
    });
  };

  getProductByIdWithRelations = async (productId: string) => {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        stocks: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            size: {
              select: {
                id: true,
                en: true,
              },
            },
          },
        },
        inquiries: true,
        reviews: true,
        store: true,
        orderItems: true,
      },
    });
  };

  updateProduct = async (productId: string, productData: UpdateProductRepoDto) => {
    const { stocks, ...restProductData } = productData;

    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: restProductData,
      });

      await tx.stock.deleteMany({
        where: { productId },
      });

      const stockData = stocks.map((stock: StockDto) => ({
        ...stock,
        productId: productId,
      }));

      await tx.stock.createMany({
        data: stockData,
      });

      return await tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          stocks: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              size: {
                select: {
                  id: true,
                  en: true,
                },
              },
            },
          },
          inquiries: true,
          reviews: true,
        },
      });
    });
  };

  deleteProduct = async (productId: string) => {
    await prisma.product.delete({
      where: { id: productId },
    });
  };

  getSellerIdByProductId = async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        store: {
          select: {
            userId: true,
          },
        },
      },
    });
    return product?.store.userId || null;
  };

  getStockAndSize = async (productId: string, sizeId: number) => {
    return await prisma.stock.findUnique({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      select: {
        quantity: true,
        size: {
          select: {
            en: true,
          },
        },
      },
    });
  };

  /**
   * OrderRepo의 트랜잭션 내에서 사용하는 헬퍼 메소드들입니다.
   * 작성자: 박재성 (Order API 담당)
   * OrderRepo의 트랜잭션에서 Stock 엔티티 접근 시 사용합니다.
   */

  // 재고 조회 및 잠금 (트랜잭션 내에서 사용)
  getStockForUpdate = async (productId: string, sizeId: number, tx: Prisma.TransactionClient) => {
    return await tx.stock.findUnique({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });
  };

  // 재고 차감 (트랜잭션 내에서 사용)
  decrementStock = async (
    productId: string,
    sizeId: number,
    quantity: number,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.stock.update({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  };

  // 재고 복원 (트랜잭션 내에서 사용)
  incrementStock = async (
    productId: string,
    sizeId: number,
    quantity: number,
    tx: Prisma.TransactionClient,
  ) => {
    return await tx.stock.update({
      where: {
        productId_sizeId: {
          productId,
          sizeId,
        },
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  };
}

export default new ProductRepository();
