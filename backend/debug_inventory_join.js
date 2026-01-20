const pool = require('./config/database');

async function debugJoin() {
    const connection = await pool.getConnection();
    try {
        const userId = 17; // traba

        console.log(`\n--- Tools for User ID ${userId} (traba) ---`);
        console.log("Querying: SELECT a.*, h.nombre ... JOIN ...");

        const [rows] = await connection.query(
            `SELECT a.*, h.nombre as herramienta_nombre, u.nombre as usuario_nombre
       FROM inventario_asignaciones a
       JOIN inventario_herramientas h ON a.herramienta_id = h.id
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.usuario_id = ?
       ORDER BY a.created_at DESC`,
            [userId]
        );
        console.log("Rows returned:", rows);

        console.log("\n--- Checking Orphaned Assignments ---");
        const [orphans] = await connection.query(`
      SELECT a.* 
      FROM inventario_asignaciones a 
      LEFT JOIN inventario_herramientas h ON a.herramienta_id = h.id 
      WHERE h.id IS NULL
    `);
        console.log("Orphaned assignments:", orphans);

        console.log("\n--- Tools Table Dump ---");
        const [tools] = await connection.query("SELECT * FROM inventario_herramientas");
        console.log(tools);

    } catch (err) {
        console.error(err);
    } finally {
        connection.release();
        process.exit();
    }
}

debugJoin();
