const { Pool } = require('pg'); // PostgreSQL 클라이언트 가져오기
require('dotenv').config(); // .env 파일 로드

// PostgreSQL 연결 설정
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// 데이터베이스 연결 테스트 함수
const testDBConnection = async () => {
    try {
        const res = await pool.query('SELECT NOW() AS current_time');
        console.log('Connected to PostgreSQL:', res.rows[0].current_time);
    } catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
};

// 쿼리 실행 함수
const executeQuery = async (query) => {
    try {
        const result = await pool.query(query);
        const columns = result.fields.map(field => field.name);
        const rows = result.rows.map(row => Object.values(row));

        return { columns, rows };
    } catch (err) {
        throw new Error('쿼리 실행에 실패했습니다.');
    }
};

module.exports = {
    pool,
    testDBConnection,
    executeQuery,
};
