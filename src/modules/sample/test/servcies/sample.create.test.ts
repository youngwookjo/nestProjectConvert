/**
 * 본 파일에서 유닛 테스트 코드를 작성합니다 (예시 : 서비스)
 * mock 방식을 사용할 경우
 * 메소드가 [원하는 인자로 호출]되었는지와 모킹된 메소드가 [예상 결과값을 반환]하는지 검증합니다.
 * spy 방식을 사용할 경우
 * 메소드가 [원하는 인자로 호출]되었는지 검사합니다.
 */
import { afterAll, afterEach, describe, test, expect, jest } from '@jest/globals';
import sampleService from '../../sampleService';
import sampleRepository from '../../sampleRepo';
import { sampleDTO } from '../../dto/sampleDTO';
import { prisma } from '../../../../shared/prisma';

/*
    SampleService 단위 테스트 - create
    추가적인 mock 데이터를 활용할 경우, beforeEach와 같은 메소드를 활용 가능
    mock방식과 spy중 선호하는 방식으로 작성.
  */

// 각 테스트 후에 모든 모의(mock)를 복원합니다.
afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Mock 예제: 메소드의 구현을 대체합니다.
describe('with Mock', () => {
  test('createSample 테스트 - mock방식', async () => {
    // 테스트에 사용할 mock데이터를 생성합니다.
    const dto: sampleDTO = {
      id: 1,
      content: 'this is content',
    };
    const expectedResult = { ...dto };

    // jest.spyOn을 사용하여 create 메소드를 모의(mock)하고 특정 값을 반환하도록 설정합니다.
    const createMock = jest.spyOn(sampleRepository, 'create').mockResolvedValue(expectedResult);

    // 서비스 함수를 실행합니다.
    const result = await sampleService.createSample(dto);

    // 모의(mock)된 메소드가 올바른 인자와 함께 호출되었는지 확인합니다.
    expect(createMock).toHaveBeenCalledWith(dto);

    // 서비스 메소드가 모의(mock)된 결과를 반환하는지 확인합니다.
    expect(result).toEqual(expectedResult);
  });
});

// Spy 예제: 원본 메소드를 변경하지 않고 호출 여부만 확인합니다.
describe('with Spy', () => {
  test('createSample 테스트 - spy방식', async () => {
    // 테스트에 사용할 mock데이터를 생성합니다.
    const dto: sampleDTO = {
      id: 1,
      content: 'this is content',
    };

    // jest.spyOn을 사용하여 create 메소드를 감시(spy)합니다. 원본 구현은 그대로 유지.
    const createSpy = jest.spyOn(sampleRepository, 'create');

    // 서비스 함수 호출
    await sampleService.createSample(dto);

    // 감시(spy)된 메소드가 올바른 인자와 함께 호출되었는지 확인합니다.
    expect(createSpy).toHaveBeenCalledWith(dto);
  });
});
