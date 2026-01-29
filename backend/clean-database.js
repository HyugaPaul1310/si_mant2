const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'si_mant2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function limpiarBaseDatos() {
  const connection = await pool.getConnection();
  try {
    console.log('🗑️  Iniciando limpieza de base de datos...\n');

    // Deshabilitar restricciones de clave foránea temporalmente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✓ Deshabilitadas restricciones de clave foránea');

    // Borrar reportes_archivos
    const [resultArchivos] = await connection.query('DELETE FROM reportes_archivos');
    console.log(`✓ Eliminados ${resultArchivos.affectedRows} archivos de reportes`);

    // Borrar encuestas_satisfaccion
    const [resultEncuestas] = await connection.query('DELETE FROM encuestas_satisfaccion');
    console.log(`✓ Eliminadas ${resultEncuestas.affectedRows} encuestas`);

    // Borrar cotizaciones
    const [resultCotizaciones] = await connection.query('DELETE FROM cotizaciones');
    console.log(`✓ Eliminadas ${resultCotizaciones.affectedRows} cotizaciones`);

    // Borrar reportes
    const [resultReportes] = await connection.query('DELETE FROM reportes');
    console.log(`✓ Eliminados ${resultReportes.affectedRows} reportes`);

    // Reabilitar restricciones de clave foránea
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Rehabilitadas restricciones de clave foránea');

    console.log('\n✅ Base de datos limpiada exitosamente');
    console.log('📝 Ahora puedes comenzar con datos reales limpios\n');

  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error.message);
  } finally {
    await connection.release();
    await pool.end();
  }
}

limpiarBaseDatos();
