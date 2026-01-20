const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// ============ ENDPOINTS PARA MIGRACIÓN SUPABASE ============

// POST crear tarea (desde lib/tareas.ts)
router.post('/crear', verifyToken, async (req, res) => {
  try {
    const { admin_email, admin_nombre, empleado_email, descripcion } = req.body;

    if (!admin_email || !admin_nombre || !empleado_email || !descripcion) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan parámetros: admin_email, admin_nombre, empleado_email, descripcion' 
      });
    }

    console.log(`[BACKEND-TAREAS] Creando tarea para empleado: ${empleado_email}`);

    const [result] = await pool.query(
      'INSERT INTO tareas (admin_email, admin_nombre, empleado_email, descripcion, estado) VALUES (?, ?, ?, ?, ?)',
      [admin_email, admin_nombre, empleado_email, descripcion, 'pendiente']
    );

    const [tarea] = await pool.query(
      'SELECT * FROM tareas WHERE id = ?',
      [result.insertId]
    );

    console.log(`[BACKEND-TAREAS] Tarea creada: ${result.insertId}`);
    return res.json({ success: true, data: tarea[0] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error al crear tarea:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET tareas del empleado (email)
router.get('/empleado-email/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-TAREAS] Obteniendo tareas del empleado:', email);

    const [tareas] = await pool.query(
      'SELECT * FROM tareas WHERE empleado_email = ? ORDER BY created_at DESC',
      [email]
    );

    console.log('[BACKEND-TAREAS] Tareas obtenidas:', tareas.length);
    return res.json({ success: true, data: tareas || [] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET todas las tareas (admin)
router.get('/todas', verifyToken, async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    console.log('[BACKEND-TAREAS] Obteniendo TODAS las tareas (admin)');

    const [tareas] = await pool.query(
      'SELECT * FROM tareas ORDER BY created_at DESC'
    );

    console.log('[BACKEND-TAREAS] Total de tareas:', tareas.length);
    return res.json({ success: true, data: tareas || [] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET empleados (usuarios con rol empleado)
router.get('/empleados/lista', verifyToken, async (req, res) => {
  try {
    console.log('[BACKEND-TAREAS] Obteniendo lista de empleados');

    const [empleados] = await pool.query(
      'SELECT id, email, nombre, apellido, rol FROM usuarios WHERE rol = ? ORDER BY nombre ASC',
      ['empleado']
    );

    console.log('[BACKEND-TAREAS] Empleados obtenidos:', empleados.length);
    return res.json({ success: true, data: empleados || [] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT actualizar estado de tarea
router.put('/:id/estado', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente', 'en_proceso', 'completada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' });
    }

    console.log(`[BACKEND-TAREAS] Actualizando tarea ${id} a estado: ${estado}`);

    const [result] = await pool.query(
      'UPDATE tareas SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
    }

    const [tarea] = await pool.query(
      'SELECT * FROM tareas WHERE id = ?',
      [id]
    );

    console.log(`[BACKEND-TAREAS] Tarea actualizada a estado: ${estado}`);
    return res.json({ success: true, data: tarea[0] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error al actualizar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET obtener tarea por ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[BACKEND-TAREAS] Obteniendo tarea:', id);

    const [tarea] = await pool.query(
      'SELECT * FROM tareas WHERE id = ?',
      [id]
    );

    if (tarea.length === 0) {
      return res.status(404).json({ success: false, error: 'Tarea no encontrada' });
    }

    console.log('[BACKEND-TAREAS] Tarea obtenida:', id);
    return res.json({ success: true, data: tarea[0] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET obtener todas las tareas
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('[BACKEND-TAREAS] GET / - Obteniendo todas las tareas');

    const [tareas] = await pool.query(
      'SELECT * FROM tareas ORDER BY created_at DESC'
    );

    console.log('[BACKEND-TAREAS] Total de tareas:', tareas.length);
    return res.json({ success: true, data: tareas || [] });
  } catch (error) {
    console.error('[BACKEND-TAREAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
