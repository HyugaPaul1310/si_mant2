const bcrypt = require('bcrypt');
const pool = require('./config/database');

const users = [
  { email: 'p@gmail.com', password: '123456' },
  { email: 'tr@gmail.com', password: '123456' }
];

async function resetPasswords() {
  try {
    for (const user of users) {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Actualizar en la base de datos
      const [result] = await pool.query(
        'UPDATE usuarios SET contraseña = ? WHERE email = ?',
        [hashedPassword, user.email]
      );

      if (result.affectedRows > 0) {
        console.log(`✓ Contraseña actualizada para: ${user.email}`);
      } else {
        console.log(`❌ No se encontró usuario: ${user.email}`);
      }
    }

    console.log('\n📋 Contraseñas actualizadas:');
    users.forEach(user => {
      console.log(`  • ${user.email} → 123456`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPasswords();
