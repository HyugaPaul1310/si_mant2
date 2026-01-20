const pool = require('./config/database');
require('dotenv').config();

async function checkSchema() {
  try {
    // Verificar columnas de reportes
    const [cols] = await pool.query('DESCRIBE reportes');
    console.log('📋 Columnas en tabla "reportes":');
    cols.forEach(c => {
      console.log(`  - ${c.Field} (${c.Type})`);
    });

    // Ver un ejemplo de reporte
    console.log('\n📊 Ejemplo de reporte cotizado:');
    const [reportes] = await pool.query(
      'SELECT * FROM reportes WHERE estado = "cotizado" LIMIT 1'
    );
    
    if (reportes.length > 0) {
      const r = reportes[0];
      console.log('\nDatos del reporte:');
      Object.entries(r).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('  No hay reportes con estado "cotizado"');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
