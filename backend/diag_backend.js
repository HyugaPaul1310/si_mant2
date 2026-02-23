const pool = require('./config/database');

async function checkReport() {
    try {
        console.log('--- RECIENTES ---');
        const [rows] = await pool.query('SELECT id, titulo, precio_cotizacion, moneda, estado FROM reportes ORDER BY updated_at DESC LIMIT 5');
        console.table(rows);

        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err.message);
        if (err.message.includes('Unknown column \'moneda\'')) {
            console.log('\nCRITICAL: The column "moneda" is MISSING in the "reportes" table.');
        }
        process.exit(1);
    }
}

checkReport();
