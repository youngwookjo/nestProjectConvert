// 환경에 따라 다른 경로 해석 방식 사용
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서는 module-alias 사용 (컴파일된 파일용)
  // @ts-ignore - module-alias/register는 런타임에만 사용되는 모듈
  require('module-alias/register');
} else {
  // 개발 환경에서는 tsconfig-paths 사용 (소스 파일용)
  // tsconfig-paths/register는 dev 스크립트에서 이미 로드됨
}
import 'dotenv/config';
import http from 'http';
import { app } from './app';

// Server Create
const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => console.log('Server Starting...'));
