const db = require('./config/database');

console.log('[CLEANUP] Iniciando limpieza de base de datos...\n');

(async () => {
  try {
    // 1. Limpiar tablas relacionadas con reportes
    console.log('[CLEANUP] Eliminando reportes...');
    await db.query('DELETE FROM reportes');
    
    console.log('[CLEANUP] Eliminando tareas...');
    await db.query('DELETE FROM tareas');
    
    console.log('[CLEANUP] Eliminando asignaciones de herramientas...');
    await db.query('DELETE FROM inventario_asignaciones');
    
    console.log('[CLEANUP] Eliminando herramientas...');
    await db.query('DELETE FROM inventario_herramientas');
    
    // 2. Resetear auto_increment en tablas principales
    console.log('[CLEANUP] Reseteando auto_increment...');
    await db.query('ALTER TABLE reportes AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE tareas AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE inventario_herramientas AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE inventario_asignaciones AUTO_INCREMENT = 1');
    
    console.log('\n✅ Base de datos limpiada exitosamente');
    console.log('✅ Todos los reportes, tareas, cotizaciones y encuestas han sido eliminados');
    console.log('✅ La base de datos está lista para el cliente\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error.message);
    console.error('\nIntenta manualmente con estos comandos SQL:');
    console.log(`
    DELETE FROM reportes;
    DELETE FROM tareas;
    DELETE FROM inventario_asignaciones;
    DELETE FROM inventario_herramientas;
    ALTER TABLE reportes AUTO_INCREMENT = 1;
    ALTER TABLE tareas AUTO_INCREMENT = 1;
    ALTER TABLE inventario_herramientas AUTO_INCREMENT = 1;
    ALTER TABLE inventario_asignaciones AUTO_INCREMENT = 1;
    `);
    process.exit(1);
  }
})();
