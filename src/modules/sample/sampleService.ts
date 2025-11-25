import sampleRepository from './sampleRepo';
import { sampleDTO } from './dto/sampleDTO';

class SampleService {
	createSample = async (sampleDTO: sampleDTO) => {
		// sampleDTO의 타입은 DTO를 정의하여 수정합니다.
		// 비즈니스 로직 및 레포지토리 클래스 메소드를 호출합니다.
		return await sampleRepository.create(sampleDTO);
	};
}

export default new SampleService();
