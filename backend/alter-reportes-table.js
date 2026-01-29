const pool = require('./config/database');

async function alterReportesTable() {
  try {
    console.log('[MIGRATION] Iniciando alteración de tabla reportes...');

    // Alterar el ENUM del estado
    const alterEstadoQuery = `
      ALTER TABLE reportes 
      MODIFY COLUMN estado ENUM('pendiente', 'en_proceso', 'cotizado', 'finalizado_por_tecnico', 'cerrado_por_cliente', 'encuesta_satisfaccion', 'terminado', 'finalizado', 'en_espera') DEFAULT 'pendiente'
    `;

    console.log('[MIGRATION] Ejecutando: ALTER TABLE estado...');
    await pool.query(alterEstadoQuery);
    console.log('[MIGRATION] ✓ Estado actualizado');

    // Agregar nuevas columnas si no existen
    const columnsToAdd = [
      {
        name: 'empleado_id',
        definition: 'INT, ADD FOREIGN KEY (empleado_id) REFERENCES usuarios(id) ON DELETE SET NULL'
      },
      {
        name: 'analisis_general',
        definition: 'LONGTEXT'
      },
      {
        name: 'precio_cotizacion',
        definition: 'DECIMAL(10, 2)'
      },
      {
        name: 'revision',
        definition: 'LONGTEXT'
      },
      {
        name: 'recomendaciones',
        definition: 'LONGTEXT'
      },
      {
        name: 'reparacion',
        definition: 'LONGTEXT'
      },
      {
        name: 'recomendaciones_adicionales',
        definition: 'LONGTEXT'
      },
      {
        name: 'materiales_refacciones',
        definition: 'LONGTEXT'
      },
      {
        name: 'cerrado_por_cliente_at',
        definition: 'TIMESTAMP NULL'
      },
      {
        name: 'finalizado_por_tecnico_at',
        definition: 'TIMESTAMP NULL'
      }
    ];

    for (const col of columnsToAdd) {
      try {
        console.log(`[MIGRATION] Intentando agregar columna: ${col.name}`);
        const query = `ALTER TABLE reportes ADD COLUMN ${col.name} ${col.definition}`;
        await pool.query(query);
        console.log(`[MIGRATION] ✓ Columna ${col.name} agregada`);
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log(`[MIGRATION] ⚠️  Columna ${col.name} ya existe`);
        } else {
          throw error;
        }
      }
    }

    // Agregar índices
    const indicesToAdd = [
      'ALTER TABLE reportes ADD INDEX IF NOT EXISTS idx_empleado (empleado_id)'
    ];

    for (const idx of indicesToAdd) {
      try {
        console.log(`[MIGRATION] Agregando índice...`);
        await pool.query(idx);
        console.log(`[MIGRATION] ✓ Índice agregado`);
      } catch (error) {
        if (error.message.includes('Duplicate key')) {
          console.log(`[MIGRATION] ⚠️  Índice ya existe`);
        } else {
          console.warn(`[MIGRATION] Error al agregar índice:`, error.message);
        }
      }
    }

    console.log('[MIGRATION] ✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATION] ❌ Error durante migración:', error);
    process.exit(1);
  }
}

alterReportesTable();
