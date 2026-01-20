const pool = require('./config/database');
require('dotenv').config();

async function fixStates() {
  try {
    console.log('🔧 Iniciando corrección de estados de reportes...\n');

    // Ver estado actual de reportes asignados
    console.log('📊 Estado actual de reportes asignados:');
    const [reportesActuales] = await pool.query(
      'SELECT id, titulo, estado, empleado_asignado_id FROM reportes WHERE empleado_asignado_id IS NOT NULL'
    );
    
    console.log(`Total de reportes asignados: ${reportesActuales.length}`);
    reportesActuales.forEach(r => {
      console.log(`  - ID: ${r.id}, Estado: ${r.estado}, Empleado: ${r.empleado_asignado_id}`);
    });

    // Contar reportes por estado
    console.log('\n📈 Conteo por estado:');
    const [estadoCounts] = await pool.query(
      `SELECT estado, COUNT(*) as cantidad FROM reportes WHERE empleado_asignado_id IS NOT NULL GROUP BY estado`
    );
    
    estadoCounts.forEach(e => {
      console.log(`  - ${e.estado}: ${e.cantidad}`);
    });

    // Resetear SOLO los reportes en_proceso que fueron afectados por el bug anterior
    // Estos son los que aparecen en_proceso automáticamente al asignar
    console.log('\n🔄 Cambiando reportes "en_proceso" a "pendiente" (bug del anterior asignador)...');
    const [result] = await pool.query(
      `UPDATE reportes 
       SET estado = 'pendiente' 
       WHERE empleado_asignado_id IS NOT NULL 
       AND estado = 'en_proceso'`
    );

    console.log(`✅ ${result.affectedRows} reportes actualizados a "pendiente"`);

    // Ver estado final
    console.log('\n📊 Estado final de reportes asignados:');
    const [reportesFinal] = await pool.query(
      'SELECT id, titulo, estado, empleado_asignado_id FROM reportes WHERE empleado_asignado_id IS NOT NULL'
    );
    
    reportesFinal.forEach(r => {
      console.log(`  - ID: ${r.id}, Estado: ${r.estado}`);
    });

    console.log('\n✨ Corrección completada!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStates();
