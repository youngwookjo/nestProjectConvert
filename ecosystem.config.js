module.exports = {
  apps: [
    {
      name: 'CODI-IT',
      script: './dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      // '--env production' 플래그로 실행 시 적용될 환경 변수
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
