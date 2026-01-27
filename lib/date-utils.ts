/**
 * Formatea una fecha UTC proveniente de MySQL a la zona horaria local del dispositivo.
 * @param dateStr Cadena de fecha (ISO, UTC o formato MySQL)
 * @returns Cadena formateada legible (ej. "26/1/2026")
 */
export function formatDateToLocal(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'N/A';

    try {
        const date = new Date(dateStr);

        // Si la fecha es inválida
        if (isNaN(date.getTime())) return 'Fecha inválida';

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Error fecha';
    }
}

/**
 * Formatea una fecha con hora incluida.
 */
export function formatDateTimeToLocal(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return 'N/A';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Error fecha';
    }
}
