const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ============ EMPRESAS ============

// GET todas las empresas
router.get('/', verifyToken, async (req, res) => {
  try {
    const [empresas] = await pool.query(
      'SELECT id, nombre, created_at, updated_at FROM empresas ORDER BY nombre'
    );
    console.log('[BACKEND-EMPRESAS] Empresas obtenidas:', empresas.length);
    return res.json({ success: true, data: empresas });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear empresa
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    const [result] = await pool.query(
      'INSERT INTO empresas (nombre) VALUES (?)',
      [nombre.trim()]
    );

    const [empresa] = await pool.query(
      'SELECT id, nombre, created_at, updated_at FROM empresas WHERE id = ?',
      [result.insertId]
    );

    console.log('[BACKEND-EMPRESAS] Empresa creada:', result.insertId);
    return res.json({ success: true, data: empresa[0] });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al crear empresa:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT actualizar empresa o sucursal
// PUT actualizar empresa o sucursal
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, ciudad, activo } = req.body;

    // Si tiene campos de sucursal (direccion, ciudad, activo), intentar actualizar como sucursal primero
    if (direccion !== undefined || ciudad !== undefined || activo !== undefined) {
      const [sucursal] = await pool.query(
        'SELECT id FROM sucursales WHERE id = ?',
        [id]
      );

      if (sucursal.length > 0) {
        // Es una sucursal, actualizarla
        const updates = [];
        const values = [];

        if (nombre !== undefined) {
          updates.push('nombre = ?');
          values.push(nombre.trim());
        }
        if (direccion !== undefined) {
          updates.push('direccion = ?');
          values.push(direccion.trim());
        }
        if (ciudad !== undefined) {
          updates.push('ciudad = ?');
          values.push(ciudad);
        }
        if (activo !== undefined) {
          updates.push('activo = ?');
          values.push(activo ? 1 : 0);
        }

        if (updates.length === 0) {
          return res.status(400).json({ success: false, error: 'No hay campos para actualizar' });
        }

        values.push(id);
        await pool.query(
          `UPDATE sucursales SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        const [sucursalActualizada] = await pool.query(
          'SELECT id, empresa_id, nombre, direccion, ciudad, activo, created_at, updated_at FROM sucursales WHERE id = ?',
          [id]
        );

        console.log('[BACKEND-SUCURSALES] Sucursal actualizada:', id);
        return res.json({ success: true, data: sucursalActualizada[0] });
      }
    }

    // Si no es sucursal o no tiene campos de sucursal, actualizar como empresa
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre es requerido' });
    }

    await pool.query(
      'UPDATE empresas SET nombre = ? WHERE id = ?',
      [nombre.trim(), id]
    );

    const [empresa] = await pool.query(
      'SELECT id, nombre, created_at, updated_at FROM empresas WHERE id = ?',
      [id]
    );

    if (empresa.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa o sucursal no encontrada' });
    }

    console.log('[BACKEND-EMPRESAS] Empresa actualizada:', id);
    return res.json({ success: true, data: empresa[0] });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al actualizar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar sucursal
router.delete('/sucursal/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [sucursal] = await pool.query(
      'SELECT id FROM sucursales WHERE id = ?',
      [id]
    );

    if (sucursal.length === 0) {
      return res.status(404).json({ success: false, error: 'Sucursal no encontrada' });
    }

    await pool.query(
      'DELETE FROM sucursales WHERE id = ?',
      [id]
    );

    console.log('[BACKEND-SUCURSALES] Sucursal eliminada:', id);
    return res.json({ success: true, message: 'Sucursal eliminada' });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error al eliminar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar empresa
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [empresa] = await pool.query(
      'SELECT id FROM empresas WHERE id = ?',
      [id]
    );

    if (empresa.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa no encontrada' });
    }

    // Verificar si la empresa tiene sucursales asociadas
    const [sucursalesAsociadas] = await pool.query(
      'SELECT COUNT(*) as count FROM sucursales WHERE empresa_id = ?',
      [id]
    );

    if (sucursalesAsociadas[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se puede eliminar la empresa. Tiene sucursales asociadas. Elimina las sucursales primero.' 
      });
    }

    // Eliminar empresa
    const [result] = await pool.query(
      'DELETE FROM empresas WHERE id = ?',
      [id]
    );

    console.log('[BACKEND-EMPRESAS] Empresa eliminada:', id);
    return res.json({ success: true, message: 'Empresa eliminada' });
  } catch (error) {
    console.error('[BACKEND-EMPRESAS] Error al eliminar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SUCURSALES ============

// GET sucursales por empresa
router.get('/empresa/:empresaId', verifyToken, async (req, res) => {
  try {
    const { empresaId } = req.params;
    
    const [sucursales] = await pool.query(
      'SELECT id, empresa_id, nombre, direccion, ciudad, activo, created_at, updated_at FROM sucursales WHERE empresa_id = ? ORDER BY nombre',
      [empresaId]
    );

    console.log('[BACKEND-SUCURSALES] Sucursales obtenidas para empresa:', empresaId);
    return res.json({ success: true, data: sucursales });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST crear sucursal
router.post('/crear', verifyToken, async (req, res) => {
  try {
    const { empresa_id, nombre, direccion, ciudad, activo } = req.body;

    if (!empresa_id || !nombre || !direccion) {
      return res.status(400).json({ 
        success: false, 
        error: 'empresa_id, nombre y direccion son requeridos' 
      });
    }

    // Verificar que la empresa existe
    const [empresas] = await pool.query(
      'SELECT id FROM empresas WHERE id = ?',
      [empresa_id]
    );

    if (empresas.length === 0) {
      return res.status(404).json({ success: false, error: 'Empresa no encontrada' });
    }

    const [result] = await pool.query(
      'INSERT INTO sucursales (empresa_id, nombre, direccion, ciudad, activo) VALUES (?, ?, ?, ?, ?)',
      [empresa_id, nombre.trim(), direccion.trim(), ciudad || null, activo !== false ? 1 : 0]
    );

    const [sucursal] = await pool.query(
      'SELECT id, empresa_id, nombre, direccion, ciudad, activo, created_at, updated_at FROM sucursales WHERE id = ?',
      [result.insertId]
    );

    console.log('[BACKEND-SUCURSALES] Sucursal creada:', result.insertId);
    return res.json({ success: true, data: sucursal[0] });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error al crear sucursal:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE eliminar sucursal
router.delete('/sucursal/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM sucursales WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Sucursal no encontrada' });
    }

    console.log('[BACKEND-SUCURSALES] Sucursal eliminada:', id);
    return res.json({ success: true, message: 'Sucursal eliminada' });
  } catch (error) {
    console.error('[BACKEND-SUCURSALES] Error al eliminar sucursal:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
