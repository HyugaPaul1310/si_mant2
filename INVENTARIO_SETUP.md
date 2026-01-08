# SISTEMA DE INVENTARIO DE HERRAMIENTAS - GUÍA DE CONFIGURACIÓN

## 📋 RESUMEN DE CAMBIOS

Se ha implementado un sistema completo de **control de inventario de herramientas** para el panel administrativo. El sistema permite:

- Gestionar herramientas disponibles
- Asignar herramientas a empleados
- Registrar devoluciones y pérdidas
- Ver el inventario de cada empleado
- Registrar observaciones por herramienta

---

## 🔧 PASO 1: CREAR LAS TABLAS EN SUPABASE

### Accede a Supabase:
1. Ve a https://supabase.com y accede con tu cuenta
2. Abre tu proyecto
3. Ve a **SQL Editor** (o **Database** → **SQL Editor**)

### Copia y ejecuta el siguiente SQL:

```sql
-- ====================================
-- TABLAS DE INVENTARIO DE HERRAMIENTAS
-- ====================================

-- TABLA 1: Herramientas disponibles
CREATE TABLE IF NOT EXISTS inventario_herramientas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  categoria VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 2: Asignaciones de herramientas a empleados
CREATE TABLE IF NOT EXISTS inventario_asignaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  herramienta_id UUID NOT NULL REFERENCES inventario_herramientas(id) ON DELETE CASCADE,
  herramienta_nombre VARCHAR(255) NOT NULL,
  empleado_email VARCHAR(255) NOT NULL,
  empleado_nombre VARCHAR(255),
  cantidad INT DEFAULT 1,
  estado VARCHAR(50) DEFAULT 'asignada',
  observaciones TEXT,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion TIMESTAMP WITH TIME ZONE,
  admin_email VARCHAR(255),
  admin_nombre VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_herramienta FOREIGN KEY (herramienta_id) REFERENCES inventario_herramientas(id)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_empleado ON inventario_asignaciones(empleado_email);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_herramienta ON inventario_asignaciones(herramienta_id);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_estado ON inventario_asignaciones(estado);
CREATE INDEX IF NOT EXISTS idx_inventario_asignaciones_fecha ON inventario_asignaciones(fecha_asignacion);
```

---

## 🛠️ PASO 2: INSERTAR HERRAMIENTAS INICIALES (OPCIONAL)

Si deseas agregar herramientas predeterminadas, ejecuta esto en SQL Editor:

```sql
INSERT INTO inventario_herramientas (nombre, descripcion, categoria, estado) VALUES
('Martillo', 'Martillo clavador estándar', 'Herramientas de Mano', 'disponible'),
('Destornillador Phillips', 'Destornillador cabeza Phillips', 'Herramientas de Mano', 'disponible'),
('Destornillador Plano', 'Destornillador cabeza plana', 'Herramientas de Mano', 'disponible'),
('Llave Inglesa', 'Llave inglesa ajustable', 'Herramientas de Mano', 'disponible'),
('Taladro Eléctrico', 'Taladro a batería 18V', 'Herramientas Eléctricas', 'disponible'),
('Sierra Circular', 'Sierra circular para madera', 'Herramientas Eléctricas', 'disponible'),
('Nivel Láser', 'Nivel láser digital', 'Instrumentos de Medición', 'disponible'),
('Cinta Métrica', 'Cinta métrica 5 metros', 'Instrumentos de Medición', 'disponible'),
('Guantes de Seguridad', 'Guantes resistentes al corte', 'Seguridad', 'disponible'),
('Gafas de Seguridad', 'Gafas protectoras UV', 'Seguridad', 'disponible');
```

---

## 📱 PASO 3: VERIFICAR LA IMPLEMENTACIÓN EN LA APP

### Archivos creados/modificados:

1. **`lib/inventario.ts`**
   - Funciones para crear y gestionar herramientas
   - Funciones para asignar, editar y eliminar asignaciones
   - Funciones para obtener inventarios

2. **`app/admin.tsx`**
   - Nuevo tab "Inventario" en la navegación
   - Modal de lista de empleados con inventario
   - Modal detalle de inventario por empleado
   - Modal para asignar nuevas herramientas

3. **`CREATE_INVENTARIO_TABLE.sql`**
   - Archivo SQL con la estructura completa

---

## 🎯 FLUJO DE USO

### 1. **Ver Inventario por Empleado**
   - Ve al tab "Inventario" en el panel admin
   - Se muestran todos los empleados que tienen herramientas asignadas
   - Haz clic en un empleado para ver su inventario detallado

