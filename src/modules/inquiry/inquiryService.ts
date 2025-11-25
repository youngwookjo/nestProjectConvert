import inquiryRepository from '@modules/inquiry/inquiryRepo';
import productRepository from '@modules/product/productRepo';
import storeRepository from '@modules/store/storeRepo';
import notificationService from '@modules/notification/notificationService';
import userRepository from '@modules/user/userRepo';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
import {
  fromPrismaInquiryStatus,
  toPrismaInquiryStatus,
} from '@modules/inquiry/utils/inquiryUtils';
import {
  CreateInquiryDTO,
  GetInquiryResponseDTO,
  GetMyInquiryItemDTO,
  GetMyInquiryListDTO,
  GetMyInquiryListRepoDTO,
  GetMyInquiryListResponseDTO,
  UpdateInquiryDTO,
  InquiryResponseDTO,
  InquiryReplyResponseDTO,
  InquiryReplyDTO,
} from '@modules/inquiry/dto/inquiryDTO';
import { InquiryStatus, UserType } from '@prisma/client';

class InquiryService {
  createInquiry = async (
    userId: string,
    productId: string,
    createInquiryDto: CreateInquiryDTO,
  ): Promise<InquiryResponseDTO> => {
    // path파라미터로 받은 상품이 있는지 먼저 조회
    const product = await productRepository.getProductById(productId);
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // inquiry 등록 레포지토리 호출
    const inquiry = await inquiryRepository.createInquiry(userId, productId, createInquiryDto);

    /* 판매자에게 알림 전송
    그러나 알림 전송도중 알림 실패 때문에 로직이 중지되는 상황을 막기위해 console.error로 에러로그만 남기고
    알림 실패해도 문의 등록은 성공하도록 함 */
    const sellerId = await productRepository.getSellerIdByProductId(productId);
    if (sellerId) {
      await notificationService.notifyNewInquiry(sellerId, product.name);
    } else {
      console.error('판매자 ID가 없습니다. 알림을 보낼 수 없습니다.');
    }

    // 생성된 inquriy 반환
    return {
      ...inquiry,
      status: fromPrismaInquiryStatus(inquiry.status),
    };
  };

