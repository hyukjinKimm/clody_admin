require('dotenv').config(); // .env 파일 로드

const express = require('express');
const app = express();

// 환경 변수 가져오기
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// 기본 라우트 설정
app.get('/', (req, res) => {
    res.send(`
        hello world
    `);
});

// 서버 실행
app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
