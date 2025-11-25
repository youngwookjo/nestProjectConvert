import cartRepository from '@modules/cart/cartRepo';
import productRepository from '@modules/product/productRepo';
import {
  CreatedCartDto,
  GetCartDto,
  UpdateCartDto,
  CartItemResponseDto,
} from '@modules/cart/dto/cartDTO';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';

class CartService {
  // 장바구니 생성 또는 기존 장바구니 반환
  createOrGetCart = async (userId: string): Promise<CreatedCartDto> => {
    // 기존 장바구니 조회
    let cart = await cartRepository.getByUserId(userId);

    // 장바구니가 없으면 생성
    if (!cart) {
      cart = await cartRepository.createCart(userId);
    }

    // quantity 계산 (cartItems의 총 수량 합계)
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // 응답 DTO로 변환 (buyerId는 userId를 매핑)
    return {
      id: cart.id,
      buyerId: cart.userId,
      quantity: totalQuantity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  };

  // 장바구니 조회 (상세 정보 포함)
  getCart = async (userId: string): Promise<GetCartDto> => {
    // 기존 장바구니 조회
    let cart = await cartRepository.getCartWithDetails(userId);

    // 장바구니가 없으면 생성
    if (!cart) {
      // 장바구니가 없으면 빈 장바구니 생성
      const newCart = await cartRepository.createCart(userId);
      return {
        id: newCart.id,
        buyerId: newCart.userId,
        quantity: 0,
        createdAt: newCart.createdAt,
        updatedAt: newCart.updatedAt,
        items: [],
      };
    }

    // quantity 계산 (cartItems의 총 수량 합계)
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // 응답 DTO로 변환 (buyerId는 userId를 매핑)
    return {
      id: cart.id,
      buyerId: cart.userId,
      quantity: totalQuantity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: {
          id: item.product.id,
          storeId: item.product.storeId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          discountRate: item.product.discountRate,
          discountStartTime: item.product.discountStartTime,
          discountEndTime: item.product.discountEndTime,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
          store: {
            id: item.product.store.id,
            userId: item.product.store.userId,
            name: item.product.store.name,
            address: item.product.store.address,
            phoneNumber: item.product.store.phoneNumber,
            content: item.product.store.content,
            image: item.product.store.image,
            createdAt: item.product.store.createdAt,
            updatedAt: item.product.store.updatedAt,
          },
          stocks: item.product.stocks.map((stock) => ({
            id: stock.id,
            productId: stock.productId,
            sizeId: stock.sizeId,
            quantity: stock.quantity,
            size: {
              id: stock.size.id,
              size: {
                en: stock.size.en,
                ko: stock.size.ko,
              },
            },
          })),
        },
      })),
    };
  };

  // 장바구니 수정 (아이템 추가/수량 수정)
  updateCart = async (userId: string, data: UpdateCartDto): Promise<CartItemResponseDto[]> => {
    const { productId, sizes } = data;

    // 1. 상품 존재 여부 확인
    const productExists = await productRepository.checkProductExists(productId);
    assert(productExists, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // 2. 장바구니 조회 또는 생성
    let cart = await cartRepository.getByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCart(userId);
    }

    // 3. 각 사이즈별로 재고 확인 및 CartItem upsert
    const updatedItems: CartItemResponseDto[] = [];

    for (const sizeInfo of sizes) {
      const { sizeId, quantity } = sizeInfo;

      // 재고 확인
      const stock = await productRepository.getStock(productId, sizeId);
      assert(stock, ApiError.notFound(`사이즈 ID ${sizeId}에 대한 재고를 찾을 수 없습니다.`));
      assert(
        stock.quantity >= quantity,
        ApiError.badRequest(
          `사이즈 ID ${sizeId}의 재고가 부족합니다. (요청: ${quantity}, 재고: ${stock.quantity})`,
        ),
      );

      // CartItem upsert
      const cartItem = await cartRepository.upsertCartItem(cart.id, productId, sizeId, quantity);
      updatedItems.push(cartItem);
    }

    return updatedItems;
  };

  // 장바구니 아이템 삭제
  deleteCartItem = async (userId: string, cartItemId: string): Promise<void> => {
    // 1. 장바구니 아이템 조회
    const cartItem = await cartRepository.getCartItemById(cartItemId);

    // 2. 아이템이 없으면 404 에러
    assert(cartItem, ApiError.notFound('장바구니에 아이템이 없습니다.'));

    // 3. 권한 확인 (요청한 사용자의 장바구니 아이템인지 확인)
    assert(cartItem.cart.userId === userId, ApiError.forbidden('접근 권한이 없습니다.'));

    // 4. 장바구니 아이템 삭제
    await cartRepository.deleteCartItem(cartItemId);
  };
}

export default new CartService();
