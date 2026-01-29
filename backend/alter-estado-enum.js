// Script para agregar el nuevo estado 'aceptado_por_cliente' al ENUM de la tabla reportes
const pool = require('./config/database');

async function alterarEstadoEnum() {
  try {
    console.log('[ALTER-ENUM] Iniciando alteración de la tabla reportes...');
    
    // Alter table para agregar el nuevo estado al ENUM
    const query = `ALTER TABLE reportes MODIFY COLUMN estado ENUM('pendiente', 'en_proceso', 'cotizado', 'aceptado_por_cliente', 'finalizado_por_tecnico', 'cerrado_por_cliente', 'listo_para_encuesta', 'encuesta_satisfaccion', 'terminado', 'finalizado', 'en_espera') DEFAULT 'pendiente'`;
    
    console.log('[ALTER-ENUM] Ejecutando query:', query);
    await pool.query(query);
    
    console.log('[ALTER-ENUM] ✅ Tabla reportes alterada exitosamente');
    console.log('[ALTER-ENUM] El nuevo estado "aceptado_por_cliente" está disponible');
    
    process.exit(0);
  } catch (error) {
    console.error('[ALTER-ENUM] ❌ Error al alterar la tabla:', error.message);
    process.exit(1);
  }
}

alterarEstadoEnum();
