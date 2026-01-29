/**
 * Mapeo de estados de base de datos a nombres visuales para el cliente
 * Sin modificar el backend, solo cambiamos lo que se muestra en la UI
 */

export const estadoMapeo: Record<string, string> = {
  // Estado inicial - Cliente levanta reporte
  'pendiente': 'En espera',
  
  // Admin asigna técnico
  'en_proceso': 'En asignando',
  
  // Técnico envía análisis
  'cotizado': 'En cotización',
  
  // Cliente acepta la cotización
  'aceptado_por_cliente': 'En ejecución',
  
  // Esperando confirmación del cliente
  'finalizado_por_tecnico': 'En espera',
  
  // Cliente confirma, técnico ejecuta
  'cerrado_por_cliente': 'En ejecución',
  'listo_para_encuesta': 'En ejecución',
  
  // Terminado/Cerrado
  'encuesta_satisfaccion': 'Cerrado',
  'terminado': 'Cerrado',
  'finalizado': 'Cerrado',
  'en_espera': 'En espera'
};

/**
 * Obtiene el nombre visual del estado
 */
export const obtenerNombreEstado = (estado: string): string => {
  return estadoMapeo[estado?.toLowerCase()] || estado || 'Desconocido';
};

/**
 * Obtiene el color del estado basado en el nombre visual
 */
export const obtenerColorEstado = (estado: string): string => {
  const nombreVisual = obtenerNombreEstado(estado);
  
  const colores: Record<string, string> = {
    'En espera': '#f59e0b',      // Amarillo/Naranja
    'En asignando': '#06b6d4',   // Cyan
    'En cotización': '#ec4899',  // Rosa
    'En ejecución': '#10b981',   // Verde
    'Cerrado': '#6366f1',        // Indigo
  };
  
  return colores[nombreVisual] || '#94a3b8'; // Gris por defecto
};

/**
 * Obtiene el ícono del estado
 */
export const obtenerIconoEstado = (estado: string): string => {
  const nombreVisual = obtenerNombreEstado(estado);
  
  const iconos: Record<string, string> = {
    'En espera': 'hourglass-outline',
    'En asignando': 'person-add-outline',
    'En cotización': 'calculator-outline',
    'En ejecución': 'hammer-outline',
    'Cerrado': 'checkmark-done-outline',
  };
  
  return iconos[nombreVisual] || 'help-outline';
};