### 2. **Asignar Nueva Herramienta**
   - Abre el modal de inventario de un empleado
   - Haz clic en "+ Asignar Herramienta"
   - Selecciona la herramienta, cantidad y añade observaciones si necesario
   - Confirma la asignación

### 3. **Marcar Devolución**
   - En el inventario del empleado, ve cada herramienta asignada
   - Haz clic en "Marcar Devuelta" para registrar la devolución
   - Se guardará automáticamente la fecha de devolución

### 4. **Registrar Pérdida**
   - Si una herramienta se pierde, haz clic en "Marcar Perdida"
   - El sistema registrará que la herramienta fue perdida

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `inventario_herramientas`
```
- id: UUID (primaria)
- nombre: Nombre de la herramienta
- descripcion: Descripción opcional
- categoria: Categoría (ej: Herramientas de Mano, Eléctricas, etc)
- estado: disponible | descontinuado
- created_at: Fecha de creación
- updated_at: Fecha de actualización
```

### Tabla: `inventario_asignaciones`
```
- id: UUID (primaria)
- herramienta_id: Referencia a inventario_herramientas
- herramienta_nombre: Nombre de la herramienta (denormalizado)
- empleado_email: Email del empleado
- empleado_nombre: Nombre del empleado
- cantidad: Cantidad asignada
- estado: asignada | devuelta | perdida
- observaciones: Notas adicionales
- fecha_asignacion: Cuándo se asignó
- fecha_devolucion: Cuándo se devolvió (null si aún no)
- admin_email: Email del admin que hizo la asignación
- admin_nombre: Nombre del admin
- created_at: Fecha de creación del registro
- updated_at: Fecha de última actualización
```

---

## 🎨 INTERFAZ DE USUARIO

### Tab de Inventario
- **Listado de empleados** con inventario activo
- Cada empleado muestra nombre y email
- Icono de ojo para abrir detalles

### Modal de Inventario por Empleado
- **Encabezado** con nombre del empleado y icono
- **Lista de herramientas** asignadas
- Para cada herramienta:
  - Nombre y cantidad
  - Estado (Asignada, Devuelta, Perdida)
  - Fecha de asignación
  - Observaciones (si las hay)
  - Botones para marcar como devuelta o perdida
- **Botón "Asignar Herramienta"** para agregar nuevas

### Modal de Asignar Herramienta
- Selector de herramientas disponibles
- Campo de cantidad (por defecto 1)
- Campo de observaciones
- Botones de Cancelar/Asignar

---

## 🔐 SEGURIDAD

- Solo admins pueden acceder al sistema de inventario
- Se registra quién asignó cada herramienta
- Las asignaciones se vinculan a empleados mediante email
- Los cambios se registran con timestamps

---

## 📝 FUNCIONES DISPONIBLES EN `lib/inventario.ts`

```typescript
// Herramientas
crearHerramienta(nombre, descripcion?, categoria?)
obtenerHerramientasDisponibles()

// Asignaciones
asignarHerramientaAEmpleado(...)
obtenerInventarioEmpleado(empleadoEmail)
obtenerTodasLasAsignaciones()
obtenerAsignacionesActivasEmpleado(empleadoEmail)
marcarHerramientaComoDevuelta(asignacionId, observaciones?)
marcarHerramientaComoPerdida(asignacionId, observaciones?)
editarCantidadAsignacion(asignacionId, cantidad)
eliminarAsignacion(asignacionId)
obtenerResumenInventario()
```

---

## CHECKLIST DE CONFIGURACIÓN

- [ ] Ejecuté el SQL en Supabase
- [ ] (Opcional) Inserté herramientas iniciales
- [ ] Recargué la app en Expo
- [ ] Veo el nuevo tab "Inventario" en el admin
- [ ] Puedo ver la lista de empleados
- [ ] Puedo abrir el inventario de un empleado
- [ ] Puedo asignar una herramienta
- [ ] Puedo marcar como devuelta/perdida

---

## 🆘 TROUBLESHOOTING

### "No hay inventario asignado"
- Es normal si es la primera vez
- Ve a asignar herramientas a un empleado
- Primero crea herramientas en la tabla de Supabase

### "Error al cargar inventario"
- Verifica que las tablas se crearon correctamente
- Revisa la consola del navegador (F12) para más detalles
- Asegúrate de tener permisos en Supabase

### "No aparece el tab Inventario"
- Recarga la página completamente (Ctrl+F5)
- Revisa que el archivo `lib/inventario.ts` esté en la carpeta

---

¡El sistema está listo para usar! 🎉
