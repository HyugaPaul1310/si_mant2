const pool = require('./config/database');
const { exec } = require('child_process');

async function fixFinal() {
    const connection = await pool.getConnection();
    try {
        // 1. Fix ID 0 in inventario_herramientas
        console.log('Verificando ID 0 en inventario_herramientas...');
        const [rows0] = await connection.query('SELECT id FROM inventario_herramientas WHERE id = 0');
        if (rows0.length > 0) {
            console.log('Encontrado registro con ID 0. Buscando nuevo ID...');
            const [maxRows] = await connection.query('SELECT MAX(id) as maxId FROM inventario_herramientas');
            const newId = (maxRows[0].maxId || 0) + 1;
            console.log(`Cambiando ID 0 a ${newId}...`);

            await connection.query('SET FOREIGN_KEY_CHECKS=0');
            await connection.query('UPDATE inventario_asignaciones SET herramienta_id = ? WHERE herramienta_id = 0', [newId]);
            await connection.query('UPDATE inventario_herramientas SET id = ? WHERE id = 0', [newId]);
            await connection.query('SET FOREIGN_KEY_CHECKS=1');
            console.log('✅ ID 0 corregido.');
        } else {
            console.log('ℹ️ No hay registro con ID 0.');
        }

        // 2. Apply AUTO_INCREMENT to inventario_herramientas
        console.log('Aplicando AUTO_INCREMENT a inventario_herramientas...');
        try {
            await connection.query('SET FOREIGN_KEY_CHECKS=0');
            await connection.query('ALTER TABLE inventario_herramientas MODIFY id INT(11) NOT NULL AUTO_INCREMENT');
            await connection.query('SET FOREIGN_KEY_CHECKS=1');
            console.log('✅ inventario_herramientas corregida.');
        } catch (e) {
            console.log('❌ Error en ALTER inventario_herramientas:', e.message);
        }

    } catch (err) {
        console.error('Error durante el fix:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

fixFinal();
