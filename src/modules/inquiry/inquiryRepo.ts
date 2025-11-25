import { prisma } from '@shared/prisma';
import {
  CreateInquiryDTO,
  GetMyInquiryListRepoDTO,
  InquiryReplyDTO,
  UpdateInquiryDTO,
} from '@modules/inquiry/dto/inquiryDTO';
import { InquiryStatus } from '@prisma/client';

const myInquiryListQuerySelect = {
  id: true,
  title: true,
  isSecret: true,
  status: true,
  createdAt: true,
  content: true,
  product: {
    select: {
      id: true,
      name: true,
      image: true,
      store: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};

class InquiryRepository {
  createInquiry = async (userId: string, productId: string, createInquiryDto: CreateInquiryDTO) => {
    return await prisma.inquiry.create({
      data: {
        ...createInquiryDto,
        userId,
        productId,
      },
    });
  };

  getInquiryListByProductId = async (productId: string) => {
    return await prisma.inquiry.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        reply: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  };

  getInquiryCountByProductId = async (productId: string) => {
    return await prisma.inquiry.count({
      where: {
        productId,
      },
    });
  };

  getInquiryById = async (inquiryId: string) => {
    return await prisma.inquiry.findUnique({
      where: {
        id: inquiryId,
      },
      select: {
        id: true,
        userId: true,
        productId: true,
        title: true,
        content: true,
        isSecret: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        reply: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  };

  // 페이지네이션으로 일부 정보만 받아온 문의 리스트 (구매자)
  getInquiryListByUserId = async (
    userId: string,
    { page, pageSize, status }: GetMyInquiryListRepoDTO,
  ) => {
    return await prisma.inquiry.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      select: myInquiryListQuerySelect,
      ...this._paginateQuery(page, pageSize),
    });
  };

  // 문의 개수 조회 (구매자)
  getTotalCountByUserId = async (userId: string, status?: InquiryStatus) => {
    return await prisma.inquiry.count({
      where: {
        userId,
        ...(status && { status }),
      },
    });
  };

  // 페이지네이션으로 일부 정보만 받아온 문의 리스트 (판매자)
  getInquiryListByStoreId = async (
    storeId: string,
    { page, pageSize, status }: GetMyInquiryListRepoDTO,
  ) => {
    return await prisma.inquiry.findMany({
      where: {
        product: {
          storeId,
        },
        ...(status && { status }),
      },
      select: myInquiryListQuerySelect,
      ...this._paginateQuery(page, pageSize),
    });
  };

  // 문의 개수 조회 (판매자)
  getTotalCountByStoreId = async (storeId: string, status?: InquiryStatus) => {
    return await prisma.inquiry.count({
      where: {
        product: {
          storeId,
        },
        ...(status && { status }),
      },
    });
  };
  // 공통 페이징 함수
  private _paginateQuery = (
    page: number,
    pageSize: number,
    orderBy: any = { createdAt: 'desc' },
  ) => ({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy,
  });

  updateInquiry = async (inquiryId: string, updateInquiryDto: UpdateInquiryDTO) => {
    return await prisma.inquiry.update({
      where: {
        id: inquiryId,
      },
      data: {
        ...updateInquiryDto,
      },
    });
  };

  deleteInquiry = async (inquiryId: string) => {
    return await prisma.inquiry.delete({
      where: {
        id: inquiryId,
      },
    });
  };

  // 문의 답변 생성
  createInquiryReply = async (
    inquiryId: string,
    userId: string,
    inquiryReplyDto: InquiryReplyDTO,
  ) => {
    return await prisma.$transaction(async (tx) => {
      const inquiryReply = await tx.inquiryReply.create({
        data: {
          inquiryId,
          userId,
          content: inquiryReplyDto.content,
        },
      });

      await tx.inquiry.update({
        where: {
          id: inquiryId,
        },
        data: {
          status: InquiryStatus.COMPLETED_ANSWER,
        },
      });

      return inquiryReply;
    });
  };

  // 문의 답변 수정
  updateInquiryReply = async (replyId: string, inquiryReplyDto: InquiryReplyDTO) => {
    return await prisma.inquiryReply.update({
      where: {
        id: replyId,
      },
      data: {
        content: inquiryReplyDto.content,
      },
    });
  };

  // 답변 ID로 답변 조회
  getInquiryReplyById = async (replyId: string) => {
    return await prisma.inquiryReply.findUnique({
      where: {
        id: replyId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  };
}

export default new InquiryRepository();
