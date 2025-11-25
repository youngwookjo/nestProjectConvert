# 1. 베이스 이미지 선택 (LTS 버전의 Node.js)
FROM node:22-alpine

# 2. 작업 디렉터리 설정
WORKDIR /codiit

# 3. 프로덕션 환경 변수 설정
# main.ts에서 이 변수를 사용하여 module-alias를 로드합니다.
ENV NODE_ENV=production

# 4. 의존성 설치
# package.json과 package-lock.json을 먼저 복사하여 불필요한 npm install을 방지합니다.
COPY package*.json ./
RUN npm ci

# 5. 소스 코드 복사
# .dockerignore에 명시된 파일을 제외하고 모든 소스 코드를 복사합니다.
COPY . .

# 6. Prisma 클라이언트 생성
# 스키마가 변경될 때마다 실행해야 합니다.
RUN npx prisma generate

# 7. TypeScript 프로젝트 빌드
# tsconfig.json의 outDir 설정에 따라 'dist' 폴더에 JavaScript 파일이 생성됩니다.
RUN npm run build

# 8. 애플리케이션 포트 노출
# .env 파일이나 코드에서 사용하는 포트와 일치시켜야 합니다.
EXPOSE 3001

# 9. 컨테이너 실행 명령어
# 빌드된 JavaScript 파일을 실행합니다.
CMD ["npm", "run", "start:prod"]
