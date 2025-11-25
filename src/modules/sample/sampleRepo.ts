import { sampleDTO } from './dto/sampleDTO';
class sampleRepository {
  create = async (sampleDTO: sampleDTO): Promise<sampleDTO> => {
    // sampleDTO의 타입은 DTO를 정의하여 수정합니다.
    /*
		데이터베이스와 상호작용하는 코드를 작성합니다.
			return await prisma.sample.create({
				data: {
					...
				}
		});
		*/
    console.log(sampleDTO);
    //실제 구현에서는 데이터베이스 생성 결과를 반환해야 합니다.
    return sampleDTO;
  };
}

export default new sampleRepository();
