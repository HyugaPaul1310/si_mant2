const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function setupDatabase() {
  try {
    console.log('Conectando a MySQL...');
    console.log('Host: localhost');
    console.log('User: root');
    console.log('Port: 3306');
    
    // Conexión sin especificar base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      multipleStatements: true
    });

    console.log('Conectado a MySQL');

    // Crear base de datos
    const dbName = process.env.DB_NAME || 'si_mant2';
    console.log(`Creando base de datos ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Base de datos ${dbName} lista`);

    // Seleccionar base de datos
    await connection.changeUser({ database: dbName });

    // Leer y ejecutar script SQL
    const sqlScript = fs.readFileSync('./CREATE_TABLES.sql', 'utf8');
    console.log('Creando tablas...');
    await connection.query(sqlScript);
    console.log('Tablas creadas exitosamente!');

    // Insertar datos de prueba
    console.log('Insertando usuario de prueba...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      'INSERT INTO usuarios (nombre, apellido, email, contraseña, rol, estado) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
      ['Admin', 'Sistema', 'admin@test.com', hashedPassword, 'admin', 'activo']
    );
    
    console.log('Usuario de prueba: admin@test.com / admin123');

    await connection.end();
    console.log('\nSetup completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error en setup:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

setupDatabase();
