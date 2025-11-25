import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import routes from '@routes/index';
import { errorHandler } from '@middlewares/errorHandler';
import { setupSwagger } from '@config/swagger';

const app: Express = express();

/**
 * CORS
 */
app.use(
  cors({
    origin: process.env.FRONT_BASE_URL,
    credentials: true,
  }),
);
/**
 * Body & Cookie 파서
 */
app.use(express.json());
app.use(cookieParser());

/**
 * Swagger API 문서
 * 개발 및 테스트 환경에서만 활성화
if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}
  그러나 제출을 위해 복잡한 url 제공
  http://localhost:3000/api-docs-team2-a7f3c8e9
  */
setupSwagger(app);

/**
 * Routes (API)
 */
app.use('/api', routes);

/**
 * 글로벌 에러 핸들러
 */
app.use(errorHandler);

export { app };
