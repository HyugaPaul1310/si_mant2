const pool = require('./config/database');
require('dotenv').config();

async function checkColumns() {
    try {
        const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'usuarios' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'si_mant2']);

        console.log('Columnas en tabla usuarios:');
        columns.forEach(c => console.log(`- ${c.COLUMN_NAME} (${c.DATA_TYPE})`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkColumns();
