const pool = require('./config/database');

async function updateEnum() {
    try {
        console.log('[UPDATE-ENUM] Iniciando actualización de ENUM para incluir "cerrado"...');

        // Query para modificar la columna estado
        const query = `ALTER TABLE reportes MODIFY COLUMN estado ENUM(
      'pendiente', 
      'asignado', 
      'en_proceso', 
      'en_cotizacion', 
      'cotizado', 
      'aceptado_por_cliente', 
      'finalizado_por_tecnico', 
      'cerrado_por_cliente', 
      'listo_para_encuesta', 
      'encuesta_satisfaccion', 
      'terminado', 
      'finalizado', 
      'en_espera', 
      'en_espera_confirmacion', 
      'rechazado',
      'cerrado'
    ) DEFAULT 'pendiente'`;

        console.log('[UPDATE-ENUM] Ejecutando query...');
        await pool.query(query);

        console.log('[UPDATE-ENUM] ✅ ENUM actualizado exitosamente. El estado "cerrado" ya es válido.');
        process.exit(0);
    } catch (error) {
        console.error('[UPDATE-ENUM] ❌ Error al actualizar ENUM:', error.message);
        process.exit(1);
    }
}

updateEnum();
