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

module.exports = {
    pool,
    testDBConnection,
};
