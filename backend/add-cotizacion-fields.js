const pool = require('./config/database');
require('dotenv').config();

async function addCotizacionFields() {
  try {
    console.log('🔧 Agregando campos de cotización a tabla reportes...\n');

    // Verificar si las columnas ya existen
    const [cols] = await pool.query('DESCRIBE reportes');
    const colNames = cols.map((c) => c.Field);
    
    const fieldsToAdd = [
      { name: 'analisis_general', type: 'LONGTEXT', exists: colNames.includes('analisis_general') },
      { name: 'precio_cotizacion', type: 'DECIMAL(10,2)', exists: colNames.includes('precio_cotizacion') },
    ];

    for (const field of fieldsToAdd) {
      if (field.exists) {
        console.log(`✓ Campo "${field.name}" ya existe`);
      } else {
        console.log(`+ Agregando campo "${field.name}"...`);
        await pool.query(`ALTER TABLE reportes ADD COLUMN ${field.name} ${field.type}`);
        console.log(`✓ Campo "${field.name}" agregado correctamente`);
      }
    }

    console.log('\n✨ Campos de cotización agregados!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCotizacionFields();
