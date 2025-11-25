import express from 'express';
import sampleController from './sampleController';

const sampleRouter = express.Router();

sampleRouter
	.route('/') // path에 들어갈 경로는 각 라우터의 하위를 지정해주세요 ex) '/', ':sampleId'
	.post(sampleController.postSample); // post 메소드를 예시로 들겠습니다

export default sampleRouter;
