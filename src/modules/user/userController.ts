import { Request, Response } from 'express';
import userService from '@modules/user/userService';
import { CreateUserDto, UpdateUserDto } from '@modules/user/dto/userDTO';

class UserController {
  /**
   * @description
   * 새로운 유저를 생성합니다.
   *
   * 아이디, 이름, 비밀번호 정보를 받아 새로운 유저를 생성합니다.
   * 데이터가 잘못되었거나 이메일 또는 이름이 중복될 경우 에러를 발생시킵니다.
   * 서버 오류로 인해 유저 생성에 실패할 수 있습니다.
   *
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   *
   * @returns {Object} 생성된 유저 정보 (HTTP 201)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터
   * @throws {ApiError} 409 - 이메일 또는 이름 중복
   * @throws {ApiError} 500 - 서버 내부 오류
   */

  createUser = async (req: Request, res: Response) => {
    const createUserDto: CreateUserDto = { ...req.validatedBody };
    const user = await userService.createUser(createUserDto);
    res.status(201).json(user);
  };

  /**
   * @description
   * 본인의 정보를 조회합니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns {Object} 사용자 정보 (HTTP 200)
   *
   * @throws {ApiError} 404 - 존재하지 않는 사용자
   * @throws {ApiError} 500 - 서버 내부 오류
   */

  getUser = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const user = await userService.getUser(userId);
    res.status(200).json(user);
  };

  /**
   * @description
   * 사용자 정보를 업데이트합니다.
   *
   * 이름, 비밀번호, 이미지 정보를 받아 사용자를 업데이트합니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns {Object} 업데이트된 사용자 정보 (HTTP 200)
   *
   * @throws {ApiError} 400 - 잘못된 요청 데이터, 새 비밀번호가 현재 비밀번호와 동일함
   * @throws {ApiError} 404 - 존재하지 않는 사용자
   * @throws {ApiError} 401 - 현재 비밀번호가 올바르지 않음
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  updateUser = async (req: Request, res: Response) => {
    const updateUserDto: UpdateUserDto = {
      userId: req.user.id,
      ...req.validatedBody,
    };
    const user = await userService.updateUser(updateUserDto);
    res.status(200).json(user);
  };

  /**
   * @description
   * 사용자를 삭제합니다.
   *
   * 사용자의 ID를 받아 해당 사용자를 삭제합니다.
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns {void} (HTTP 204)
   *
   * @throws {ApiError} 404 - 존재하지 않는 사용자
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  deleteUser = async (req: Request, res: Response) => {
    const userId = req.user.id;
    await userService.deleteUser(userId);
    res.sendStatus(204);
  };

  /**
   * @description
   * 좋아요한 상점 목록을 조회합니다.
   *
   * @param req - 요청 객체
   * @param res - 응답 객체
   *
   * @returns {Object[]} 좋아요한 상점 목록 (HTTP 200)
   *
   * @throws {ApiError} 500 - 서버 내부 오류
   */
  getFavoriteStoreList = async (req: Request, res: Response) => {
    const userId = req.user.id;
    const favoriteStores = await userService.getFavoriteStoreList(userId);
    res.status(200).json(favoriteStores);
  };
}

export default new UserController();
