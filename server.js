require('dotenv').config(); // .env 파일 로드
const express = require('express');
const ExcelJS = require('exceljs');  // exceljs 모듈 추가
const path = require('path');
const { pool, testDBConnection, executeQuery } = require('./db/postgre');

const app = express();
const PORT = process.env.PORT || 3000;

// 최근 실행된 쿼리 정보 저장
let lastExecutedQuery = null;  // 쿼리와 그에 전달된 파라미터를 저장할 변수
const QUERY_TIMEOUT = 1 * 10 * 1000;  // 1분 (밀리초 단위)

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// 기본 라우트 - HTML 파일 서빙
app.get('/', (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// 최근 쿼리 유효성 체크 함수
const isQueryExpired = () => {
    if (!lastExecutedQuery) return true;
    const timeElapsed = Date.now() - lastExecutedQuery.timestamp;
    return timeElapsed > QUERY_TIMEOUT;
};

// 쿼리 실행을 위한 API 엔드포인트
app.post('/query', async (req, res) => {
    const { query, params } = req.body;

    if (!query) {
        return res.status(400).json({ success: false, message: '쿼리를 입력해주세요.' });
    }

    const allowedQueryType = process.env.ALLOWED_QUERY_TYPE || 'SELECT';

    if (!query.trim().toUpperCase().startsWith(allowedQueryType)) {
        return res.status(400).json({
            success: false,
            message: `허용되지 않은 쿼리 유형입니다. 허용된 쿼리: ${allowedQueryType}`
        });
    }

    try {
        // 쿼리와 파라미터를 저장하고 타임스탬프 추가
        lastExecutedQuery = { query, params, timestamp: Date.now() };

        // 쿼리 실행
        const result = await executeQuery(query, params); 
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

// 유저 아이디에 대한 일기 수 조회 API 엔드포인트
app.get('/user-diary-count', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: '유저 아이디를 입력해주세요.' });
    }

    try {
        const query = 'SELECT COUNT(*) AS diary_count FROM diaries WHERE user_id = $1';
        const params = [userId];

        // 쿼리와 파라미터를 저장
        lastExecutedQuery = { query, params, timestamp: Date.now() };

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '해당 유저의 일기를 찾을 수 없습니다.'
            });
        }

        const diaryCount = result.rows[0].diary_count;

        res.json({
            success: true,
            userId,
            diaryCount
        });
    } catch (err) {
        console.error('일기 수 조회 오류:', err);
        res.status(500).json({
            success: false,
            message: '일기 수 조회에 실패했습니다.'
        });
    }
});

// 유저 아이디로 모든 일기를 조회하는 API
app.post('/get-diaries', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: '유저 아이디를 입력해주세요.' });
    }

    try {
        const query = `SELECT * FROM diaries WHERE user_id = $1`;
        const params = [userId];

        // 쿼리와 파라미터를 저장
        lastExecutedQuery = { query, params, timestamp: Date.now() };

        const result = await pool.query(query, params);

        if (result.rows.length > 0) {
            res.json({
                success: true,
                diaries: result.rows,
            });
        } else {
            res.json({
                success: false,
                message: '해당 유저의 일기가 없습니다.',
            });
        }
    } catch (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).json({
            success: false,
            message: '일기 조회에 실패했습니다.',
        });
    }
});

// 엑셀 다운로드 엔드포인트
app.get('/download-excel', async (req, res) => {
    if (isQueryExpired()) {
        return res.status(400).json({ success: false, message: '최근 쿼리의 유효기간이 만료되었습니다.' });
    }

    if (!lastExecutedQuery) {
        return res.status(400).json({ success: false, message: '최근 쿼리 실행 결과가 없습니다.' });
    }

    const { query, params } = lastExecutedQuery; // lastExecutedQuery에서 쿼리와 파라미터 가져오기

    try {
        // 쿼리 실행
        const result = await pool.query(query, params); // 쿼리 재실행

        if (!result || !result.rows || result.rows.length === 0) {
            return res.status(404).json({ success: false, message: '쿼리 실행 결과가 없습니다.' });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Query Result');

        // 테이블 헤더 추가
        const columns = result.fields.map(field => field.name);  // result.fields에서 컬럼 이름 추출
        worksheet.addRow(columns);

        // 테이블 데이터 추가
        const rows = result.rows || [];
        rows.forEach(row => {
            worksheet.addRow(Object.values(row));  // 각 행의 값을 배열로 추가
        });

        // 엑셀 파일을 클라이언트로 전송
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=query_result.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('엑셀 다운로드 오류:', error);
        res.status(500).json({ success: false, message: '엑셀 다운로드에 실패했습니다.' });
    }
});

// 서버 실행 및 PostgreSQL 연결 테스트
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await testDBConnection(); // PostgreSQL 연결 테스트
});
