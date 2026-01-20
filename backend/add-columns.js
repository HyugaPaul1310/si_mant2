const pool = require('./config/database');
require('dotenv').config();

async function alterReportesTable() {
  try {
    console.log('🔧 Verificando estructura de tabla reportes...\n');

    // Obtener la estructura actual
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'reportes' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'si_mant2']);

    console.log('📊 Columnas actuales:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    const columnNames = columns.map(c => c.COLUMN_NAME);

    // Verificar y agregar columnas necesarias
    const columnsToAdd = [];

    if (!columnNames.includes('analisis_general')) {
      columnsToAdd.push('ALTER TABLE reportes ADD COLUMN analisis_general LONGTEXT');
    }

    if (!columnNames.includes('precio_cotizacion')) {
      columnsToAdd.push('ALTER TABLE reportes ADD COLUMN precio_cotizacion DECIMAL(10, 2)');
    }

    if (columnsToAdd.length === 0) {
      console.log('\n✅ Tabla reportes ya tiene todas las columnas necesarias');
      process.exit(0);
    }

    console.log('\n🔄 Agregando columnas faltantes...\n');

    for (const alterQuery of columnsToAdd) {
      try {
        console.log(`Ejecutando: ${alterQuery}`);
        await pool.query(alterQuery);
        const columnName = alterQuery.match(/ADD COLUMN (\w+)/)[1];
        console.log(`✅ Columna ${columnName} agregada\n`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`✓ Columna ya existe\n`);
        } else {
          throw error;
        }
      }
    }

    // Verificar estructura final
    console.log('\n📊 Estructura final de tabla reportes:');
    const [finalColumns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'reportes' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'si_mant2']);

    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\n✨ Tabla reportes lista!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

alterReportesTable();
