const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ─── AUTO MIGRATION ──────────────────────────────────────────────────────────
// Runs once on startup to ensure new columns/tables exist
(async () => {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS db');
    const dbName = dbRows[0].db;

    // Helper: add column only if missing (compatible with MySQL 5.7+)
    async function addColumnIfMissing(table, column, definition) {
      const [cols] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [dbName, table, column]
      );
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`[BACKEND-EMPRESAS] Added column ${table}.${column}`);
      }
    }

    await addColumnIfMissing('empresas',   'logo_url',   'VARCHAR(2048) DEFAULT NULL');
    await addColumnIfMissing('sucursales', 'imagen_url', 'VARCHAR(2048) DEFAULT NULL');
    await addColumnIfMissing('reportes',   'equipo_id',  'INT DEFAULT NULL');

    // Create equipos_sucursal table if missing
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipos_sucursal (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sucursal_id INT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        modelo VARCHAR(255) DEFAULT NULL,
        serie VARCHAR(255) DEFAULT NULL,
        imagen_url VARCHAR(2048) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE
      )
    `);
    console.log('[BACKEND-EMPRESAS] ✓ Schema auto-migration done');
  } catch (err) {
    console.error('[BACKEND-EMPRESAS] Migration error:', err.message);
  }
})();


// ============ EMPRESAS ============

// GET todas las empresas (incluye logo_url y count de sucursales)
router.get('/', verifyToken, async (req, res) => {
  try {
    const [empresas] = await pool.query(
      `SELECT e.id, e.nombre, e.logo_url, e.created_at, e.updated_at,
              COUNT(s.id) AS sucursales_count
       FROM empresas e
       LEFT JOIN sucursales s ON s.empresa_id = e.id
       GROUP BY e.id
       ORDER BY e.nombre`
    );
    return res.json({ success: true, data: empresas });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear empresa
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre, logo_url } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }
    const [result] = await pool.query(
      'INSERT INTO empresas (nombre, logo_url) VALUES (?, ?)',
      [nombre.trim(), logo_url || null]
    );
    const [empresa] = await pool.query(
      'SELECT id, nombre, logo_url, created_at FROM empresas WHERE id = ?',
      [result.insertId]
    );
    return res.json({ success: true, data: empresa[0] });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al crear empresa:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT actualizar empresa (nombre y/o logo_url)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, logo_url, direccion, ciudad, activo, imagen_url } = req.body;

    // If it has sucursal-specific fields, handle as sucursal update
    if (direccion !== undefined || ciudad !== undefined || activo !== undefined || imagen_url !== undefined) {
      const [sucursal] = await pool.query('SELECT id FROM sucursales WHERE id = ?', [id]);
      if (sucursal.length > 0) {
        const updates = [];
        const values = [];
        if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre.trim()); }
        if (direccion !== undefined) { updates.push('direccion = ?'); values.push(direccion.trim()); }
        if (ciudad !== undefined) { updates.push('ciudad = ?'); values.push(ciudad); }
        if (activo !== undefined) { updates.push('activo = ?'); values.push(activo ? 1 : 0); }
        if (imagen_url !== undefined) { updates.push('imagen_url = ?'); values.push(imagen_url); }

        if (updates.length === 0) {
          return res.status(400).json({ success: false, error: 'No hay campos para actualizar' });
        }
        values.push(id);
        await pool.query(`UPDATE sucursales SET ${updates.join(', ')} WHERE id = ?`, values);
        const [s] = await pool.query(
          'SELECT id, empresa_id, nombre, direccion, ciudad, activo, imagen_url, created_at FROM sucursales WHERE id = ?',
          [id]
        );
        return res.json({ success: true, data: s[0] });
      }
    }

    // Handle as empresa update
    const updates = [];
    const values = [];
    if (nombre !== undefined) { updates.push('nombre = ?'); values.push(nombre.trim()); }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); values.push(logo_url); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay campos para actualizar' });
    }
    values.push(id);
    await pool.query(`UPDATE empresas SET ${updates.join(', ')} WHERE id = ?`, values);
    const [empresa] = await pool.query(
      'SELECT id, nombre, logo_url, created_at FROM empresas WHERE id = ?',
      [id]
    );
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa no encontrada' });
    }
    return res.json({ success: true, data: empresa[0] });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al actualizar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar empresa
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [empresa] = await pool.query('SELECT id FROM empresas WHERE id = ?', [id]);
    if (empresa.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa no encontrada' });
    }
    const [sucursalesAsociadas] = await pool.query(
      'SELECT COUNT(*) as count FROM sucursales WHERE empresa_id = ?', [id]
    );
    if (sucursalesAsociadas[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar. Tiene sucursales asociadas. Elimínalas primero.'
      });
    }
    await pool.query('DELETE FROM empresas WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Empresa eliminada' });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al eliminar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SUCURSALES ============

// GET sucursales por empresa (incluye imagen_url y count de equipos)
router.get('/empresa/:empresaId', verifyToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const [sucursales] = await pool.query(
      `SELECT s.id, s.empresa_id, s.nombre, s.direccion, s.ciudad, s.activo, s.imagen_url,
              s.created_at, s.updated_at,
              COUNT(eq.id) AS equipos_count
       FROM sucursales s
       LEFT JOIN equipos_sucursal eq ON eq.sucursal_id = s.id
       WHERE s.empresa_id = ?
       GROUP BY s.id
       ORDER BY s.nombre`,
      [empresaId]
    );
    return res.json({ success: true, data: sucursales });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear sucursal
router.post('/crear', verifyToken, async (req, res) => {
  try {
    const { empresa_id, nombre, direccion, ciudad, activo, imagen_url } = req.body;
    if (!empresa_id || !nombre || !direccion) {
      return res.status(400).json({ success: false, error: 'empresa_id, nombre y direccion son requeridos' });
    }
    const [empresas] = await pool.query('SELECT id FROM empresas WHERE id = ?', [empresa_id]);
    if (empresas.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa no encontrada' });
    }
    const [result] = await pool.query(
      'INSERT INTO sucursales (empresa_id, nombre, direccion, ciudad, activo, imagen_url) VALUES (?, ?, ?, ?, ?, ?)',
      [empresa_id, nombre.trim(), direccion.trim(), ciudad || null, activo !== false ? 1 : 0, imagen_url || null]
    );
    const [sucursal] = await pool.query(
      'SELECT id, empresa_id, nombre, direccion, ciudad, activo, imagen_url, created_at FROM sucursales WHERE id = ?',
      [result.insertId]
    );
    return res.json({ success: true, data: sucursal[0] });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error al crear:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar sucursal
router.delete('/sucursal/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM sucursales WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sucursal no encontrada' });
    }
    return res.json({ success: true, message: 'Sucursal eliminada' });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error al eliminar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============ EQUIPOS DE SUCURSAL ============

// GET equipos por sucursal
router.get('/sucursal/:sucursalId/equipos', verifyToken, async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const [equipos] = await pool.query(
      'SELECT id, sucursal_id, nombre, modelo, serie, imagen_url, created_at FROM equipos_sucursal WHERE sucursal_id = ? ORDER BY nombre',
      [sucursalId]
    );
    return res.json({ success: true, data: equipos });
  } catch (error) {
    console.error('[BACKEND-EQUIPOS] Error al obtener:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear equipo en sucursal
router.post('/sucursal/:sucursalId/equipos', verifyToken, async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { nombre, modelo, serie, imagen_url } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre del equipo es requerido' });
    }
    const [result] = await pool.query(
      'INSERT INTO equipos_sucursal (sucursal_id, nombre, modelo, serie, imagen_url) VALUES (?, ?, ?, ?, ?)',
      [sucursalId, nombre.trim(), modelo?.trim() || null, serie?.trim() || null, imagen_url || null]
    );
    const [equipo] = await pool.query(
      'SELECT id, sucursal_id, nombre, modelo, serie, imagen_url, created_at FROM equipos_sucursal WHERE id = ?',
      [result.insertId]
    );
    return res.json({ success: true, data: equipo[0] });
  } catch (error) {
    console.error('[BACKEND-EQUIPOS] Error al crear:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar equipo
router.delete('/equipos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM equipos_sucursal WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Equipo no encontrado' });
    }
    return res.json({ success: true, message: 'Equipo eliminado' });
  } catch (error) {
    console.error('[BACKEND-EQUIPOS] Error al eliminar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET historial de servicios de un equipo
router.get('/equipos/:equipoId/historial', verifyToken, async (req, res) => {
  try {
    const { equipoId } = req.params;
    const [reportes] = await pool.query(
      `SELECT
         r.id, r.titulo, r.estado, r.prioridad, r.created_at, r.updated_at,
         r.analisis_general, r.revision, r.reparacion,
         r.recomendaciones, r.recomendaciones_adicionales, r.materiales_refacciones,
         r.precio_cotizacion, r.moneda, r.comentario, r.descripcion,
         COALESCE(CONCAT(emp.nombre, ' ', emp.apellido), r.empleado_asignado_nombre) AS tecnico
       FROM reportes r
       LEFT JOIN usuarios emp ON r.empleado_asignado_id = emp.id
       WHERE r.equipo_id = ?
       ORDER BY r.created_at DESC`,
      [equipoId]
    );
    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('[BACKEND-HISTORIAL] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
