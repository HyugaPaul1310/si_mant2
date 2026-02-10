const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');

// Obtener todos los reportes
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        r.id,
        r.titulo,
        r.descripcion,
        r.estado,
        r.prioridad,
        r.usuario_id,
        r.empresa_id,
        r.created_at,
        r.updated_at,
        r.analisis_general,
        r.precio_cotizacion,
        r.revision,
        r.recomendaciones,
        r.reparacion,
        r.recomendaciones_adicionales,
        r.materiales_refacciones,
        r.empleado_asignado_id,
        COALESCE(emp.email, r.empleado_asignado_email) as empleado_asignado_email,
        COALESCE(CONCAT(emp.nombre, ' ', emp.apellido), r.empleado_asignado_nombre) as empleado_asignado_nombre,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.email as usuario_email,
        e.nombre as empresa,
        SUBSTRING_INDEX(r.titulo, ' - ', 1) as equipo_descripcion,
        TRIM(SUBSTRING(r.titulo, POSITION(' - ' IN r.titulo) + 3)) as sucursal,
        r.comentario,
        r.motivo_cancelacion
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN empresas e ON r.empresa_id = e.id
      LEFT JOIN usuarios emp ON r.empleado_asignado_id = emp.id
    `;
    const params = [];

    // Si no es admin, filtrar por empresa
    if (req.user.rol !== 'admin') {
      const [user] = await pool.query('SELECT empresa_id FROM usuarios WHERE id = ?', [req.user.id]);
      if (user.length > 0) {
        query += ' WHERE r.empresa_id = ?';
        params.push(user[0].empresa_id);
      }
    }

    query += ' ORDER BY r.created_at DESC';
    const [reportes] = await pool.query(query, params);

    console.log('[GET-REPORTES] Total reportes retornados:', reportes.length);
    if (reportes.length > 0) {
      console.log('[GET-REPORTES] Primeros 3 reportes:', reportes.slice(0, 3).map((r) => ({
        id: r.id,
        titulo: r.titulo,
        estado: r.estado,
        analisis: r.analisis_general ? 'SÍ' : 'NO',
        precio: r.precio_cotizacion
      })));
    }

    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Crear reporte
router.post('/', verifyToken, async (req, res) => {
  try {
    const { titulo, descripcion, estado, prioridad } = req.body;

    const [user] = await pool.query('SELECT empresa_id FROM usuarios WHERE id = ?', [req.user.id]);
    const empresa_id = user[0]?.empresa_id;

    console.log('[BACKEND] Insertando reporte:', { titulo, descripcion, usuario_id: req.user.id, empresa_id, prioridad });

    const result = await pool.query(
      'INSERT INTO reportes (titulo, descripcion, estado, prioridad, usuario_id, empresa_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [titulo, descripcion, estado || 'pendiente', prioridad || 'media', req.user.id, empresa_id]
    );

    console.log('[BACKEND] result completo:', result);
    console.log('[BACKEND] result[0]:', result[0]);
    console.log('[BACKEND] result[0].insertId:', result[0]?.insertId);

    const insertId = result[0]?.insertId;

    console.log('[BACKEND] insertId obtenido:', insertId);

    // Obtener el reporte creado
    if (insertId && insertId > 0) {
      const [reporte] = await pool.query('SELECT * FROM reportes WHERE id = ?', [insertId]);
      console.log('[BACKEND] Reporte obtenido:', reporte[0]);
      return res.status(201).json({ success: true, data: reporte[0] });
    } else {
      console.warn('[BACKEND] insertId no válido, retornando insertId directamente');
      return res.status(201).json({ success: true, data: { id: insertId } });
    }
  } catch (error) {
    console.error('[BACKEND] Error al crear reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar reporte
router.put('/:id', verifyToken, async (req, res) => {
  try {
    console.log('[DEBUG-PUT] REQ.BODY:', JSON.stringify(req.body, null, 2));
    const { titulo, descripcion, estado, prioridad, precioCotizacion, precio_cotizacion } = req.body;

    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;
    if (prioridad !== undefined) updateData.prioridad = prioridad;

    // Handle both naming conventions for price
    if (precioCotizacion !== undefined) {
      updateData.precio_cotizacion = precioCotizacion;
      console.log('[DEBUG-PUT] precioCotizacion:', precioCotizacion);
    } else if (precio_cotizacion !== undefined) {
      updateData.precio_cotizacion = precio_cotizacion;
      console.log('[DEBUG-PUT] precio_cotizacion:', precio_cotizacion);
    }

    if (req.body.motivo_cancelacion !== undefined) {
      updateData.motivo_cancelacion = req.body.motivo_cancelacion;
      console.log('[DEBUG-PUT] motivo_cancelacion:', req.body.motivo_cancelacion);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
    }

    const query = 'UPDATE reportes SET ' + Object.keys(updateData).map(k => `${k} = ?`).join(', ') + ' WHERE id = ?';
    const values = [...Object.values(updateData), req.params.id];

    await pool.query(query, values);

    // Obtener el reporte actualizado para confirmar
    const [reporte] = await pool.query('SELECT * FROM reportes WHERE id = ?', [req.params.id]);

    return res.json({ success: true, message: 'Reporte actualizado', data: reporte[0] });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar reporte
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM reportes WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Reporte eliminado' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar archivo de reporte
router.delete('/archivos/:id', verifyToken, async (req, res) => {
  try {
    // Primero obtener el archivo para saber si existe y quizás borrarlo de cloud storage (si se implementara)
    const [archivo] = await pool.query('SELECT * FROM reportes_archivos WHERE id = ?', [req.params.id]);

    if (archivo.length === 0) {
      return res.status(404).json({ success: false, error: 'Archivo no encontrado' });
    }

    await pool.query('DELETE FROM reportes_archivos WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Archivo eliminado' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Asignar reporte a un empleado
router.put('/:id/asignar', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const { empleado_id } = req.body;

    if (!empleado_id) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    // Obtener datos del empleado
    const [empleado] = await pool.query('SELECT nombre, apellido, email FROM usuarios WHERE id = ?', [empleado_id]);

    if (empleado.length === 0) {
      return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
    }

    const { nombre, apellido, email } = empleado[0];
    const nombreCompleto = `${nombre} ${apellido}`;

    // Asignar empleado y cambiar estado a 'asignado'
    // Actualizamos tanto el ID (para consultas eficientes) como Email/Nombre (para compatibilidad)
    console.log('[BACKEND-ASIGNAR] Asignando reporte', req.params.id, 'a empleado', email);
    await pool.query(
      'UPDATE reportes SET empleado_asignado_id = ?, empleado_asignado_email = ?, empleado_asignado_nombre = ?, estado = "asignado" WHERE id = ?',
      [empleado_id, email, nombreCompleto, req.params.id]
    );

    const [reporte] = await pool.query('SELECT * FROM reportes WHERE id = ?', [req.params.id]);
    console.log('[BACKEND-ASIGNAR] ✓ Reporte asignado y estado cambiado a "asignado"');

    return res.json({ success: true, data: reporte[0] });
  } catch (error) {
    console.error('Error al asignar reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener reportes asignados a un empleado por email (query param)
router.get('/empleado', verifyToken, async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    // Obtener el usuario_id del email
    const [usuarios] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const usuario_id = usuarios[0].id;

    // Retornar reportes asignados a este empleado CON datos de usuario y empresa
    console.log('[BACKEND-EMPLEADO] Obteniendo reportes asignados a empleado:', usuario_id);
    const [reportes] = await pool.query(
      `SELECT 
        r.id,
        r.titulo,
        r.descripcion,
        r.estado,
        r.prioridad,
        r.usuario_id,
        r.empresa_id,
        r.empleado_asignado_id,
        r.analisis_general,
        r.precio_cotizacion,
        r.revision,
        r.recomendaciones,
        r.reparacion,
        r.recomendaciones_adicionales,
        r.materiales_refacciones,
        r.created_at,
        r.updated_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.email as usuario_email,
        e.nombre as empresa,
        SUBSTRING_INDEX(r.titulo, ' - ', 1) as equipo_descripcion,
        TRIM(SUBSTRING(r.titulo, POSITION(' - ' IN r.titulo) + 3)) as sucursal,
        r.comentario,
        r.motivo_cancelacion
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN empresas e ON r.empresa_id = e.id
      WHERE r.empleado_asignado_id = ? 
      ORDER BY r.created_at DESC`,
      [usuario_id]
    );

    console.log('[BACKEND-EMPLEADO] ✓ Reportes encontrados:', reportes.length);
    console.log('[BACKEND-EMPLEADO] Primer reporte:', reportes[0]);
    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('Error al obtener reportes asignados:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener reportes creados por un cliente (por email - query param)
router.get('/cliente', verifyToken, async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email requerido' });
    }

    // Obtener el usuario_id del email
    const [usuarios] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const usuario_id = usuarios[0].id;

    // Obtener reportes creados por este cliente
    const [reportes] = await pool.query(
      `SELECT 
        r.id,
        r.titulo,
        r.descripcion,
        r.estado,
        r.prioridad,
        r.usuario_id,
        r.empresa_id,
        r.empleado_asignado_id,
        r.analisis_general,
        r.precio_cotizacion,
        r.revision,
        r.reparacion,
        r.recomendaciones,
        r.materiales_refacciones,
        r.recomendaciones_adicionales,
        r.created_at,
        r.updated_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.email as usuario_email,
        e.nombre as empresa,
        emp.nombre as empleado_nombre,
        emp.apellido as empleado_apellido,
        emp.email as empleado_email,
        SUBSTRING_INDEX(r.titulo, ' - ', 1) as equipo_descripcion,
        TRIM(SUBSTRING(r.titulo, POSITION(' - ' IN r.titulo) + 3)) as sucursal,
        r.comentario,
        r.motivo_cancelacion
      FROM reportes r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN empresas e ON r.empresa_id = e.id
      LEFT JOIN usuarios emp ON r.empleado_asignado_id = emp.id
      WHERE r.usuario_id = ? 
      ORDER BY r.created_at DESC`,
      [usuario_id]
    );

    console.log('[BACKEND-CLIENTE] Reportes obtenidos:', reportes.length);
    console.log('[BACKEND-CLIENTE] Primer reporte:', reportes[0]);

    // Mostrar reportes con cotización
    const cotizados = reportes.filter((r) => r.estado === 'cotizado');
    console.log('[BACKEND-CLIENTE] Reportes cotizados:', cotizados.length);
    if (cotizados.length > 0) {
      console.log('[BACKEND-CLIENTE] Primer cotizado:', cotizados[0]);
    }

    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('Error al obtener reportes del cliente:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener archivos de un reporte
router.get('/:id/archivos', verifyToken, async (req, res) => {
  try {
    const [archivos] = await pool.query(
      'SELECT * FROM reportes_archivos WHERE reporte_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    return res.json({ success: true, data: archivos });
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar estado de reporte asignado
router.put('/:id/estado', verifyToken, async (req, res) => {
  try {
    const { estado, descripcionTrabajo, precioCotizacion, cerrado_por_cliente_at, revision, recomendaciones, reparacion, recomendaciones_adicionales, materiales_refacciones, trabajo_completado } = req.body;

    console.log('[BACKEND-ESTADO] Datos recibidos:', { estado, descripcionTrabajo, precioCotizacion, reporteId: req.params.id });

    // Construir query dinámicamente según qué datos se envían
    let query = 'UPDATE reportes SET';
    const params = [];
    let setClauses = [];

    if (estado) {
      console.log('[BACKEND-ESTADO] Actualizando estado a:', estado);
      setClauses.push('estado = ?');
      params.push(estado);
    }

    if (descripcionTrabajo) {
      console.log('[BACKEND-ESTADO] Guardando análisis:', descripcionTrabajo);
      setClauses.push('analisis_general = ?');
      params.push(descripcionTrabajo);
    }

    if (precioCotizacion) {
      console.log('[BACKEND-ESTADO] Guardando precio:', precioCotizacion);
      setClauses.push('precio_cotizacion = ?');
      params.push(precioCotizacion);
    }

    if (cerrado_por_cliente_at) {
      console.log('[BACKEND-ESTADO] Marcando como cerrado por cliente');
      setClauses.push('cerrado_por_cliente_at = ?');
      // MySQL no acepta ISO string con T y Z directamente en DATETIME
      const cleanDate = cerrado_por_cliente_at.includes('T')
        ? new Date(cerrado_por_cliente_at)
        : cerrado_por_cliente_at;
      params.push(cleanDate);
    }

    if (revision !== undefined) {
      setClauses.push('revision = ?');
      params.push(revision || null);
    }

    if (recomendaciones !== undefined) {
      setClauses.push('recomendaciones = ?');
      params.push(recomendaciones || null);
    }

    if (reparacion !== undefined) {
      setClauses.push('reparacion = ?');
      params.push(reparacion || null);
    }

    if (recomendaciones_adicionales !== undefined) {
      setClauses.push('recomendaciones_adicionales = ?');
      params.push(recomendaciones_adicionales || null);
    }

    if (materiales_refacciones !== undefined) {
      setClauses.push('materiales_refacciones = ?');
      params.push(materiales_refacciones || null);
    }

    if (trabajo_completado !== undefined) {
      setClauses.push('trabajo_completado = ?');
      params.push(trabajo_completado ? 1 : 0);
    }

    if (req.body.finalizado_por_tecnico_at) {
      setClauses.push('finalizado_por_tecnico_at = ?');
      const finalizadoAt = req.body.finalizado_por_tecnico_at;
      const cleanDate = finalizadoAt.includes('T')
        ? new Date(finalizadoAt)
        : finalizadoAt;
      params.push(cleanDate);
    }

    if (req.body.motivo_cancelacion !== undefined) {
      setClauses.push('motivo_cancelacion = ?');
      params.push(req.body.motivo_cancelacion);
    }

    // Validar que al menos un campo se intente actualizar
    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar al menos un campo para actualizar' });
    }

    query += ' ' + setClauses.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    console.log('[BACKEND-ESTADO] Query:', query);
    console.log('[BACKEND-ESTADO] Params:', params);

    // Ejecutar update
    const [result] = await pool.query(query, params);
    console.log('[BACKEND-ESTADO] Update result:', result);

    // Obtener el reporte actualizado
    const [reporte] = await pool.query('SELECT * FROM reportes WHERE id = ?', [req.params.id]);
    console.log('[BACKEND-ESTADO] Reporte actualizado:', reporte[0]);

    return res.json({ success: true, data: reporte[0] });
  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Guardar archivo de reporte en BD
router.post('/archivos', verifyToken, async (req, res) => {
  try {
    const { reporte_id, tipo_archivo, cloudflare_url, cloudflare_key, nombre_original, tamaño } = req.body;

    console.log('[BACKEND-ARCHIVOS] req.body completo:', req.body);
    console.log('[BACKEND-ARCHIVOS] reporte_id:', reporte_id, 'tipo:', typeof reporte_id);
    console.log('[BACKEND-ARCHIVOS] tipo_archivo:', tipo_archivo);
    console.log('[BACKEND-ARCHIVOS] cloudflare_url:', cloudflare_url);

    // Validar que reporte_id sea un número válido (puede ser 0)
    if (reporte_id === null || reporte_id === undefined || !tipo_archivo || !cloudflare_url) {
      console.log('[BACKEND-ARCHIVOS] VALIDACIÓN FALLIDA - campos faltantes');
      return res.status(400).json({
        success: false,
        error: `Faltan campos requeridos. reporte_id: ${reporte_id}, tipo_archivo: ${tipo_archivo}, cloudflare_url: ${!!cloudflare_url}`
      });
    }

    // Insertar archivo en BD
    const [result] = await pool.query(
      'INSERT INTO reportes_archivos (reporte_id, tipo_archivo, cloudflare_url, cloudflare_key, nombre_original, tamaño) VALUES (?, ?, ?, ?, ?, ?)',
      [reporte_id, tipo_archivo, cloudflare_url, cloudflare_key, nombre_original, tamaño || null]
    );

    console.log('[BACKEND-ARCHIVOS] Archivo insertado con id:', result.insertId);

    // Obtener el archivo insertado
    const [archivos] = await pool.query(
      'SELECT * FROM reportes_archivos WHERE id = ?',
      [result.insertId]
    );

    return res.json({ success: true, data: archivos[0] });
  } catch (error) {
    console.error('[BACKEND-ARCHIVOS] Error al guardar archivo:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Guardar encuesta de satisfacción
router.post('/encuestas/guardar', verifyToken, async (req, res) => {
  try {
    const {
      reporte_id,
      cliente_email,
      cliente_nombre,
      empleado_email,
      empleado_nombre,
      empresa,
      trato_equipo,
      equipo_tecnico,
      personal_administrativo,
      rapidez,
      costo_calidad,
      recomendacion,
      satisfaccion
    } = req.body;

    console.log('[BACKEND-ENCUESTA] Guardando encuesta para reporte:', reporte_id);

    if (!reporte_id || !cliente_email) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos' });
    }

    // Insertar encuesta
    const [result] = await pool.query(
      `INSERT INTO encuestas_satisfaccion 
       (reporte_id, cliente_email, cliente_nombre, empleado_email, empleado_nombre, empresa, 
        trato_equipo, equipo_tecnico, personal_administrativo, rapidez, costo_calidad, 
        satisfaccion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reporte_id,
        cliente_email,
        cliente_nombre || null,
        empleado_email || null,
        empleado_nombre || null,
        empresa || null,
        trato_equipo || null,
        equipo_tecnico || null,
        personal_administrativo || null,
        rapidez || null,
        costo_calidad || null,
        satisfaccion || null
      ]
    );

    console.log('[BACKEND-ENCUESTA] Encuesta guardada con ID:', result.insertId);

    // Actualizar el estado del reporte a 'cerrado_por_cliente'
    await pool.query(
      `UPDATE reportes SET estado = 'cerrado_por_cliente' WHERE id = ?`,
      [reporte_id]
    );

    console.log('[BACKEND-ENCUESTA] Estado del reporte actualizado a cerrado_por_cliente');

    // Obtener la encuesta insertada
    const [encuesta] = await pool.query(
      'SELECT * FROM encuestas_satisfaccion WHERE id = ?',
      [result.insertId]
    );

    return res.json({ success: true, data: encuesta[0] });
  } catch (error) {
    console.error('[BACKEND-ENCUESTA] Error al guardar encuesta:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener todas las encuestas
router.get('/encuestas/todas', verifyToken, async (req, res) => {
  try {
    console.log('[BACKEND-ENCUESTAS] Obteniendo todas las encuestas');

    const [encuestas] = await pool.query(`
      SELECT 
        e.*,
        r.titulo as reporte_titulo
      FROM encuestas_satisfaccion e
      LEFT JOIN reportes r ON e.reporte_id = r.id
      ORDER BY e.created_at DESC
    `);

    console.log('[BACKEND-ENCUESTAS] Encuestas obtenidas:', encuestas.length);
    return res.json({ success: true, data: encuestas });
  } catch (error) {
    console.error('[BACKEND-ENCUESTAS] Error al obtener encuestas:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener encuestas de un cliente específico
router.get('/encuestas/cliente/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-ENCUESTAS-CLIENTE] Obteniendo encuestas para:', email);

    const [encuestas] = await pool.query(`
      SELECT 
        e.*,
        r.titulo as reporte_titulo
      FROM encuestas_satisfaccion e
      LEFT JOIN reportes r ON e.reporte_id = r.id
      WHERE e.cliente_email = ?
      ORDER BY e.created_at DESC
    `, [email]);

    console.log('[BACKEND-ENCUESTAS-CLIENTE] Encuestas obtenidas:', encuestas.length);
    return res.json({ success: true, data: encuestas });
  } catch (error) {
    console.error('[BACKEND-ENCUESTAS-CLIENTE] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener encuestas por reporte ID
router.get('/encuestas/reporte/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[BACKEND-ENCUESTAS-REPORTE] Obteniendo encuestas para reporte:', id);

    const [encuestas] = await pool.query(`
      SELECT *
      FROM encuestas_satisfaccion
      WHERE reporte_id = ?
      ORDER BY created_at DESC
    `, [id]);

    console.log('[BACKEND-ENCUESTAS-REPORTE] Encuestas obtenidas:', encuestas.length);
    return res.json({ success: true, data: encuestas });
  } catch (error) {
    console.error('[BACKEND-ENCUESTAS-REPORTE] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener encuestas de un empleado específico
router.get('/encuestas/empleado/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-ENCUESTAS-EMPLEADO] Obteniendo encuestas para:', email);

    const [encuestas] = await pool.query(`
      SELECT 
        e.*,
        r.titulo as reporte_titulo
      FROM encuestas_satisfaccion e
      LEFT JOIN reportes r ON e.reporte_id = r.id
      WHERE e.empleado_email = ?
      ORDER BY e.created_at DESC
    `, [email]);

    console.log('[BACKEND-ENCUESTAS-EMPLEADO] Encuestas obtenidas:', encuestas.length);
    return res.json({ success: true, data: encuestas });
  } catch (error) {
    console.error('[BACKEND-ENCUESTAS-EMPLEADO] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============ NUEVOS ENDPOINTS PARA MIGRACIÓN SUPABASE ============

// GET reportes por usuario (email del usuario)
router.get('/por-usuario/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-REPORTES] Obteniendo reportes para usuario:', email);

    const [reportes] = await pool.query(`
      SELECT *
      FROM reportes
      WHERE usuario_email = ?
      ORDER BY created_at DESC
    `, [email]);

    console.log('[BACKEND-REPORTES] Reportes obtenidos:', reportes.length);
    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('[BACKEND-REPORTES] Error al obtener reportes por usuario:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET todos los reportes (admin)
router.get('/todos/admin/list', verifyToken, async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    console.log('[BACKEND-REPORTES] Obteniendo TODOS los reportes (admin)');

    const [reportes] = await pool.query(`
      SELECT *
      FROM reportes
      ORDER BY created_at DESC
    `);

    console.log('[BACKEND-REPORTES] Total de reportes:', reportes.length);
    return res.json({ success: true, data: reportes });
  } catch (error) {
    console.error('[BACKEND-REPORTES] Error al obtener todos los reportes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Las rutas duplicadas de /estado y /asignar han sido eliminadas y unificadas arriba.


// GET reportes asignados a un empleado
router.get('/asignados/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-REPORTES] Obteniendo reportes asignados a:', email);

    const [reportes] = await pool.query(`
      SELECT *
      FROM reportes
      WHERE empleado_asignado_email = ?
      ORDER BY created_at DESC
    `, [email]);

    console.log('[BACKEND-REPORTES] Reportes asignados obtenidos:', reportes.length);
    return res.json({ success: true, data: reportes || [] });
  } catch (error) {
    console.error('[BACKEND-REPORTES] Error al obtener reportes asignados:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ============ COTIZACIONES ============

// POST guardar cotización
router.post('/:id/cotizacion', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { empleado_nombre, analisis_general, precio_cotizacion } = req.body;

    if (!id || !empleado_nombre || !analisis_general || precio_cotizacion === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros: id, empleado_nombre, analisis_general, precio_cotizacion'
      });
    }

    console.log(`[BACKEND-COTIZACION] Guardando cotización para reporte ${id}`);

    const [result] = await pool.query(
      'INSERT INTO cotizaciones (reporte_id, empleado_nombre, analisis_general, precio_cotizacion, estado) VALUES (?, ?, ?, ?, ?)',
      [id, empleado_nombre, analisis_general, precio_cotizacion, 'pendiente']
    );

    const [cotizacion] = await pool.query(
      'SELECT * FROM cotizaciones WHERE id = ?',
      [result.insertId]
    );

    console.log(`[BACKEND-COTIZACION] Cotización guardada: ${result.insertId}`);
    return res.json({ success: true, data: cotizacion[0] });
  } catch (error) {
    console.error('[BACKEND-COTIZACION] Error al guardar:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET cotizaciones de un cliente
router.get('/cotizaciones/cliente/:email', verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    console.log('[BACKEND-COTIZACION] Obteniendo cotizaciones del cliente:', email);

    const [cotizaciones] = await pool.query(`
      SELECT 
        c.*,
        r.titulo as reporte_titulo,
        r.usuario_email,
        r.usuario_nombre,
        r.equipo_descripcion,
        r.comentario,
        r.prioridad,
        r.empresa,
        r.sucursal
      FROM cotizaciones c
      LEFT JOIN reportes r ON c.reporte_id = r.id
      WHERE r.usuario_email = ?
      ORDER BY c.created_at DESC
    `, [email]);

    console.log('[BACKEND-COTIZACION] Cotizaciones obtenidas:', cotizaciones.length);
    return res.json({ success: true, data: cotizaciones || [] });
  } catch (error) {
    console.error('[BACKEND-COTIZACION] Error al obtener cotizaciones:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
