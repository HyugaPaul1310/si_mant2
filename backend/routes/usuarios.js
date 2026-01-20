const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Obtener todos los usuarios (solo admin)
// Transformado de Supabase: select('id, nombre, apellido, email, rol, estado, empresa, telefono, created_at')
// Nota: MySQL usa empresa_id en lugar de empresa
router.get('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id, 
        nombre, 
        apellido, 
        email, 
        rol, 
        estado, 
        empresa_id,
        telefono, 
        created_at 
      FROM usuarios 
      ORDER BY created_at DESC`
    );

    return res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener sucursales del usuario por email - DEBE ESTAR ANTES DE /:id
router.get('/sucursales', verifyToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    // Obtener empresa_id del usuario
    const [usuarios] = await pool.query(
      'SELECT empresa_id FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const empresaId = usuarios[0].empresa_id;

    // Obtener sucursales activas de esa empresa
    const [sucursales] = await pool.query(
      'SELECT id, empresa_id, nombre, direccion, ciudad FROM sucursales WHERE empresa_id = ? AND activo = TRUE ORDER BY nombre',
      [empresaId]
    );

    return res.json({ success: true, data: sucursales });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener usuario por ID - DEBE ESTAR DESPUÉS DE /sucursales
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id, 
        nombre, 
        apellido, 
        email, 
        rol, 
        estado, 
        empresa_id,
        telefono
      FROM usuarios 
      WHERE id = ?`,
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    return res.json({ success: true, data: usuarios[0] });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, ciudad, empresa } = req.body;

    // Verificar que es su propio perfil o es admin
    if (req.user.id !== parseInt(req.params.id) && req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acceso denegado' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (email) updateData.email = email.toLowerCase().trim();
    if (telefono) updateData.telefono = telefono;
    if (ciudad) updateData.ciudad = ciudad;
    if (empresa) updateData.empresa = empresa;

    const query = 'UPDATE usuarios SET ' + Object.keys(updateData).map(k => `${k} = ?`).join(', ') + ' WHERE id = ?';
    const values = [...Object.values(updateData), req.params.id];

    await pool.query(query, values);

    return res.json({ success: true, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cambiar rol de usuario (solo admin)
router.put('/:id/role', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { rol } = req.body;

    if (!['cliente', 'empleado', 'admin'].includes(rol)) {
      return res.status(400).json({ success: false, error: 'Rol inválido' });
    }

    await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, req.params.id]);

    return res.json({ success: true, message: 'Rol actualizado' });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cambiar estado de usuario (solo admin)
router.put('/:id/status', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' });
    }

    await pool.query('UPDATE usuarios SET estado = ? WHERE id = ?', [estado, req.params.id]);

    return res.json({ success: true, message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar usuario (marcar como inactivo)
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await pool.query('UPDATE usuarios SET estado = ? WHERE id = ?', ['inactivo', req.params.id]);

    return res.json({ success: true, message: 'Usuario desactivado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