  getInquiryList = async (productId: string) => {
    // path파라미터로 받은 상품이 있는지 먼저 조회
    const product = await productRepository.getProductById(productId);
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));

    // 문의 리스트 조회
    const inquiries = await inquiryRepository.getInquiryListByProductId(productId);
    // 문의 개수 조회
    const totalCount = await inquiryRepository.getInquiryCountByProductId(productId);

    // 리스폰스 형태에 맞게 가공
    const formattedList = inquiries.map((inquiry) => ({
      ...inquiry,
      status: fromPrismaInquiryStatus(inquiry.status),
    }));

    // 리스폰스 형태에 맞게 가공 후 반환
    return {
      list: formattedList,
      totalCount,
    };
  };

  getMyInquiryList = async (
    userId: string,
    getMyInquiryListDTO: GetMyInquiryListDTO,
  ): Promise<GetMyInquiryListResponseDTO> => {
    const { status: statusString, ...restOfDto } = getMyInquiryListDTO;

    // repository 레이어에 넣기 위해 prisma 타입으로 변경
    const getMyInquiryListRepoDTO: GetMyInquiryListRepoDTO = {
      ...restOfDto,
      status: statusString ? toPrismaInquiryStatus(statusString) : undefined,
    };

    // 구매자인지 판매자인지 알기 위해 유저 정보 조회
    const user = await userRepository.getUserById(userId);
    assert(user, ApiError.notFound('유저를 찾을 수 없습니다.'));

    // 페이지네이션 된 문의 리스트 및 문의 개수 조회
    let list;
    let totalCount;
    if (user.type === UserType.BUYER) {
      // 구매자인 경우 자신이 등록한 문의 조회
      [list, totalCount] = await Promise.all([
        inquiryRepository.getInquiryListByUserId(userId, getMyInquiryListRepoDTO),
        inquiryRepository.getTotalCountByUserId(userId, getMyInquiryListRepoDTO.status),
      ]);
    } else {
      // 판매자인 경우 스토어의 id와 일치하는 product들의 문의 조회
      const store = await storeRepository.getStoreIdByUserId(userId);
      assert(store, ApiError.notFound('스토어를 찾을 수 없습니다.'));
      [list, totalCount] = await Promise.all([
        inquiryRepository.getInquiryListByStoreId(store.id, getMyInquiryListRepoDTO),
        inquiryRepository.getTotalCountByStoreId(store.id, getMyInquiryListRepoDTO.status),
      ]);
    }

    // 리스폰스 형태에 맞게 가공 + status 문자열 형태 변경
    const formattedList: GetMyInquiryItemDTO[] = list.map((inquiry) => ({
      ...inquiry,
      status: fromPrismaInquiryStatus(inquiry.status),
    }));

    return { list: formattedList, totalCount };
  };

  getInquiry = async (inquiryId: string): Promise<GetInquiryResponseDTO> => {
    // 문의 상세 조회
    const inquiry = await inquiryRepository.getInquiryById(inquiryId);
    assert(inquiry, ApiError.notFound('문의가 존재하지 않습니다.'));

    // 리스폰스 형태에 맞게 가공
    return {
      ...inquiry,
      status: fromPrismaInquiryStatus(inquiry.status),
    };
  };

  updateInquiry = async (
    userId: string,
    inquiryId: string,
    updateInquiryDto: UpdateInquiryDTO,
  ): Promise<InquiryResponseDTO> => {
    // 수정할 문의가 있는지 먼저 조회
    const inquiry = await inquiryRepository.getInquiryById(inquiryId);
    assert(inquiry, ApiError.notFound('문의를 찾을 수 없습니다.'));

    // 자신이 등록한 문의인지 확인
    assert(
      inquiry.userId === userId,
      ApiError.forbidden('자신이 등록한 문의만 수정할 수 있습니다.'),
    );

    // 답변 상태가 아직 대기중인지 확인
    assert(
      inquiry.status === InquiryStatus.WAITING_ANSWER,
      ApiError.forbidden('답변이 등록된 문의는 수정할 수 없습니다.'),
    );

    // 문의 수정
    const updatedInquiry = await inquiryRepository.updateInquiry(inquiryId, updateInquiryDto);

    // 수정된 문의 반환
    return {
      ...updatedInquiry,
      status: fromPrismaInquiryStatus(updatedInquiry.status),
    };
  };

  deleteInquiry = async (userId: string, inquiryId: string): Promise<InquiryResponseDTO> => {
    // 삭제할 문의가 있는지 먼저 조회
    const inquiry = await inquiryRepository.getInquiryById(inquiryId);
    assert(inquiry, ApiError.notFound('문의를 찾을 수 없습니다.'));

    // 자신이 등록한 문의인지 확인
    assert(
      inquiry.userId === userId,
      ApiError.forbidden('자신이 등록한 문의만 삭제할 수 있습니다.'),
    );

    // 문의 삭제
    const deletedInquiry = await inquiryRepository.deleteInquiry(inquiryId);

    // 삭제된 문의 반환
    return {
      ...deletedInquiry,
      status: fromPrismaInquiryStatus(deletedInquiry.status),
    };
  };

  createInquiryReply = async (
    userId: string,
    inquiryId: string,
    inquiryReplyDto: InquiryReplyDTO,
  ): Promise<InquiryReplyResponseDTO> => {
    // 문의 조회
    const inquiry = await inquiryRepository.getInquiryById(inquiryId);
    assert(inquiry, ApiError.notFound('문의를 찾을 수 없습니다.'));

    // 유저 조회 - 유저의 타입을 알아야 하므로
    const user = await userRepository.getUserById(userId);
    assert(user, ApiError.notFound('유저를 찾을 수 없습니다.'));

    // 판매자만 답변 가능
    assert(
      user.type === UserType.SELLER,
      ApiError.forbidden('판매자만 답변을 등록할 수 있습니다.'),
    );

    // 판매자가 해당 상품의 판매자인지 확인
    const product = await productRepository.getProductByIdWithRelations(inquiry.productId);
    assert(product, ApiError.notFound('상품을 찾을 수 없습니다.'));
    assert(
      product.store.userId === userId,
      ApiError.forbidden('해당 상품의 판매자만 답변을 등록할 수 있습니다.'),
    );

    // 5. 이미 답변이 등록된 문의인지 확인
    assert(!inquiry.reply, ApiError.conflict('이미 답변이 등록된 문의입니다.'));

    // 6. 문의 답변 생성 및 문의 상태 변경 (트랜잭션)
    const inquiryReply = await inquiryRepository.createInquiryReply(
      inquiryId,
      userId,
      inquiryReplyDto,
    );
    // 문의자에게 답변 알림 전달 에러 상황 대비해 로직에 영향없이 콘솔에러만 출력
    try {
      await notificationService.notifyInquiryAnswered(inquiry.userId, inquiry.title);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }

    return inquiryReply;
  };

  updateInquiryReply = async (
    userId: string,
    replyId: string,
    inquiryReplyDto: InquiryReplyDTO,
  ): Promise<InquiryReplyResponseDTO> => {
    // 답변 조회
    const inquiryReply = await inquiryRepository.getInquiryReplyById(replyId);
    assert(inquiryReply, ApiError.notFound('답변을 찾을 수 없습니다.'));

    // 답변 작성자 본인인지 확인
    assert(
      inquiryReply.userId === userId,
      ApiError.forbidden('자신이 등록한 답변만 수정할 수 있습니다.'),
    );

    // 문의 답변 수정
    const updatedInquiryReply = await inquiryRepository.updateInquiryReply(
      replyId,
      inquiryReplyDto,
    );

    return updatedInquiryReply;
  };
}

export default new InquiryService();
