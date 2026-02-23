const pool = require('./config/database');
const fs = require('fs');

async function checkColumns() {
    try {
        console.log('Checking columns for table "reportes"...');
        const [rows] = await pool.query('SHOW COLUMNS FROM reportes');
        console.log('Columns found:', rows.map(r => r.Field).join(', '));
        fs.writeFileSync('columns_debug_backend.log', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        fs.writeFileSync('columns_debug_backend.log', err.message);
        process.exit(1);
    }
}

checkColumns();
