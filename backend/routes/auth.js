const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, telefono, ciudad, empresa, empresa_id } = req.body;

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    const emailLowercase = email.toLowerCase().trim();

    // Verificar si el email ya existe
    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [emailLowercase]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, contraseña, telefono, ciudad, empresa_id, rol, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [nombre, apellido || '', emailLowercase, hashedPassword, telefono || '', ciudad || '', empresa_id || null, 'cliente', 'activo']
    );

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });
    }

    const emailLowercase = email.toLowerCase().trim();

    // Buscar usuario
    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [emailLowercase]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'El email no está registrado' });
    }

    const usuario = users[0];

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'La contraseña es incorrecta' });
    }

    // Verificar si la cuenta está activa
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ success: false, error: 'Tu cuenta ha sido desactivada' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Obtener nombre de la empresa si existe empresa_id
    let empresaNombre = '';
    if (usuario.empresa_id) {
      const [empresas] = await pool.query(
        'SELECT nombre FROM empresas WHERE id = ?',
        [usuario.empresa_id]
      );
      empresaNombre = empresas.length > 0 ? empresas[0].nombre : '';
    }

    return res.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        estado: usuario.estado,
        empresa: empresaNombre
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener perfil del usuario autenticado
router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, ciudad, empresa_id, rol, estado FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const usuario = users[0];

    // Obtener nombre de la empresa si existe empresa_id
    let empresaNombre = '';
    if (usuario.empresa_id) {
      const [empresas] = await pool.query(
        'SELECT nombre FROM empresas WHERE id = ?',
        [usuario.empresa_id]
      );
      empresaNombre = empresas.length > 0 ? empresas[0].nombre : '';
    }

    return res.json({
      success: true,
      user: {
        ...usuario,
        empresa: empresaNombre
      }
    });
  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cambiar contraseña
router.put('/change-password', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    // Obtener contraseña actual del usuario
    const [users] = await pool.query('SELECT contraseña FROM usuarios WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'La contraseña actual es incorrecta' });
    }

    // Encyptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar en base de datos
    await pool.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [hashedPassword, userId]);

    return res.json({ success: true, message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
