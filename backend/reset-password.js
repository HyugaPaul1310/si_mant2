const bcrypt = require('bcrypt');
const pool = require('./config/database');

const email = 'admin@simant.com';
const newPassword = 'Admin@12345'; // Nueva contraseña

async function resetPassword() {
  try {
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✓ Contraseña hasheada correctamente');

    // Actualizar en la base de datos
    const [result] = await pool.query(
      'UPDATE usuarios SET contraseña = ? WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows > 0) {
      console.log('✓ Contraseña actualizada exitosamente');
      console.log(`\n📧 Email: ${email}`);
      console.log(`🔐 Nueva contraseña: ${newPassword}`);
      console.log('\n⚠️  Guarda esta contraseña en un lugar seguro');
    } else {
      console.log('❌ No se encontró el usuario con ese email');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear la contraseña:', error);
    process.exit(1);
  }
}

resetPassword();
