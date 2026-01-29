const pool = require('./config/database');

async function fixEnum() {
    try {
        console.log('[FIX] Iniciando actualización de ENUM...');

        // Query en una sola línea para evitar problemas de formato
        const query = "ALTER TABLE reportes MODIFY COLUMN estado ENUM('pendiente','asignado','en_proceso','en_cotizacion','cotizado','aceptado_por_cliente','finalizado_por_tecnico','cerrado_por_cliente','listo_para_encuesta','encuesta_satisfaccion','terminado','finalizado','en_espera','en_espera_confirmacion','rechazado','cerrado') DEFAULT 'pendiente'";

        await pool.query(query);
        console.log('[FIX] ✅ Query ejecutado.');

        // Verificar inmediatamente
        const [columns] = await pool.query('DESCRIBE reportes');
        const estadoCol = columns.find(c => c.Field === 'estado');
        console.log('[FIX] Nuevo tipo de columna estado:', estadoCol.Type);

        // Intentar arreglar el reporte que quedó en blanco
        console.log('[FIX] Arreglando reportes con estado vacío...');
        const [result] = await pool.query("UPDATE reportes SET estado = 'cerrado' WHERE estado = '' OR estado IS NULL AND (revision IS NOT NULL OR reparacion IS NOT NULL)");
        console.log(`[FIX] ✅ ${result.affectedRows} reportes actualizados a 'cerrado'.`);

        process.exit(0);
    } catch (error) {
        console.error('[FIX] ❌ Error:', error.message);
        process.exit(1);
    }
}

fixEnum();
