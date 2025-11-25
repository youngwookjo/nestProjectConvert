/**
 * 본 파일에서 통합(엔드포인트) 테스트 코드를 작성합니다
 * 엔드포인트 테스트는 성공의 경우 [상태코드]와 [리턴값]을
 * 실패일 경우 [상태코드]가 예상한 값과 맞는지 검사합니다.
 */
import { afterAll, describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '../../../shared/prisma';
import { sampleDTO } from '../dto/sampleDTO';

describe('Sample API', () => {
  /*
    추가적인 mock 데이터를 활용할 경우, beforeEach와 같은 메소드를 활용 가능
  */
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 인증(로그인)이 불필요한 경우
  describe('POST /api/sample - User 정보 필요 x', () => {
    test('성공 케이스 - 상태코드 200, 데이터 확인 ', async () => {
      // 바디값 설정
      const sampleData = {
        id: 1,
        content: 'Test content',
      };

      // api 요청
      const response = await request(app).post('/api/sample').send(sampleData);

      // 상태코드 및 예상 데이터가 맞는지 확인
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(sampleData);
    });

    test('실패 케이스-400(bad request) id 필수값 누락', async () => {
      // 바디값 설정
      const sampleData = {
        content: 'Test content',
      };

      // api 요청
      const response = await request(app).post('/api/sample').send(sampleData);

      // validation 미들웨어가 400을 리턴하는 케이스가 있을때 경우입니다.
      expect(response.status).toBe(400);
    });
  });

  //로그인(인증이 필요한 경우)
  describe('POST /api/sample - User 인증 필요', () => {
    test('성공 케이스 - 상태코드 200, 데이터 확인 ', async () => {
      // 초기 셋팅 필요 - 로그인할 회원 정보
      const loginData = {
        email: 'login@email',
        password: 'password',
      };
      // 생성 데이터
      const sampleDTO = {
        id: 1,
        content: 'Test content',
      };
      // agent 생성
      const agent = request.agent(app);
      // 로그인 필요
      const loginRes = await agent.post('/users/login').send(loginData);
      const { accessToken } = loginRes.body;

      // 게시글 생성 요청
      // 로그인시 전달받은 액세스 토큰을 Bearer Token에다가 설정
      const res = await agent
        .post('/sample')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(sampleDTO);

      // 상태코드 201 검증
      expect(res.status).toBe(201);
      // 자동 생성 값 외에 입력값이 제대로 들어갔는지 검증
      const { id, ...sample } = res.body as sampleDTO;
      expect(sample).toEqual(sampleDTO);
    });

    test('실패 케이스-400(bad request) content 필수값 누락', async () => {
      // 초기 셋팅 필요 - 로그인할 회원 정보
      const loginData = {
        email: 'login@email',
        password: 'password',
      };
      // 생성 데이터 - content
      const sampleDTO = {
        id: 1,
      };
      // agent 생성
      const agent = request.agent(app);
      // 로그인 필요
      const loginRes = await agent.post('/users/login').send(loginData);
      const { accessToken } = loginRes.body;

      // 게시글 생성 요청
      // 로그인시 전달받은 액세스 토큰을 Bearer Token에다가 설정
      const res = await agent
        .post('/sample')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(sampleDTO);

      // 상태코드 400 검증
      expect(res.status).toBe(400);
    });

    // 예시가 적절하지는 않으나 이 엔드포인트가 다른 유저의 리소스의 접근한다고 가정
    test('실패 케이스-401(UnAuthorized) 인증 안된 경우', async () => {
      // 초기 셋팅 필요 - 로그인할 회원 정보
      const loginData = {
        email: 'attacker@email',
        password: 'password',
      };
      // 생성 데이터 - content
      const sampleDTO = {
        id: 1,
        content: '이 데이터의 id는 원래 유저와 같아야 합니다',
      };
      // agent 생성
      const agent = request.agent(app);
      // 로그인 필요
      const loginRes = await agent.post('/users/login').send(loginData);
      const { accessToken } = loginRes.body;

      // 게시글 생성 요청
      // 로그인시 전달받은 액세스 토큰을 Bearer Token에다가 설정
      const res = await agent
        .post('/sample')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(sampleDTO);

      // 상태코드 401 검증
      expect(res.status).toBe(401);
    });
  });
});
