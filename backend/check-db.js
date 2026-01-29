const pool = require('./config/database');

async function checkStatus() {
    try {
        console.log('[CHECK] Verificando esquema de tabla reportes...');
        const [columns] = await pool.query('DESCRIBE reportes');
        const estadoCol = columns.find(c => c.Field === 'estado');
        console.log('[CHECK] Columna estado:', estadoCol.Type);

        console.log('[CHECK] Verificando últimos 5 reportes...');
        const [reportes] = await pool.query('SELECT id, titulo, estado, revision, reparacion FROM reportes ORDER BY updated_at DESC LIMIT 5');
        console.log('[CHECK] Reportes:', JSON.stringify(reportes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('[CHECK] Error:', error.message);
        process.exit(1);
    }
}

checkStatus();
