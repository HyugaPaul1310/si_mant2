const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    console.log('Variables de entorno:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_PORT:', process.env.DB_PORT);

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });

    console.log('Conexión exitosa!');
    
    const [rows] = await connection.query('SELECT 1 AS uno');
    console.log('Query test:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
