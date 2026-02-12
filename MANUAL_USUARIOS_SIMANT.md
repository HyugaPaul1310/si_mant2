# Manual de Usuario - Simant

## 1. Objetivo
Este manual describe las funciones disponibles por rol dentro de la app Simant:
- Administrador
- Empleado
- Cliente

---

## 2. Acceso al sistema
1. Abrir la app Simant.
2. Iniciar sesión con correo y contraseña.
3. La app redirige automáticamente al panel según el rol:
   - `admin` → Panel de Administrador
   - `empleado` → Panel de Empleado
   - `cliente` → Panel de Cliente

Funciones comunes en todos los roles:
- Cerrar sesión
- Cambiar contraseña

---

## 3. Panel Administrador

### 3.1 Vista general
El administrador tiene control operativo completo: reportes, usuarios, empresas, tareas, encuestas, inventario y cotizaciones.

### 3.2 Funciones principales
- **Historial de Reportes**
  - Ver seguimiento de reportes.
  - Revisar estados y detalle de cada caso.

- **Reportes Finalizados (Empleado)**
  - Confirmar reportes marcados como finalizados por técnicos.

- **Cotizaciones Pendientes**
  - Ver reportes con análisis listo para cotizar.
  - Cargar/ajustar cotizaciones y documentos relacionados.

- **Reportes Terminados**
  - Consultar reportes completados.

- **Gestión de Usuarios**
  - Ver usuarios.
  - Editar datos.
  - Cambiar rol (`cliente`, `empleado`, `admin`).
  - Activar/Inactivar cuentas.

- **Gestión de Empresas**
  - Alta/edición de empresas.
  - Administración de sucursales.

- **Generar Tareas**
  - Crear tareas para empleados.

- **Historial de Tareas**
  - Consultar tareas creadas y su estado.

- **Reportes Rechazados**
  - Ver reportes cancelados/rechazados y su motivo.

- **Generar Correo Electrónico**
  - Redactar y enviar correos operativos.

### 3.3 Pestañas operativas
- **Inicio**: KPIs y accesos rápidos.
- **Reportes**: gestión central de casos.
- **Encuestas**: revisión de satisfacción de clientes.
- **Tareas**: control de asignaciones.
- **Inventario**: herramientas y asignaciones.
- **Usuarios**: permisos y estados.

---

## 4. Panel Empleado

### 4.1 Vista general
El empleado trabaja sobre tareas y reportes asignados, registra análisis y avance técnico.

### 4.2 Funciones principales
- **Reportes**
  - Ver reportes asignados.
  - Consultar detalles del caso.
  - Ver archivos adjuntos (fotos/videos/documentos).
  - Registrar análisis/cotización.
  - Actualizar estado del reporte según flujo operativo.

- **Tareas**
  - Ver tareas pendientes asignadas.
  - Revisar detalle.
  - Marcar tareas como completadas.

- **Historial de Tareas**
  - Consultar tareas ya completadas.

- **Inventario**
  - Ver herramientas asignadas al empleado.

- **Cambio de contraseña**
  - Actualizar contraseña desde el botón de llave en el encabezado.

### 4.3 Indicadores visibles
- Tareas activas
- Reportes activos
- Tareas terminadas
- Herramientas asignadas

---

## 5. Panel Cliente

### 5.1 Vista general
El cliente crea reportes, da seguimiento, consulta cotizaciones y confirma cierre de servicios.

### 5.2 Funciones principales
- **Generar reporte**
  - Crear nuevo reporte de servicio.
  - Adjuntar evidencia (fotos/videos/documentos según flujo).

- **Ver mis reportes**
  - Consultar historial personal de reportes.
  - Abrir detalle y evidencias.

- **Cotizaciones**
  - Revisar cotizaciones de sus reportes.
  - Abrir detalle de cotización.
  - Aceptar o rechazar (según estado del caso).

- **Seguimiento**
  - Ver estado actualizado de casos activos.

- **Contactar soporte directo**
  - Abrir contacto de soporte (WhatsApp/canal definido).

- **Encuesta de satisfacción**
  - Responder encuesta al cierre del servicio (cuando aplique).

- **Cambio de contraseña**
  - Actualización de contraseña desde su panel.

---

## 6. Flujo de reportes: 3 casos de cotización

### Caso 1: Cliente rechaza 2 veces (termina como rechazado)
1. El flujo es normal hasta que el cliente recibe la primera cotización.
2. El cliente rechaza la cotización (primer rechazo).
3. El reporte regresa al administrador para volver a cotizar.
4. El administrador genera una segunda cotización con nuevo precio.
5. El cliente visualiza la nueva cotización.
6. Si el cliente vuelve a rechazar (segundo y último rechazo), el reporte pasa a **Terminado (Rechazado)**.

### Caso 2: Cliente acepta la primera cotización
1. El flujo es normal hasta la primera cotización.
2. El cliente acepta la cotización.
3. El reporte pasa a **Fase 2**.
4. El empleado completa la respuesta técnica de Fase 2.
5. El reporte llega al módulo **Reportes Finalizados (Empleado)** para validación del administrador.
6. El administrador acepta el reporte finalizado.
7. El cliente lo ve en **Reportes Terminados** y puede responder la encuesta.

### Caso 3: Cliente rechaza la primera y acepta la segunda
1. El flujo inicia igual que el Caso 1: el cliente rechaza la primera cotización.
2. El reporte vuelve al administrador para recotización.
3. El administrador emite segunda cotización con nuevo valor.
4. En esta segunda oportunidad, el cliente acepta.
5. Desde ahí continúa el flujo normal del Caso 2:
  - pasa a **Fase 2**,
  - empleado responde Fase 2,
  - admin valida en **Reportes Finalizados (Empleado)**,
  - cliente recibe en **Reportes Terminados** y contesta encuesta.

---

## 7. Buenas prácticas
- Mantener contraseñas seguras (mínimo 6 caracteres).
- Adjuntar evidencia clara en reportes.
- Evitar cambios de estado sin documentar comentarios/análisis.
- Validar empresa/sucursal correcta antes de crear reporte.
- Revisar tareas diariamente para evitar atrasos.

---

## 8. Soporte básico
Si ocurre un problema:
1. Cerrar sesión e iniciar nuevamente.
2. Verificar conexión a internet.
3. Confirmar que el usuario tenga rol correcto.
4. Si persiste, escalar con administrador del sistema.

---

## 9. Control de versión del manual
- Documento: `MANUAL_USUARIOS_SIMANT.md`
- Actualizar cada vez que se agregue/quite una función por rol.
