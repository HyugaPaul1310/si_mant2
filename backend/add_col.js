const mysql = require('mysql2/promise');
require('dotenv').config();

async function addColumns() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Adding columns...');
    await pool.query('ALTER TABLE encuestas_satisfaccion Add COLUMN presentacion_motivo VARCHAR(255) NULL;');
    console.log('Added presentacion_motivo');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('presentacion_motivo already exists');
    } else {
      console.error(err);
    }
  }

  try {
    await pool.query('ALTER TABLE encuestas_satisfaccion Add COLUMN aviso_retiro VARCHAR(255) NULL;');
    console.log('Added aviso_retiro');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('aviso_retiro already exists');
    } else {
      console.error(err);
    }
  }

  process.exit(0);
}

addColumns();
