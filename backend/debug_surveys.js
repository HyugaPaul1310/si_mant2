const pool = require('./config/database');

async function debug() {
    console.log('--- DIAGNÓSTICO DE ENCUESTAS ---');
    try {
        const [latest] = await pool.query('SELECT id, created_at, cliente_email, satisfaccion FROM encuestas_satisfaccion ORDER BY created_at DESC LIMIT 5');
        console.log('Últimas 5 encuestas en BD:');
        latest.forEach(e => {
            console.log(`ID: ${e.id} | Fecha: ${e.created_at} | Cliente: ${e.cliente_email}`);
        });

        const [total] = await pool.query('SELECT COUNT(*) as total FROM encuestas_satisfaccion');
        console.log('\nTotal de encuestas en la tabla:', total[0].total);

        const now = new Date();
        console.log('\nHora actual del Sistema (Node):', now.toLocaleString());

        const [dbTime] = await pool.query('SELECT NOW() as db_now');
        console.log('Hora actual de la VPS (MySQL):', dbTime[0].db_now);

        process.exit(0);
    } catch (err) {
        console.error('Error durante el diagnóstico:', err);
        process.exit(1);
    }
}

debug();
