require('dotenv').config({ path: './backend/.env' });
const pool = require('./backend/config/database');

async function test() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Connection successful:', rows[0].result);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
}

test();
