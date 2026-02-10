/**
 * Mapeo de estados de base de datos a nombres visuales para el cliente
 * Sin modificar el backend, solo cambiamos lo que se muestra en la UI
 */

// Mapeo detallado para cubrir todas las variaciones posibles
export const estadoMapeo: Record<string, string> = {
  // Estados iniciales
  'pendiente': 'En Espera',
  'en espera': 'En Espera',
  'en_espera': 'En Espera',

  // Flujo de asignación
  'asignado': 'Asignado',

  // Flujo de cotización
  'en_cotizacion': 'En Cotización',
  'en cotizacion': 'En Cotización',
  'cotizado': 'En Cotización',
  'en_espera_confirmacion': 'Pendiente de Confirmación',
  'en espera confirmacion': 'Pendiente de Confirmación',
  'cotizacionnueva': 'Cotización Nueva',

  // Flujo de ejecución
  'en_proceso': 'En Proceso',
  'en proceso': 'En Proceso',
  'en_ejecucion': 'En Ejecución',
  'en ejecucion': 'En Ejecución',
  'aceptado_por_cliente': 'En Ejecución',

  // Flujo de finalización
  'terminado': 'Por Revisar',
  'finalizado': 'Por Revisar',
  'por_revisar': 'Por Revisar',
  'finalizado_por_tecnico': 'Por Revisar',
  'listo_para_encuesta': 'Por Revisar',

  // Estados finales
  'cerrado': 'Cerrado',
  'resuelto': 'Cerrado',
  'cerrado_por_cliente': 'Cerrado',
  'encuesta_satisfaccion': 'Cerrado',
  'rechazado': 'Rechazado',
};

/**
 * Obtiene el nombre visual del estado
 */
export const obtenerNombreEstado = (estado: any): string => {
  if (!estado) return 'En Espera'; // Por defecto
  const stringEstado = String(estado).toLowerCase().trim();
  return estadoMapeo[stringEstado] || stringEstado.replace(/_/g, ' ') || 'Desconocido';
};

/**
 * Obtiene el color del estado basado en el nombre visual
 */
export const obtenerColorEstado = (estado: string): string => {
  const nombreVisual = obtenerNombreEstado(estado);

  const colores: Record<string, string> = {
    'En Espera': '#f59e0b',      // Amarillo/Naranja
    'Asignado': '#06b6d4',       // Cyan
    'En Cotización': '#ec4899',  // Rosa
    'Cotización Nueva': '#f59e0b', // Naranja
    'Pendiente de Confirmación': '#f59e0b', // Naranja (como En Espera pero con otro ícono)
    'En Ejecución': '#10b981',   // Verde
    'Por Revisar': '#8b5cf6',    // Violeta
    'Cerrado': '#6366f1',        // Indigo
    'Rechazado': '#ef4444',      // Rojo
  };

  return colores[nombreVisual] || '#94a3b8'; // Gris por defecto
};

/**
 * Obtiene el ícono del estado
 */
export const obtenerIconoEstado = (estado: string): string => {
  const nombreVisual = obtenerNombreEstado(estado);

  const iconos: Record<string, string> = {
    'En Espera': 'hourglass-outline',
    'Asignado': 'person-add-outline',
    'En Cotización': 'calculator-outline',
    'Cotización Nueva': 'pricetag-outline',
    'Pendiente de Confirmación': 'time-outline',
    'En Ejecución': 'hammer-outline',
    'Por Revisar': 'checkbox-outline',
    'Cerrado': 'checkmark-done-outline',
    'Rechazado': 'close-circle-outline',
  };

  return iconos[nombreVisual] || 'help-outline';
};
