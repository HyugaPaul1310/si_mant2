const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const poolOptions = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'si_mant2',
    port: parseInt(process.env.DB_PORT || '3306')
};

async function runFix() {
    console.log('--- Iniciando REPARACIÓN DEFINITIVA de la Base de Datos ---');
    const pool = mysql.createPool(poolOptions);
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        // 1. Fix AUTO_INCREMENT y PRIMARY KEY
        const tablesAFijar = ['usuarios', 'empresas', 'reportes', 'tareas', 'inventario_herramientas', 'inventario_asignaciones', 'cotizaciones', 'encuestas_satisfaccion'];
        for (const table of tablesAFijar) {
            try {
                // Verificar si la tabla existe
                const [tables] = await connection.query(`SHOW TABLES LIKE '${table}'`);
                if (tables.length === 0) continue;

                await connection.query(`ALTER TABLE ${table} MODIFY id INT AUTO_INCREMENT PRIMARY KEY`);
                console.log(`✅ AUTO_INCREMENT verificado para ${table}`);
            } catch (e) {
                console.log(`ℹ️ Info para ${table}: ${e.message}`);
            }
        }

        // 2. Tabla: reportes - Añadir columnas faltantes
        console.log('\n--- Reparando tabla: reportes ---');
        const reportesCols = [
            ['analisis_general', 'LONGTEXT'],
            ['precio_cotizacion', 'DECIMAL(10, 2)'],
            ['revision', 'LONGTEXT'],
            ['recomendaciones', 'LONGTEXT'],
            ['reparacion', 'LONGTEXT'],
            ['recomendaciones_adicionales', 'LONGTEXT'],
            ['materiales_refacciones', 'LONGTEXT'],
            ['cerrado_por_cliente_at', 'TIMESTAMP NULL'],
            ['finalizado_por_tecnico_at', 'TIMESTAMP NULL'],
            ['empleado_asignado_id', 'INT'],
            ['empleado_asignado_email', 'VARCHAR(255)'],
            ['empleado_asignado_nombre', 'VARCHAR(255)'],
            ['usuario_email', 'VARCHAR(255)'],
            ['usuario_nombre', 'VARCHAR(255)'],
            ['equipo_descripcion', 'VARCHAR(255)'],
            ['sucursal', 'VARCHAR(255)'],
            ['comentario', 'LONGTEXT'],
            ['empresa', 'VARCHAR(255)'],
            ['trabajo_completado', 'TINYINT(1) DEFAULT 0']
        ];
        for (const [name, def] of reportesCols) {
            try {
                await connection.query(`ALTER TABLE reportes ADD COLUMN ${name} ${def}`);
                console.log(`✅ Columna ${name} añadida`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${name} ya existe`);
                else console.error(`❌ Error en ${name}:`, e.message);
            }
        }

        // 3. Tabla: cotizaciones
        console.log('\n--- Reparando tabla: cotizaciones ---');
        const cotizacionesCols = [
            ['reporte_id', 'INT'],
            ['empleado_nombre', 'VARCHAR(255)'],
            ['analisis_general', 'LONGTEXT'],
            ['precio_cotizacion', 'DECIMAL(10, 2)']
        ];
        for (const [name, def] of cotizacionesCols) {
            try {
                await connection.query(`ALTER TABLE cotizaciones ADD COLUMN ${name} ${def}`);
                console.log(`✅ Columna ${name} añadida`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${name} ya existe`);
                else console.error(`❌ Error en ${name}:`, e.message);
            }
        }

        // 4. Tabla: encuestas_satisfaccion
        console.log('\n--- Reparando tabla: encuestas_satisfaccion ---');
        const encuestasCols = [
            ['reporte_id', 'INT'],
            ['cliente_email', 'VARCHAR(100)'],
            ['cliente_nombre', 'VARCHAR(255)'],
            ['empleado_email', 'VARCHAR(100)'],
            ['empleado_nombre', 'VARCHAR(255)'],
            ['empresa', 'VARCHAR(255)'],
            ['trato_equipo', 'VARCHAR(100)'],
            ['equipo_tecnico', 'VARCHAR(100)'],
            ['personal_administrativo', 'VARCHAR(100)'],
            ['rapidez', 'VARCHAR(100)'],
            ['costo_calidad', 'VARCHAR(100)'],
            ['recomendacion', 'VARCHAR(100)'],
            ['satisfaccion', 'VARCHAR(100)']
        ];
        for (const [name, def] of encuestasCols) {
            try {
                await connection.query(`ALTER TABLE encuestas_satisfaccion ADD COLUMN ${name} ${def}`);
                console.log(`✅ Columna ${name} añadida`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${name} ya existe`);
                else console.error(`❌ Error en ${name}:`, e.message);
            }
        }

        // 5. Tabla: tareas
        console.log('\n--- Reparando tabla: tareas ---');
        const tareasCols = [
            ['admin_email', 'VARCHAR(255)'],
            ['admin_nombre', 'VARCHAR(255)'],
            ['empleado_email', 'VARCHAR(255)']
        ];
        for (const [name, def] of tareasCols) {
            try {
                await connection.query(`ALTER TABLE tareas ADD COLUMN ${name} ${def}`);
                console.log(`✅ Columna ${name} añadida`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${name} ya existe`);
                else console.error(`❌ Error en ${name}:`, e.message);
            }
        }

        // 6. Tabla: inventario_asignaciones
        console.log('\n--- Reparando tabla: inventario_asignaciones ---');
        const [invCols] = await connection.query("SHOW COLUMNS FROM inventario_asignaciones LIKE 'cantidad'");
        if (invCols.length === 0) {
            await connection.query("ALTER TABLE inventario_asignaciones ADD COLUMN cantidad INT DEFAULT 1");
            console.log("✅ Columna 'cantidad' añadida");
        }

        // 7. Tabla: reportes_archivos
        console.log('\n--- Asegurando tabla: reportes_archivos ---');
        const createArchivosQuery = `
      CREATE TABLE IF NOT EXISTS reportes_archivos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporte_id INT,
        tipo_archivo VARCHAR(50),
        cloudflare_url TEXT,
        cloudflare_key VARCHAR(255),
        nombre_original VARCHAR(255),
        tamaño INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reporte (reporte_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
        await connection.query(createArchivosQuery);
        console.log(`✅ Tabla reportes_archivos lista`);

        await connection.query('SET FOREIGN_KEY_CHECKS=1');
        console.log('\n--- REPARACIÓN COMPLETADA CON ÉXITO ---');
    } catch (err) {
        console.error('\n❌ ERROR CRÍTICO:', err);
    } finally {
        if (connection) connection.release();
        await pool.end();
        process.exit();
    }
}

runFix();
