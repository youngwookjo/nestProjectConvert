import { Request, Response } from 'express';
import storeService from '@modules/store/storeService';
import { CreateStoreDto, UpdateStoreDto, GetMyProductListDto } from '@modules/store/dto/storeDTO';

class StoreController {
  createStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const createStoreDto: CreateStoreDto = { ...req.validatedBody };

    // 스토어 생성
    const store = await storeService.createStore(userId, createStoreDto); // service 함수 호출부 입니다.

    // response 반환
    res.status(201).json(store);
  };

  updateStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const { storeId } = req.validatedParams;
    const updateStoreDto: UpdateStoreDto = { ...req.validatedBody };

    // 스토어 업데이트
    const store = await storeService.updateStore(userId, storeId, updateStoreDto); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(200).json(store);
  };

  getStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const { storeId } = req.validatedParams;

    // 스토어 상세 조회
    const store = await storeService.getStore(storeId); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(200).json(store);
  };

  getMyProductList = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const getMyProductListDto: GetMyProductListDto = { ...req.validatedQuery };
    // 스토어 등록 상품 조회
    const store = await storeService.getMyProductList(userId, getMyProductListDto); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(200).json(store);
  };

  getMyStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    // 스토어 등록 상세 조회
    const store = await storeService.getMyStore(userId); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(200).json(store);
  };

  favoriteStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const { storeId } = req.validatedParams;
    // 관심 스토어 등록
    const store = await storeService.favoriteStore(userId, storeId); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(201).json(store);
  };

  unfavoriteStore = async (req: Request, res: Response) => {
    // 전달할 파라미터 및 Dto 정의
    const userId = req.user.id;
    const { storeId } = req.validatedParams;
    // 관심 스토어 해제
    const store = await storeService.unfavoriteStore(userId, storeId); // service 함수 호출부 입니다.

    // resposn 반환
    res.status(200).json(store);
  };
}

export default new StoreController(); // default import로 객체처럼 사용하기 위해 인스턴스를 만들어 export 합니다.
