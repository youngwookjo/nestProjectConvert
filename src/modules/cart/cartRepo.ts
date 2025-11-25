import { prisma } from '@shared/prisma';

// create와 findByUserId에서 사용할 select 옵션
const selectOptionDB = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      quantity: true,
    },
  },
};

// 장바구니 상세 조회를 위한 select 옵션
const selectCartWithDetailsDB = {
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      cartId: true,
      productId: true,
      sizeId: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          storeId: true,
          name: true,
          price: true,
          image: true,
          discountRate: true,
          discountStartTime: true,
          discountEndTime: true,
          createdAt: true,
          updatedAt: true,
          store: {
            select: {
              id: true,
              userId: true,
              name: true,
              address: true,
              phoneNumber: true,
              content: true,
              image: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          stocks: {
            select: {
              id: true,
              productId: true,
              sizeId: true,
              quantity: true,
              size: {
                select: {
                  id: true,
                  en: true,
                  ko: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

class CartRepository {
  // 사용자 ID로 장바구니 조회
  getByUserId = async (userId: string) => {
    return await prisma.cart.findUnique({
      where: { userId },
      select: selectOptionDB,
    });
  };

  // 사용자 ID로 장바구니 상세 조회
  getCartWithDetails = async (userId: string) => {
    return await prisma.cart.findUnique({
      where: { userId },
      select: selectCartWithDetailsDB,
    });
  };

  // 장바구니 생성
  createCart = async (userId: string) => {
    return await prisma.cart.create({
      data: { userId },
      select: selectOptionDB,
    });
  };

  // CartItem upsert (존재하면 업데이트, 없으면 생성)
  upsertCartItem = async (cartId: string, productId: string, sizeId: number, quantity: number) => {
    return await prisma.cartItem.upsert({
      where: {
        cartId_productId_sizeId: {
          cartId,
          productId,
          sizeId,
        },
      },
      update: {
        quantity,
        updatedAt: new Date(),
      },
      create: {
        cartId,
        productId,
        sizeId,
        quantity,
      },
      select: {
        id: true,
        cartId: true,
        productId: true,
        sizeId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  };

  // 특정 상품의 CartItem들 조회
  getCartItemsByProductId = async (cartId: string, productId: string) => {
    return await prisma.cartItem.findMany({
      where: {
        cartId,
        productId,
      },
      select: {
        id: true,
        cartId: true,
        productId: true,
        sizeId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  };

  // 장바구니 아이템 조회 (권한 확인을 위해 cart의 userId도 포함)
  getCartItemById = async (cartItemId: string) => {
    return await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      select: {
        id: true,
        cartId: true,
        productId: true,
        sizeId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });
  };

  // 장바구니 아이템 삭제
  deleteCartItem = async (cartItemId: string) => {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  };

  // 특정 상품을 장바구니에 담은 모든 사용자 ID 조회 - 조영욱
  getUserIdsByProductId = async (productId: string): Promise<string[]> => {
    const cartItems = await prisma.cartItem.findMany({
      where: { productId },
      select: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });
    const userIds = cartItems.map((item) => item.cart.userId);
    return Array.from(new Set(userIds));
  };

  // 특정 상품의 특정 사이즈를 장바구니에 담았고, 해당 사이즈의 재고가 0인 사용자 ID 조회 - 조영욱
  getUserIdsBySoldOutProduct = async (productId: string, sizeId: number): Promise<string[]> => {
    const cartItems = await prisma.cartItem.findMany({
      where: {
        productId,
        sizeId,
        product: {
          stocks: {
            some: {
              sizeId,
              quantity: 0,
            },
          },
        },
      },
      select: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    });
    const userIds = cartItems.map((item) => item.cart.userId);
    return Array.from(new Set(userIds));
  };
}

export default new CartRepository();
