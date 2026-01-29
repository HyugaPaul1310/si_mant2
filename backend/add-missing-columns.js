const pool = require('./config/database');
require('dotenv').config();

async function addMissingColumns() {
    try {
        console.log('🔧 Iniciando la adición de columnas faltantes en la tabla reportes...\n');

        // Lista de columnas a agregar con sus definiciones
        const columnsToAdd = [
            { name: 'empleado_asignado_id', definition: 'INT' },
            { name: 'empleado_asignado_email', definition: 'VARCHAR(100)' },
            { name: 'empleado_asignado_nombre', definition: 'VARCHAR(255)' },
            { name: 'usuario_email', definition: 'VARCHAR(100)' },
            { name: 'usuario_nombre', definition: 'VARCHAR(255)' },
            { name: 'equipo_descripcion', definition: 'VARCHAR(255)' },
            { name: 'comentario', definition: 'LONGTEXT' },
            { name: 'empresa', definition: 'VARCHAR(255)' },
            { name: 'sucursal', definition: 'VARCHAR(255)' }
        ];

        for (const column of columnsToAdd) {
            try {
                console.log(`Intentando agregar la columna: ${column.name}...`);
                const query = `ALTER TABLE reportes ADD COLUMN ${column.name} ${column.definition}`;
                await pool.query(query);
                console.log(`✅ Columna ${column.name} agregada correctamente.\n`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  La columna ${column.name} ya existe. Saltando...\n`);
                } else {
                    console.error(`❌ Error al agregar la columna ${column.name}:`, error.message);
                }
            }
        }

        console.log('✨ Proceso de migración finalizado.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error general durante la migración:', error);
        process.exit(1);
    }
}

addMissingColumns();
