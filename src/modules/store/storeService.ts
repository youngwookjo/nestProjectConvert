import storeRepository from '@modules/store/storeRepo';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
import {
  CreateStoreDto,
  UpdateStoreDto,
  GetMyProductListDto,
  PublicStoreDto,
  PublicMyStoreDto,
  PublicFavoriteStoreDto,
} from '@modules/store/dto/storeDTO';
import { UserType } from '@prisma/client';
import { deleteImageFromS3 } from '@utils/s3DeleteUtils';

class StoreService {
  createStore = async (userId: string, createStoreDto: CreateStoreDto) => {
    // 유저가 있는지 검사,swagger에는 없으나 에러 케이스 추가 - 404
    // 토큰으로 전달받기에 없는 경우는 없으나 타입 좁히기
    const user = await storeRepository.getUserTypeByUserId(userId);
    assert(user, ApiError.notFound('존재하지 않는 유저입니다.'));
    // 유저 타입이 seller 인지 검사,swagger에는 없으나 에러 케이스 추가 - 400
    assert(user.type === UserType.SELLER, ApiError.badRequest('스토어는 판매자만 만들수 있습니다.'));
    // 스토어가 이미 있는지 조회, swagger에는 없으나 에러 케이스 추가 - 409
    const store = await storeRepository.getStoreIdByUserId(userId);
    assert(!store, ApiError.conflict('이미 스토어가 있습니다.'));
    return await storeRepository.createStore(userId, createStoreDto);
  };

  updateStore = async (userId: string, storeId: string, updateStoreDto: UpdateStoreDto) => {
    // 스토어가 존재하는지 검사, swagger에는 없으나 에러 케이스 추가
    const storeInfo = await storeRepository.getStoreIdByUserId(userId);
    assert(storeInfo, ApiError.notFound('스토어가 존재하지 않습니다'));
    // 스토어가 유저의 스토어인지 검사
    assert(storeInfo.id === storeId, ApiError.forbidden('올바른 접근이 아닙니다.'));

    // 새 이미지가 제공되고 기존 이미지가 있는 경우, 기존 S3 이미지 삭제를 위한 정보 조회
    let oldStoreInfo = null;
    if (updateStoreDto.image) {
      oldStoreInfo = await storeRepository.getImageUrlById(storeId);
    }

    // 스토어 업데이트
    const store = await storeRepository.updateStore(storeId, updateStoreDto);

    // 기존 이미지를 지워야 하는 경우, 기존 S3 이미지 삭제
    if (oldStoreInfo && oldStoreInfo.image) {
      // 업데이트 할 이미지가 없거나 기존 이미지 정보가 없는 경우 실행 x
      await deleteImageFromS3(oldStoreInfo.image);
    }

    return store;
  };

  getStore = async (storeId: string): Promise<PublicStoreDto> => {
    // 스토어 조회, swagger에는 없으나 에러 케이스 추가
    const store = await storeRepository.getStoreById(storeId);
    assert(store, ApiError.notFound('스토어가 존재하지 않습니다'));

    // 형식에 맞게 데이터 가공
    const { _count, ...rest } = store;

    return {
      ...rest,
      favoriteCount: _count.storeLikes,
    };
  };

  getMyProductList = async (userId: string, pagenationDto: GetMyProductListDto) => {
    // 스토어가 존재하는지 검사, swagger에는 없으나 에러 케이스 추가
    const store = await storeRepository.getStoreIdByUserId(userId);
    assert(store, ApiError.notFound('스토어가 존재하지 않습니다'));
    // 내 스토어 등록 상품들 정보 반환
    const productList = await storeRepository.getProductListByStoreId(store.id, pagenationDto);
    return productList;
  };

  getMyStore = async (userId: string): Promise<PublicMyStoreDto> => {
    // 스토어가 존재하는지 검사 + 스토어 아이디 조회, swagger에는 없으나 에러 케이스 추가
    const storeInfo = await storeRepository.getStoreIdByUserId(userId);
    assert(storeInfo, ApiError.notFound('스토어가 존재하지 않습니다'));

    // 데이터 병렬 조회
    const storePromise = storeRepository.getStoreById(storeInfo.id);
    const monthFavoriteCountPromise = storeRepository.getMonthlyLikesByStoreId(storeInfo.id);
    const totalSoldCountPromise = storeRepository.getTotalSalesByStoreId(storeInfo.id);

    const [store, monthFavoriteCount, totalSoldCount] = await Promise.all([
      storePromise,
      monthFavoriteCountPromise,
      totalSoldCountPromise,
    ]);

    // getStoreById 결과가 null일 수 있으나,
    // 바로 위에서 getStoreIdByUserId로 ID를 받아왔으므로 항상 데이터가 있다고 간주.
    const { _count, ...rest } = store!;

    // 최종 데이터 조합
    return {
      ...rest,
      favoriteCount: _count.storeLikes,
      productCount: _count.products,
      monthFavoriteCount,
      totalSoldCount,
    };
  };

  favoriteStore = async (userId: string, storeId: string): Promise<PublicFavoriteStoreDto> => {
    // 이미 관심 스토어인지 확인
    const existingLike = await storeRepository.getStoreLike(userId, storeId);
    assert(!existingLike, ApiError.conflict('이미 관심 스토어로 등록되어 있습니다.'));

    // 실제 존재하는 스토어인지 확인 + 정보 조회 + 타입 좁히기, swagger에는 없으나 에러 케이스 추가
    const store = await storeRepository.getStoreById(storeId);
    assert(store, ApiError.notFound('스토어가 존재하지 않습니다'));

    // 관심 스토어 등록
    await storeRepository.favoriteStore(userId, storeId);

    // 결과 반환
    const { _count, ...rest } = store!;
    return {
      type: 'register',
      store: rest,
    };
  };

  unfavoriteStore = async (userId: string, storeId: string): Promise<PublicFavoriteStoreDto> => {
    // 관심 스토어로 등록되어 있는지 확인
    const existingLike = await storeRepository.getStoreLike(userId, storeId);
    assert(existingLike, ApiError.notFound('관심 스토어로 등록되지 않은 스토어입니다.'));

    // 관심 스토어 해제
    await storeRepository.unfavoriteStore(userId, storeId);

    // 스토어 정보 조회
    const store = await storeRepository.getStoreById(storeId);

    // 결과 반환
    const { _count, ...rest } = store!; // getStoreLike에서 스토어가 있었다면 실제 존재하는 스토어이므로
    return {
      type: 'delete',
      store: rest,
    };
  };
}

export default new StoreService();
