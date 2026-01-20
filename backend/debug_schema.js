const pool = require('./config/database');

async function debugSchema() {
    const connection = await pool.getConnection();
    try {
        console.log("--- Schema of inventario_asignaciones ---");
        const [columns] = await connection.query("SHOW COLUMNS FROM inventario_asignaciones");
        console.log(columns.map(c => `${c.Field} (${c.Type})`));

        console.log("\n--- Content of inventario_asignaciones ---");
        const [rows] = await connection.query("SELECT * FROM inventario_asignaciones");
        console.log(rows);

        console.log("\n--- Users ---");
        const [users] = await connection.query("SELECT id, nombre, email, rol FROM usuarios");
        console.log(users);

    } catch (err) {
        console.error(err);
    } finally {
        connection.release();
        process.exit();
    }
}

debugSchema();
