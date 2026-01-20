const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Obtener herramientas disponibles
router.get('/herramientas', verifyToken, async (req, res) => {
  try {
    const [herramientas] = await pool.query(
      'SELECT * FROM inventario_herramientas ORDER BY nombre'
    );

    return res.json({ success: true, data: herramientas });
  } catch (error) {
    console.error('Error al obtener herramientas:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Crear herramienta
router.post('/herramientas', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    const [result] = await pool.query(
      'INSERT INTO inventario_herramientas (nombre, descripcion, estado, created_at) VALUES (?, ?, ?, NOW())',
      [nombre, descripcion || '', estado || 'disponible']
    );

    return res.status(201).json({ success: true, herramientaId: result.insertId });
  } catch (error) {
    console.error('Error al crear herramienta:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener inventario de un empleado
router.get('/empleado/:empleadoId', verifyToken, async (req, res) => {
  try {
    const [asignaciones] = await pool.query(
      `SELECT a.*, h.nombre as herramienta_nombre, u.nombre as usuario_nombre, u.email as usuario_email
       FROM inventario_asignaciones a
       JOIN inventario_herramientas h ON a.herramienta_id = h.id
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.usuario_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.empleadoId]
    );

    return res.json({ success: true, data: asignaciones });
  } catch (error) {
    console.error('Error al obtener inventario del empleado:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener asignaciones de herramientas
router.get('/asignaciones', verifyToken, async (req, res) => {
  try {
    const [asignaciones] = await pool.query(
      `SELECT a.*, h.nombre as herramienta_nombre, u.nombre as usuario_nombre
       FROM inventario_asignaciones a
       JOIN inventario_herramientas h ON a.herramienta_id = h.id
       JOIN usuarios u ON a.usuario_id = u.id
       ORDER BY a.created_at DESC`
    );

    return res.json({ success: true, data: asignaciones });
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Asignar herramienta a empleado (primero busca o crea)
router.post('/asignar', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { usuario_id, herramienta_nombre } = req.body;

    if (!usuario_id || !herramienta_nombre) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    // Buscar si la herramienta existe
    let [herramientas] = await pool.query(
      'SELECT id FROM inventario_herramientas WHERE nombre = ?',
      [herramienta_nombre]
    );

    let herramienta_id;

    if (herramientas.length === 0) {
      // Crear herramienta si no existe
      const [result] = await pool.query(
        'INSERT INTO inventario_herramientas (nombre, descripcion, estado, created_at) VALUES (?, ?, ?, NOW())',
        [herramienta_nombre, 'Creada automáticamente', 'disponible']
      );
      herramienta_id = result.insertId;
    } else {
      herramienta_id = herramientas[0].id;
    }

    // Crear asignación
    const [result] = await pool.query(
      'INSERT INTO inventario_asignaciones (usuario_id, herramienta_id, estado, created_at) VALUES (?, ?, ?, NOW())',
      [usuario_id, herramienta_id, 'asignada']
    );

    return res.status(201).json({ success: true, asignacionId: result.insertId });
  } catch (error) {
    console.error('Error al asignar herramienta:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Desasignar herramienta
router.delete('/asignaciones/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM inventario_asignaciones WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Asignar herramienta a empleado (manual - con más detalles)
router.post('/asignar-manual', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { 
      herramienta_nombre,
      usuario_id,
      cantidad,
      observaciones
    } = req.body;

    if (!herramienta_nombre || !usuario_id) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    // Buscar o crear herramienta
    let [herramientas] = await pool.query(
      'SELECT id FROM inventario_herramientas WHERE nombre = ?',
      [herramienta_nombre]
    );

    let herramienta_id;

    if (herramientas.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO inventario_herramientas (nombre, estado, created_at) VALUES (?, ?, NOW())',
        [herramienta_nombre, 'disponible']
      );
      herramienta_id = result.insertId;
    } else {
      herramienta_id = herramientas[0].id;
    }

    // Crear asignación
    const [result] = await pool.query(
      'INSERT INTO inventario_asignaciones (usuario_id, herramienta_id, cantidad, observaciones, estado, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [usuario_id, herramienta_id, cantidad || 1, observaciones || null, 'asignada']
    );

    const [asignacion] = await pool.query(
      'SELECT * FROM inventario_asignaciones WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ success: true, data: asignacion[0] });
  } catch (error) {
    console.error('Error al asignar herramienta manual:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar herramienta como devuelta
router.put('/asignaciones/:id/devuelta', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { observaciones } = req.body;

    await pool.query(
      'UPDATE inventario_asignaciones SET estado = ?, observaciones = ?, updated_at = NOW() WHERE id = ?',
      ['devuelta', observaciones || null, req.params.id]
    );

    const [asignacion] = await pool.query(
      'SELECT * FROM inventario_asignaciones WHERE id = ?',
      [req.params.id]
    );

    return res.json({ success: true, data: asignacion[0] });
  } catch (error) {
    console.error('Error al marcar como devuelta:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Marcar herramienta como perdida
router.put('/asignaciones/:id/perdida', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { observaciones } = req.body;

    await pool.query(
      'UPDATE inventario_asignaciones SET estado = ?, observaciones = ?, updated_at = NOW() WHERE id = ?',
      ['perdida', observaciones || null, req.params.id]
    );

    const [asignacion] = await pool.query(
      'SELECT * FROM inventario_asignaciones WHERE id = ?',
      [req.params.id]
    );

    return res.json({ success: true, data: asignacion[0] });
  } catch (error) {
    console.error('Error al marcar como perdida:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
