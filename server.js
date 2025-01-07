require('dotenv').config(); // .env 파일 로드
const express = require('express');
const path = require('path');
const { pool, testDBConnection, executeQuery } = require('./db/postgre');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트 - HTML 파일 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 쿼리 실행을 위한 API 엔드포인트
app.post('/query', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ success: false, message: '쿼리를 입력해주세요.' });
    }

    // .env에서 허용된 쿼리 유형 가져오기
    const allowedQueryType = process.env.ALLOWED_QUERY_TYPE || 'SELECT';

    // 쿼리 유형 검사 (SELECT만 허용)
    if (!query.trim().toUpperCase().startsWith(allowedQueryType)) {
        return res.status(400).json({
            success: false,
            message: `허용되지 않은 쿼리 유형입니다. 허용된 쿼리: ${allowedQueryType}`
        });
    }

    try {
        const result = await executeQuery(query); // 쿼리 실행
        res.json({
            success: true,
            columns: result.columns,
            rows: result.rows
        });
    } catch (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).json({
            success: false,
            message: '쿼리 실행에 실패했습니다.'
        });
    }
});

// 서버 실행 및 PostgreSQL 연결 테스트
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await testDBConnection(); // PostgreSQL 연결 테스트
});
