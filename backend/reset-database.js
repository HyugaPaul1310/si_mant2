#!/usr/bin/env node

/**
 * SCRIPT PARA RESETEAR LA BASE DE DATOS
 * Uso: node backend/reset-database.js
 * 
 * Borra todos los reportes, archivos, encuestas, cotizaciones y tareas
 * Mantiene usuarios, empresas e inventario de herramientas
 */

const pool = require('./config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function print(text, color = 'reset') {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

async function resetDatabase() {
  try {
    print('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    print('║     RESETEAR BASE DE DATOS - DEJAR COMO NUEVA              ║', 'cyan');
    print('╚════════════════════════════════════════════════════════════╝', 'cyan');

    print('\n⚠️  ADVERTENCIA:', 'yellow');
    print('   - Se borrarán TODOS los reportes', 'yellow');
    print('   - Se borrarán TODOS los archivos/fotos/videos', 'yellow');
    print('   - Se borrarán TODAS las encuestas', 'yellow');
    print('   - Se borrarán TODAS las cotizaciones', 'yellow');
    print('   - Se borrarán TODAS las tareas', 'yellow');
    print('   - Se borrarán las asignaciones de herramientas', 'yellow');
    print('\n   SE MANTIENEN: Usuarios, Empresas, Herramientas\n', 'yellow');

    // Preguntar confirmación
    rl.question('¿Estás SEGURO de que quieres continuar? (escribe "SÍ" para confirmar): ', async (answer) => {
      if (answer.toUpperCase() !== 'SÍ' && answer.toUpperCase() !== 'SI') {
        print('\n❌ Operación cancelada', 'red');
        rl.close();
        process.exit(0);
      }

      print('\n🔄 Iniciando reset de base de datos...', 'cyan');

      const connection = await pool.getConnection();

      try {
        // Deshabilitar FK para evitar conflictos
        print('\n⚙️  Deshabilitando restricciones de FK...', 'cyan');
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        // 1. Limpiar archivos de reportes
        print('\n🗑️  Limpiando reportes_archivos...', 'cyan');
        const [resultArchivos] = await connection.query('DELETE FROM reportes_archivos');
        print(`   ✓ Eliminados ${resultArchivos.affectedRows} archivos`, 'green');

        // 2. Limpiar encuestas
        print('\n🗑️  Limpiando encuestas_satisfaccion...', 'cyan');
        const [resultEncuestas] = await connection.query('DELETE FROM encuestas_satisfaccion');
        print(`   ✓ Eliminadas ${resultEncuestas.affectedRows} encuestas`, 'green');

        // 3. Limpiar cotizaciones
        print('\n🗑️  Limpiando cotizaciones...', 'cyan');
        const [resultCotizaciones] = await connection.query('DELETE FROM cotizaciones');
        print(`   ✓ Eliminadas ${resultCotizaciones.affectedRows} cotizaciones`, 'green');

        // 4. Limpiar reportes (lo principal)
        print('\n🗑️  Limpiando reportes...', 'cyan');
        const [resultReportes] = await connection.query('DELETE FROM reportes');
        print(`   ✓ Eliminados ${resultReportes.affectedRows} reportes`, 'green');

        // 5. Limpiar tareas
        print('\n🗑️  Limpiando tareas...', 'cyan');
        const [resultTareas] = await connection.query('DELETE FROM tareas');
        print(`   ✓ Eliminadas ${resultTareas.affectedRows} tareas`, 'green');

        // 6. Limpiar asignaciones de herramientas
        print('\n🗑️  Limpiando inventario_asignaciones...', 'cyan');
        const [resultAsignaciones] = await connection.query('DELETE FROM inventario_asignaciones');
        print(`   ✓ Eliminadas ${resultAsignaciones.affectedRows} asignaciones`, 'green');

        // Reactivar FK
        print('\n⚙️  Rehabilitando restricciones de FK...', 'cyan');
        await connection.query('SET FOREIGN_KEY_CHECKS=1');

        // Verificar estado final
        print('\n📊 Verificando estado final de la BD...', 'cyan');
        
        const [usuarios] = await connection.query('SELECT COUNT(*) as total FROM usuarios');
        const [empresas] = await connection.query('SELECT COUNT(*) as total FROM empresas');
        const [reportes] = await connection.query('SELECT COUNT(*) as total FROM reportes');
        const [archivos] = await connection.query('SELECT COUNT(*) as total FROM reportes_archivos');
        const [encuestas] = await connection.query('SELECT COUNT(*) as total FROM encuestas_satisfaccion');
        const [cotizaciones] = await connection.query('SELECT COUNT(*) as total FROM cotizaciones');
        const [tareas] = await connection.query('SELECT COUNT(*) as total FROM tareas');

        print('\n📈 ESTADO ACTUAL DE LA BASE DE DATOS:', 'bright');
        print(`   Usuarios:              ${usuarios[0].total}`, 'cyan');
        print(`   Empresas:              ${empresas[0].total}`, 'cyan');
        print(`   Reportes:              ${reportes[0].total}`, 'green');
        print(`   Archivos:              ${archivos[0].total}`, 'green');
        print(`   Encuestas:             ${encuestas[0].total}`, 'green');
        print(`   Cotizaciones:          ${cotizaciones[0].total}`, 'green');
        print(`   Tareas:                ${tareas[0].total}`, 'green');

        print('\n✅ BASE DE DATOS RESETEADA EXITOSAMENTE', 'green');
        print('   La aplicación está lista para entregar', 'green');
        print('\n💡 PRÓXIMOS PASOS:', 'cyan');
        print('   1. Borra las imágenes/videos en Cloudflare', 'cyan');
        print('   2. Reinicia el servidor backend', 'cyan');
        print('   3. Entrega la aplicación limpia', 'cyan');

        rl.close();
        process.exit(0);

      } catch (error) {
        print(`\n❌ ERROR: ${error.message}`, 'red');
        print('\nAsegúrate de que:', 'yellow');
        print('   - Tienes la BD MySQL corriendo', 'yellow');
        print('   - Las credenciales en config/database.js son correctas', 'yellow');
        print('   - No hay conexiones bloqueadas', 'yellow');
        rl.close();
        process.exit(1);
      } finally {
        await connection.release();
      }
    });

  } catch (error) {
    print(`\n❌ ERROR FATAL: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
  }
}

// Ejecutar
resetDatabase();
