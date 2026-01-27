const mysql = require('mysql2/promise');
require('dotenv').config();

console.log("DEBUG ENV:");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD (longitud):", process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'UNDEFINED');

async function test() {
  console.log('=== DIAGNÓSTICO DE CONEXIÓN VPS ===');
  console.log('Configuración detectada en .env:');
  console.log('  IP (Host):', process.env.DB_HOST);
  console.log('  Usuario:  ', process.env.DB_USER);
  console.log('  Base DATOS:', process.env.DB_NAME);
  console.log('  Puerto:   ', process.env.DB_PORT || 3306);
  console.log('-----------------------------------');

  if (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') {
    console.log('⚠ ATENCIÓN: Estás configurado para conectar a LOCALHOST (XAMPP).');
  } else {
    console.log('🛰 Intentando conectar a la VPS REMOTA...');
  }

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 10000 // 10 segundos de espera
  });

  try {
    const start = Date.now();
    const connection = await pool.getConnection();
    const end = Date.now();

    console.log(`\n✅ ¡CONEXIÓN REAL ESTABLECIDA EN ${end - start}ms!`);

    const [rows] = await connection.query('SELECT 1 AS conectado, USER() as user_db, DATABASE() as current_db');
    console.log('Dato recibido de la BD:', rows[0]);

    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tablas en la VPS:', tables.map(t => Object.values(t)[0]));

    console.log('\n--- Esquema de encuestas_satisfaccion ---');
    const [surveyCols] = await connection.query('SHOW COLUMNS FROM encuestas_satisfaccion');
    console.log(surveyCols.map(c => `${c.Field} (${c.Type})`));

    connection.release();
    await pool.end();
    console.log('\nPrueba finalizada con éxito.');
  } catch (err) {
    console.error('\n❌ ERROR DE CONEXIÓN REAL:');
    console.error('Código:', err.code);
    console.error('Mensaje:', err.message);

    if (err.code === 'ETIMEDOUT') {
      console.log('\nANÁLISIS: El servidor no responde. Probablemente el firewall de tu VPS está bloqueando el puerto 3306.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\nANÁLISIS: La IP es correcta pero el usuario o la contraseña no lo son.');
    }

    await pool.end();
    process.exit(1);
  }
}

test();
