const pool = require('./config/database');

async function fixSchema() {
    console.log('Iniciando reparación del esquema de base de datos...');
    const connection = await pool.getConnection();

    try {
        // 1. Fix AUTO_INCREMENT for all tables that are missing it
        const tablesToFix = [
            'cotizaciones',
            'inventario_asignaciones',
            'inventario_herramientas',
            'tareas',
            'usuarios'
        ];

        // Disable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        for (const table of tablesToFix) {
            try {
                console.log(`Aplicando AUTO_INCREMENT a la tabla ${table}...`);
                await connection.query(`ALTER TABLE ${table} MODIFY id INT(11) NOT NULL AUTO_INCREMENT`);
                console.log(`✅ ${table} corregida.`);
            } catch (error) {
                console.error(`❌ Error en ${table}:`, error.message);
            }
        }

        // Enable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS=1');

        // 2. Add 'observaciones' column to 'inventario_asignaciones' if it doesn't exist
        try {
            console.log("Verificando columna 'observaciones' en 'inventario_asignaciones'...");
            const [columns] = await connection.query("SHOW COLUMNS FROM inventario_asignaciones LIKE 'observaciones'");
            if (columns.length === 0) {
                console.log("Agregando columna 'observaciones'...");
                await connection.query("ALTER TABLE inventario_asignaciones ADD COLUMN observaciones TEXT DEFAULT NULL");
                console.log("✅ Columna 'observaciones' agregada.");
            } else {
                console.log("ℹ️ La columna 'observaciones' ya existe.");
            }
        } catch (error) {
            console.error("❌ Error verificando/agregando 'observaciones':", error.message);
        }

        console.log(' Reparación de esquema completada.');
    } catch (err) {
        console.error('Error general:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

fixSchema();
