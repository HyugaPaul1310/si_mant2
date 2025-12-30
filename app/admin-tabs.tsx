// @ts-nocheck
// ARCHIVO DE REFERENCIA - Sistema de Admin con Tabs
// Este archivo muestra la estructura propuesta para reorganizar admin.tsx


/**
 * ESTRUCTURA PROPUESTA PARA ADMIN CON TABS
 * 
 * 1. TAB "INICIO" - Panel principal
 *    - Estadísticas (stats)
 *    - Dos etapas de cierre (finalizados/cerrados)
 *    - Botones de acceso rápido
 * 
 * 2. TAB "REPORTES" - Gestión de reportes
 *    - Historial con filtros avanzados
 *    - Cambiar estados
 *    - Asignar a empleados
 *    - Ver detalles y archivos
 * 
 * 3. TAB "ENCUESTAS" - Gestión de encuestas
 *    - Lista de encuestas realizadas
 *    - Resumen de satisfacción
 *    - Estadísticas de respuestas
 * 
 * 4. TAB "TAREAS" - Gestión de tareas
 *    - Crear nuevas tareas
 *    - Asignar a empleados
 *    - Ver tareas pendientes
 * 
 * 5. TAB "USUARIOS" - Gestión de usuarios
 *    - Lista de usuarios con filtros
 *    - Crear nuevos usuarios
 *    - Editar información
 *    - Cambiar roles y permisos
 */

export const AdminTabsStructure = {
  tabs: [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: 'home-outline',
      component: 'AdminTabInicio',
      description: 'Panel principal'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'document-text-outline',
      component: 'AdminTabReportes',
      description: 'Gestión de reportes'
    },
    {
      id: 'encuestas',
      label: 'Encuestas',
      icon: 'clipboard-outline',
      component: 'AdminTabEncuestas',
      description: 'Estadísticas de satisfacción'
    },
    {
      id: 'tareas',
      label: 'Tareas',
      icon: 'checkmark-circle-outline',
      component: 'AdminTabTareas',
      description: 'Gestión de tareas'
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'people-outline',
      component: 'AdminTabUsuarios',
      description: 'Administración de usuarios'
    }
  ],

  // Estados que se mantienen globales
  globalStates: [
    'usuario', // Usuario logueado
    'showLogout', // Modal de logout
    'showStats', // Mostrar/ocultar estadísticas
  ],

  // Estados que se pueden agrupar por tab
  tabStates: {
    inicio: [
      'reportesFinalizados',
      'reportesCerrados',
      'loadingFinalizados',
      'loadingCerrados',
      'showFinalizadosModal',
      'showCerradosModal'
    ],
    reportes: [
      'reportes',
      'loadingReportes',
      'errorReportes',
      'showHistorialModal',
      'showTerminadosModal',
      'filtrosEstado',
      'filtrosPrioridad',
      'updatingId',
      'selectedReporteDetail',
      'showReporteDetailModal',
      'archivosReporte',
      'cargandoArchivos',
      'showArchivoModal',
      'archivoVisualizando',
      'reporteAAsignar',
      'selectedEmpleadoReporte',
      'showEmpleadoDropdownReporte',
      'showAsignarEmpleadoModal',
      'asignandoReporte',
      'asignarError'
    ],
    encuestas: [
      // Estados para tab de encuestas (a crear)
      'encuestas',
      'loadingEncuestas',
      'filtroEncuestas'
    ],
    tareas: [
      'showTareasModal',
      'empleados',
      'selectedEmpleado',
      'tareasDescripcion',
      'creandoTarea',
      'tareasError',
      'showEmpleadoDropdown',
      'tareasExito'
    ],
    usuarios: [
      'showGestionUsuariosModal',
      'usuarios',
      'loadingUsuarios',
      'filtroCorreo',
      'filtroEstado',
      'showEditUserModal',
      'usuarioEditando',
      'editNombre',
      'editApellido',
      'editEmail',
      'editTelefono',
      'editCiudad',
      'editEmpresa',
      'editRol',
      'editEstado',
      'showRolPicker',
      'showEstadoPicker',
      'showEmpresaPickerEdit',
      'actualizandoUsuario',
      'errorUsuario',
      'exitoUsuario',
      'empresas',
      'empresaSeleccionada',
      'showEmpresaPickerEdit'
    ]
  },

  // Datos compartidos entre tabs
  sharedData: {
    reportes: 'Array de reportes',
    empleados: 'Array de empleados',
    usuarios: 'Array de usuarios',
    empresas: 'Array de empresas'
  }
};

/**
 * VENTAJAS DE ESTA ESTRUCTURA:
 * 
 * ✅ MEJOR UX EN MÓVIL: Una sola pestaña visible a la vez
 * ✅ CÓDIGO ORGANIZADO: Cada tab tiene su lógica separada
 * ✅ FÁCIL DE MANTENER: No hay 50+ estados en un solo lugar
 * ✅ ESCALABLE: Fácil agregar nuevas tabs
 * ✅ PERFORMANCE: Menos renders innecesarios
 * ✅ ACCESIBLE: Interfaz más clara y directa
 * 
 * IMPLEMENTACIÓN PASOS:
 * 
 * 1. Mantener todos los estados en AdminPanelContent
 * 2. Crear componentes separados para cada tab
 * 3. Pasar props necesarias a cada componente
 * 4. Renderizar tab actual según estado 'activeTab'
 * 5. Navigation entre tabs con botones en header
 */
