const pool = require('./config/database');

async function fixColumns() {
    const connection = await pool.getConnection();
    try {
        console.log("Verificando columna 'cantidad' en 'inventario_asignaciones'...");
        const [columns] = await connection.query("SHOW COLUMNS FROM inventario_asignaciones LIKE 'cantidad'");

        if (columns.length === 0) {
            console.log("Agregando columna 'cantidad'...");
            // Add cantidad column, integer, default 1
            await connection.query("ALTER TABLE inventario_asignaciones ADD COLUMN cantidad INT DEFAULT 1");
            console.log("✅ Columna 'cantidad' agregada.");
        } else {
            console.log("ℹ️ La columna 'cantidad' ya existe.");
        }
    } catch (err) {
        console.error('Error durante el fix:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

fixColumns();
