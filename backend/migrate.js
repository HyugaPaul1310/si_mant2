const pool = require('./config/database');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function migrate() {
  try {
    console.log('Iniciando migración de Supabase a MySQL...');

    // 1. Migrar usuarios
    console.log('\n1. Migrando usuarios...');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('*');

    if (errorUsuarios) throw errorUsuarios;

    for (const user of usuarios) {
      await pool.query(
        'INSERT INTO usuarios (id, nombre, apellido, email, contraseña, telefono, fecha_nacimiento, ciudad, empresa, empresa_id, rol, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          user.id,
          user.nombre,
          user.apellido || '',
          user.email,
          user.contraseña,
          user.telefono || '',
          user.fecha_nacimiento || null,
          user.ciudad || '',
          user.empresa || '',
          user.empresa_id || null,
          user.rol || 'cliente',
          user.estado || 'activo',
          new Date(user.created_at)
        ]
      );
    }
    console.log(`✓ ${usuarios.length} usuarios migrados`);

    // 2. Migrar empresas
    console.log('\n2. Migrando empresas...');
    const { data: empresas, error: errorEmpresas } = await supabase
      .from('empresas')
      .select('*');

    if (errorEmpresas) throw errorEmpresas;

    for (const empresa of empresas) {
      await pool.query(
        'INSERT INTO empresas (id, nombre, ciudad, telefono, email, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          empresa.id,
          empresa.nombre,
          empresa.ciudad || '',
          empresa.telefono || '',
          empresa.email || '',
          empresa.estado || 'activo',
          new Date(empresa.created_at)
        ]
      );
    }
    console.log(`✓ ${empresas.length} empresas migradas`);

    // 3. Migrar reportes
    console.log('\n3. Migrando reportes...');
    const { data: reportes, error: errorReportes } = await supabase
      .from('reportes')
      .select('*');

    if (errorReportes) throw errorReportes;

    for (const reporte of reportes) {
      await pool.query(
        'INSERT INTO reportes (id, titulo, descripcion, estado, prioridad, usuario_id, empresa_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          reporte.id,
          reporte.titulo,
          reporte.descripcion || '',
          reporte.estado || 'pendiente',
          reporte.prioridad || 'media',
          reporte.usuario_id,
          reporte.empresa_id,
          new Date(reporte.created_at)
        ]
      );
    }
    console.log(`✓ ${reportes.length} reportes migrados`);

    // 4. Migrar tareas
    console.log('\n4. Migrando tareas...');
    const { data: tareas, error: errorTareas } = await supabase
      .from('tareas')
      .select('*');

    if (errorTareas) throw errorTareas;

    for (const tarea of tareas) {
      await pool.query(
        'INSERT INTO tareas (id, titulo, descripcion, usuario_id, creada_por, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          tarea.id,
          tarea.titulo,
          tarea.descripcion || '',
          tarea.usuario_id,
          tarea.creada_por || null,
          tarea.estado || 'pendiente',
          new Date(tarea.created_at)
        ]
      );
    }
    console.log(`✓ ${tareas.length} tareas migradas`);

    // 5. Migrar herramientas
    console.log('\n5. Migrando herramientas...');
    const { data: herramientas, error: errorHerramientas } = await supabase
      .from('inventario_herramientas')
      .select('*');

    if (errorHerramientas) throw errorHerramientas;

    for (const herramienta of herramientas) {
      await pool.query(
        'INSERT INTO inventario_herramientas (id, nombre, descripcion, estado, created_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          herramienta.id,
          herramienta.nombre,
          herramienta.descripcion || '',
          herramienta.estado || 'disponible',
          new Date(herramienta.created_at)
        ]
      );
    }
    console.log(`✓ ${herramientas.length} herramientas migradas`);

    // 6. Migrar asignaciones de herramientas
    console.log('\n6. Migrando asignaciones de herramientas...');
    const { data: asignaciones, error: errorAsignaciones } = await supabase
      .from('inventario_asignaciones')
      .select('*');

    if (errorAsignaciones) throw errorAsignaciones;

    for (const asignacion of asignaciones) {
      await pool.query(
        'INSERT INTO inventario_asignaciones (id, usuario_id, herramienta_id, estado, created_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()',
        [
          asignacion.id,
          asignacion.usuario_id,
          asignacion.herramienta_id,
          asignacion.estado || 'asignada',
          new Date(asignacion.created_at)
        ]
      );
    }
    console.log(`✓ ${asignaciones.length} asignaciones migradas`);

    console.log('\n✓ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();
