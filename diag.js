const pool = require('./backend/config/database');

async function checkReport() {
    try {
        const [rows] = await pool.query('SELECT id, titulo, precio_cotizacion, moneda, estado FROM reportes ORDER BY updated_at DESC LIMIT 5');
        console.log('--- RECIENTES ---');
        console.table(rows);

        const [rows2] = await pool.query("SELECT id, titulo, precio_cotizacion, moneda FROM reportes WHERE titulo LIKE '%yiaaaaa%'");
        console.log('--- BUSCADO (yiaaaaa) ---');
        console.table(rows2);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkReport();
