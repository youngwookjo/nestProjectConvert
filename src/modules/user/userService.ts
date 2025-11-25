import { Prisma } from '@prisma/client';
import userRepository from '@modules/user/userRepo';
import { metadataRepository } from '@modules/metadata/metadataRepo';
import { ApiError } from '@errors/ApiError';
import { assert } from '@utils/assert';
import { hashPassword, isPasswordValid } from '@modules/auth/utils/passwordUtils';
import {
  CreateUserDto,
  UpdateUserDto,
  CreatedUserDto,
  ResUserDto,
} from '@modules/user/dto/userDTO';
import { ResFavoriteStoreDto } from '@modules/user/dto/favoriteStoreDTO';
import { deleteImageFromS3 } from '@utils/s3DeleteUtils';

class UserService {
  sensitiveUserDataFilter = (user: CreatedUserDto): ResUserDto => {
    const { totalAmount, password, ...rest } = user;
    const { createdAt, updatedAt, ...gradeInfo } = rest.grade;
    const filteredUser = {
      ...rest,
      grade: gradeInfo,
    };
    return filteredUser;
  };

  createUser = async (createUserDto: CreateUserDto): Promise<ResUserDto> => {
    const existingUser = await userRepository.getUserByEmail(createUserDto.email);
    assert(!existingUser, ApiError.conflict('이미 존재하는 이메일입니다.'));

    const existingName = await userRepository.getUserByName(createUserDto.name);
    assert(!existingName, ApiError.conflict('이미 존재하는 이름입니다.'));

    createUserDto.password = await hashPassword(createUserDto.password);
    const createdUser = await userRepository.createUser(createUserDto);
    return this.sensitiveUserDataFilter(createdUser);
  };

  getUser = async (userId: string): Promise<ResUserDto> => {
    const user = await userRepository.getUserById(userId);
    assert(user, ApiError.notFound('존재하지 않는 사용자입니다.'));

    return this.sensitiveUserDataFilter(user);
  };

  updateUser = async (updateUserDto: UpdateUserDto): Promise<ResUserDto> => {
    assert(
      updateUserDto.newPassword !== updateUserDto.currentPassword,
      ApiError.badRequest('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.'),
    );

    const user = await userRepository.getUserById(updateUserDto.userId);
    assert(user, ApiError.notFound('존재하지 않는 사용자입니다.'));

    const isValid = await isPasswordValid(updateUserDto.currentPassword, user.password);
    assert(isValid, ApiError.badRequest('현재 비밀번호가 올바르지 않습니다.'));

    const existingName = await userRepository.getUserByName(updateUserDto.name);
    assert(
      !existingName || existingName.id === updateUserDto.userId,
      ApiError.conflict('이미 존재하는 이름입니다.'),
    );

    updateUserDto.newPassword = await hashPassword(updateUserDto.newPassword);

    const updatedUser = await userRepository.updateUser(updateUserDto);
    if (user.image && updateUserDto.image && updateUserDto.image !== user.image) {
      await deleteImageFromS3(user.image);
    }
    return this.sensitiveUserDataFilter(updatedUser);
  };

  deleteUser = async (userId: string) => {
    const user = await userRepository.getUserById(userId);
    assert(user, ApiError.notFound('존재하지 않는 사용자입니다.'));

    const deletedUser = await userRepository.deleteUser(userId);
    if (deletedUser.image) {
      await deleteImageFromS3(deletedUser.image);
    }

    return deletedUser;
  };

  getFavoriteStoreList = async (userId: string): Promise<ResFavoriteStoreDto[]> => {
    const favoriteStoreList = await userRepository.getFavoriteStoreList(userId);
    return favoriteStoreList;
  };

  getUserByEmail = async (email: string): Promise<CreatedUserDto | null> => {
    const user = await userRepository.getUserByEmail(email);
    return user;
  };

  /**
   * 사용자 등급 재계산 (OrderRepo의 트랜잭션 내에서 사용)
   * 작성자: 박재성 (Order API 담당)
   * totalAmount를 기준으로 적절한 등급을 결정하고 업데이트합니다.
   */
  recalculateUserGrade = async (userId: string, tx: Prisma.TransactionClient) => {
    // 1. 사용자의 현재 totalAmount와 gradeId 조회
    const user = await userRepository.getUserForGradeUpdate(userId, tx);
    assert(user, ApiError.notFound('사용자를 찾을 수 없습니다.'));

    // 2. 모든 등급을 minAmount 내림차순으로 조회
    const grades = await metadataRepository.getGradeListSortedByMinAmountDesc(tx);

    // 3. totalAmount에 맞는 등급 결정
    let newGradeId = grades[grades.length - 1].id; // 기본값: 가장 낮은 등급
    for (const grade of grades) {
      if (user.totalAmount >= grade.minAmount) {
        newGradeId = grade.id;
        break;
      }
    }

    // 4. 등급이 변경된 경우에만 업데이트
    if (user.gradeId !== newGradeId) {
      return await userRepository.updateGradeId(userId, newGradeId, tx);
    }

    return null;
  };
}

export default new UserService();
