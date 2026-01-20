const pool = require('./config/database');

async function debugDB() {
    const connection = await pool.getConnection();
    try {
        console.log('Inspecting inventario_herramientas...');
        const [rows] = await connection.query('SELECT * FROM inventario_herramientas');
        console.log('Rows:', rows);

        const [columns] = await connection.query('SHOW COLUMNS FROM inventario_herramientas');
        console.log('Columns:', columns);
    } catch (err) {
        console.error(err);
    } finally {
        connection.release();
        process.exit();
    }
}

debugDB();
