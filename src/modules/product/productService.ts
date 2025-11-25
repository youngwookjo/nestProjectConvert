import productRepository from '@modules/product/productRepo';
import storeRepository from '@modules/store/storeRepo';
import notificationService from '@modules/notification/notificationService';
import cartRepository from '@modules/cart/cartRepo';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
import {
  CreateProductDto,
  ProductResponseDto,
  GetProductListDto,
  UpdateProductDto,
  UpdateProductRepoDto,
} from '@modules/product/dto/productDTO';
import { CATEGORY_NAMES } from '@modules/product/dto/productConstant';
import { deleteImageFromS3 } from '@utils/s3DeleteUtils';

class ProductService {
  createProduct = async (
    userId: string,
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> => {
    const store = await storeRepository.getStoreIdByUserId(userId);
    assert(store, ApiError.notFound('스토어를 찾을수 없습니다.'));

    const { categoryName, price, discountRate, ...restOfDto } = createProductDto;

    const category = await productRepository.getCategoryByName(categoryName);
    assert(category, ApiError.notFound('존재하지 않는 카테고리 입니다.'));

    let discountPrice: number = price;
    if (discountRate) {
      discountPrice = Math.round(price * (1 - discountRate / 100));
    }
    // DB 삽입에 필요한 데이터 재정의
    const productData = {
      ...restOfDto,
      price,
      discountRate: discountRate ?? 0,
      discountPrice,
      categoryId: category.id,
      stocks: createProductDto.stocks,
    };

    // product 생성 레포지토리 메소드 호출
    const product = await productRepository.createProduct(store.id, productData);

    // 리스폰스 형태에 맞게 가공
    return this._formatProductResponse(product, store.name);
  };

  getProductList = async (getProductListDto: GetProductListDto) => {
    const { categoryName } = getProductListDto;

    // 상품을 찾을 수 없을때는 빈 배열 + count 0이므로 에러 x
    // 올바르지 않은 카테고리가 들어왔을 경우 404 에러
    assert(
      !categoryName || CATEGORY_NAMES.includes(categoryName as any),
      ApiError.notFound('존재하지 않는 카테고리 입니다.')
    );

    // 레포지토리 함수 호출 : 상품들 정보, 전체 상품 개수
    const totalCount = await productRepository.getProductCount(getProductListDto);
    const products = await productRepository.getProductList(getProductListDto);

    // 반환 형태에 맞게 가공
    const formattedProducts = products.map((product) => {
      // Prisma 쿼리 결과에서 필요한 속성들을 추출합니다。
      const { reviews, stocks, store, orderItems, category, content, ...restOfProduct } = product;

      const { reviewsCount, reviewsRating, sales, isSoldOut } = this._processProductStats(product);

      // 최종적으로 클라이언트에 반환될 상품 정보를 구성합니다。
      return {
        ...restOfProduct, // 기본적으로 받은 정보 사용
        discountPrice: restOfProduct.discountPrice ?? 0, // null로 저장될 수 있으므로 없는 경우 0 반환
        storeName: store.name, // 스토어 이름
        reviewsCount, // 총 리뷰 개수
        reviewsRating, // 평균 리뷰 점수
        sales, // 총 판매량
        isSoldOut, // 품절 여부
      };
    });

    return {
      list: formattedProducts,
      totalCount,
    };
  };

  updateProduct = async (
    userId: string,
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> => {
    // 상품을 찾을수 없는 경우 에러
    const product = await productRepository.getProductById(productId);
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // 본인에 스토어에 등록된 상품인지 확인, 명세서에는 없는 추가 에러
    const store = await storeRepository.getStoreIdByUserId(userId);
    assert(store, ApiError.notFound('스토어를 찾을수 없습니다.'));
    assert(product.storeId === store.id, ApiError.forbidden('상품을 수정할 권한이 없습니다.'));

    const { categoryName, price, discountRate, ...restOfDto } = updateProductDto;

    const repoDto: UpdateProductRepoDto = { ...restOfDto, stocks: updateProductDto.stocks };

    // 수정하고자 하는 카테고리가 DB에 없는 이름일 경우 에러
    if (categoryName) {
      const category = await productRepository.getCategoryByName(categoryName);
      assert(category, ApiError.notFound('존재하지 않는 카테고리 입니다.'));
      repoDto.categoryId = category.id;
    }

    // 할인율 및 할인된 금액 계산
    // 할인율이나 가격 중 하나라도 변동되면, 없는 경우 기존값을 가져와서 다시 계산 필요
    const finalPrice = price !== undefined ? price : product.price;
    const finalDiscountRate =
      discountRate !== undefined ? (discountRate ?? 0) : product.discountRate;

    // price와 discountRate 둘 다 수정이 없으면 이 로직은 건너뜀
    if (price !== undefined || discountRate !== undefined) {
      repoDto.price = finalPrice;
      repoDto.discountRate = finalDiscountRate;
      repoDto.discountPrice = Math.round(finalPrice * (1 - finalDiscountRate / 100));
    }

    // product 업데이트 레포지토리 메소드 호출
    const updatedProduct = await productRepository.updateProduct(productId, repoDto);

    // 재고가 품절로 변경된 경우, 장바구니에 담긴 유저들에게 알림 전송
    try {
      const soldOutStocks = updatedProduct.stocks.filter((stock) => stock.quantity === 0);
      if (soldOutStocks.length > 0) {
        for (const stock of soldOutStocks) {
          const cartUserIds = await cartRepository.getUserIdsBySoldOutProduct(
            productId,
            stock.size.id,
          );

          await notificationService.notifyOutOfStock({
            sellerId: userId,
            storeName: store.name,
            productName: updatedProduct.name,
            sizeName: stock.size.en,
            cartUserIds,
          });
        }
      }
    } catch (error) {
      console.error('상품 업데이트 중 알림 전송 에러:', error);
    }

    // 새 이미지가 제공되고 기존 이미지가 있는 경우, 기존 S3 이미지 삭제
    if (repoDto.image && product.image) {
      await deleteImageFromS3(product.image);
    }

    // 리스폰스 형태에 맞게 가공
    return this._formatProductResponse(updatedProduct, store.name);
  };

  getProduct = async (productId: string): Promise<ProductResponseDto> => {
    // product 조회 레포지토리 메소드 호출
    const product = await productRepository.getProductByIdWithRelations(productId);

    // id로 받은 상품이 없을 경우 에러
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // 리스폰스 형태에 맞게 가공
    return this._formatProductResponse(product, product.store.name);
  };

  deleteProduct = async (userId: string, productId: string) => {
    // 삭제할 상품이 있는지 + 상품이 포함된 스토어의 권한 확인을 위해 먼저 조회
    const product = await productRepository.getProductById(productId);
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // 삭제 권한이 있는지 조회를 위해 스토어 조회
    const store = await storeRepository.getStoreIdByUserId(userId);
    assert(store, ApiError.notFound('스토어를 찾을수 없습니다.'));
    // 상품이 유저의 스토어와 id가 같은지 권한 체크
    assert(product.storeId === store.id, ApiError.forbidden('상품을 삭제할 권한이 없습니다.'));

    // product 삭제 레포지토리 메소드 호출
    await productRepository.deleteProduct(productId);

    // 기존에 S3에 업로드된 이미지 삭제
    if (product.image) {
      await deleteImageFromS3(product.image);
    }
  };

  // Repository에서 받은 값을 활용해서 필요한 값 계산하는 함수
  private _processProductStats = (product: any) => {
    const { reviews, stocks, orderItems } = product;

    // 1. 리뷰 관련 수치 계산
    // 리뷰 개수
    const reviewsCount = reviews.length;
    let sumScore = 0;
    // 리뷰 평점별 개수
    const ratingCountsArray = [0, 0, 0, 0, 0];
    if (reviewsCount > 0) {
      for (const review of reviews) {
        // 각 평점별로 인덱스에 맞게 값 넣어주기
        ratingCountsArray[review.rating - 1]++;
        // 총점에 더하기
        sumScore += review.rating;
      }
    }
    // 리뷰 평균 점수 계산: 리뷰가 있을 경우에만 계산하며, 없을 경우 0으로 설정
    const reviewsRating = reviewsCount > 0 ? sumScore / reviewsCount : 0;

    // 배열로 정렬된 값을 리스폰스 형태에 맞게 가공
    const ratingCounts: { [key: string]: number } = {};
    for (let i = 0; i < 5; i++) {
      ratingCounts[`rate${i + 1}Length`] = ratingCountsArray[i];
    }
    ratingCounts['sumScore'] = sumScore;

    // 2. 재고 관련 수치 계산
    // isSoldOut 계산: 모든 재고(stocks)의 총 수량이 0이면 품절
    const totalQuantity = stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
    const isSoldOut = totalQuantity === 0;
    // stocks 필드 en을 name으로 변경
    const transformedStocks = stocks.map((stock: any) => ({
      id: stock.id,
      quantity: stock.quantity,
      size: {
        id: stock.size.id,
        name: stock.size.en,
      },
    }));

    // 3. 판매량 계산: 해당 상품의 모든 주문 항목(orderItems)의 수량을 합산
    const sales = orderItems
      ? orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
      : 0;

    return {
      reviewsCount,
      reviewsRating,
      ratingCounts,
      isSoldOut,
      transformedStocks,
      sales,
    };
  };

  private _formatProductResponse = (product: any, storeName: string): ProductResponseDto => {
    // 반환값 수치 계산
    const { reviews, stocks, store, ...restOfProduct } = product;
    const { reviewsRating, ratingCounts, isSoldOut, transformedStocks } =
      this._processProductStats(product);

    // 리스폰스 형식에 맞게 가공
    return {
      ...restOfProduct,
      storeName: storeName,
      stocks: transformedStocks,
      reviewsRating,
      reviews: ratingCounts,
      isSoldOut,
    };
  };
}

export default new ProductService();
