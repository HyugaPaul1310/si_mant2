const pool = require('./backend/config/database');
const fs = require('fs');

async function checkColumns() {
    try {
        const [rows] = await pool.query('SHOW COLUMNS FROM reportes');
        fs.writeFileSync('columns_debug.log', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('columns_debug.log', err.message);
        process.exit(1);
    }
}

checkColumns();
