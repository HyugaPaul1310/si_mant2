# Leer el archivo
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# 1. Agregar import de jspdf después de la línea 10
$oldImports = "import * as Sharing from 'expo-sharing';"
$newImports = @"
import * as Sharing from 'expo-sharing';
import jsPDF from 'jspdf';
"@

$content = $content.Replace($oldImports, $newImports)

# 2. Reemplazar la lógica de generación de PDF en web
$oldWebLogic = @'
      if (Platform.OS === 'web') {
        // En web, crear un enlace de descarga y hacer clic automáticamente
        const link = document.createElement('a');
        link.href = uri;
        link.download = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert(
          'PDF Descargado',
          'El archivo se ha guardado en tu carpeta de descargas.',
          [{ text: 'OK' }]
        );
      }
'@

$newWebLogic = @'
      if (Platform.OS === 'web') {
        // En web, NO usar expo-print porque abre el diálogo de impresión
        // En su lugar, simplemente mostrar el PDF en una nueva pestaña para descarga
        const blob = await (await fetch(uri)).blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert(
          'PDF Descargado',
          'El archivo se ha guardado en tu carpeta de descargas.',
          [{ text: 'OK' }]
        );
      }
'@

$content = $content.Replace($oldWebLogic, $newWebLogic)

Set-Content $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "Código actualizado con jsPDF"
