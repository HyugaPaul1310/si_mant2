// 🔍 GUÍA DE DEBUG - Cotizaciones no aparecen en App Móvil
// 
// PASOS PARA DEBUGGEAR:
//
// 1. REVISAR LOGS EN CONSOLA DE EXPO
//    Abre la app y presiona "Cotizaciones"
//    En la consola deberías ver:
//    
//    [CLIENTE-PANEL] Cargando cotizaciones para email: usuario@email.com
//    [COTIZACIONES] Iniciando obtenerCotizacionesCliente con: { empresaId: undefined, userEmail: 'usuario@email.com' }
//    [COTIZACIONES] Total de cotizaciones en BD: X
//    [COTIZACIONES] Filtrando por usuario: usuario@email.com
//    [COTIZACIONES] Cotizaciones después de filtro por usuario: Y
//
// 2. PROBLEMAS POSIBLES Y CÓMO DIAGNOSTICARLOS:
//
//    SI VES: "Total de cotizaciones en BD: 0"
//       → El problema es que NO HAY cotizaciones en Supabase
//       → Solución: Revisa la tabla 'cotizaciones' en Supabase
//       → ¿Las cotizaciones se están guardando? Verifica empleado-panel.tsx línea 263
//
//    SI VES: "Total de cotizaciones en BD: 5" pero "Cotizaciones después de filtro por usuario: 0"
//       → El problema es que el email NO COINCIDE
//       → Solución: Compara el email en el log con el de la BD
//       → Puede haber espacios en blanco o mayúsculas diferentes
//
//    SI VES: "Cotizaciones después de filtro por usuario: 2" pero no aparecen en pantalla
//       → El problema es en el renderizado del componente
//       → Revisa: cliente-panel.tsx línea 1074 en adelante
//       → Verifica que cotizaciones.length > 0
//
// 3. OTROS CHECKS:
//
//    ✓ Verifica que el usuario está logueado (debe haber usuario en AsyncStorage)
//    ✓ Verifica que hay cotizaciones en la BD (tabla 'cotizaciones')
//    ✓ Verifica que esos reportes están asignados al usuario correcto
//    ✓ Verifica RLS policies en Supabase (no deben bloquear lectura)
//
// 4. PRÓXIMO PASO:
//    Una vez que veas los logs, dame el output y podré identificar exactamente dónde está el problema.

console.log('🔍 SCRIPT DE DEBUG CARGADO');
