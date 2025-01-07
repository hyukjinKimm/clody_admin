const express = require('express');
const { testDBConnection } = require('./db/postgre'); // 데이터베이스 모듈 가져오기

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json()); // JSON 요청 파싱

// 기본 라우트
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Express Server with PostgreSQL!</h1>');
});

// 서버 실행 및 PostgreSQL 연결 테스트
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await testDBConnection(); // PostgreSQL 연결 테스트
});
