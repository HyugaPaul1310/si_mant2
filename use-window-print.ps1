# Leer el archivo
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$lines = Get-Content $file -Encoding UTF8

# Encontrar y reemplazar la sección completa de generación de PDF
$newLines = @()
$i = 0
$inPdfSection = $false
$skipCount = 0

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # Detectar inicio de la sección de PDF (línea 596)
    if ($line -match '^\s+// Generar el PDF$' -and $i -ge 595 -and $i -le 597) {
        $inPdfSection = $true
        
        # Agregar el nuevo código
        $newLines += '      // Generar el PDF'
        $newLines += '      if (Platform.OS === ''web'') {'
        $newLines += '        // En web, usar window.print() con configuración especial'
        $newLines += '        const printWindow = window.open('''', ''_blank'');'
        $newLines += '        printWindow.document.write(htmlContent);'
        $newLines += '        printWindow.document.close();'
        $newLines += '        '
        $newLines += '        // Esperar a que cargue y luego imprimir'
        $newLines += '        printWindow.onload = () => {'
        $newLines += '          printWindow.print();'
        $newLines += '          // Cerrar la ventana después de imprimir'
        $newLines += '          setTimeout(() => printWindow.close(), 100);'
        $newLines += '        };'
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += '          ''PDF Generado'','
        $newLines += '          ''Se abrió una ventana para guardar el PDF. Usa "Guardar como PDF" en el diálogo de impresión.'','
        $newLines += '          [{ text: ''OK'' }]'
        $newLines += '        );'
        $newLines += '      } else {'
        $newLines += '        // En móvil, usar expo-print normalmente'
        $newLines += '        const { uri } = await Print.printToFileAsync({ html: htmlContent });'
        $newLines += '        console.log(''[PDF] PDF generado en:'', uri);'
        $newLines += '        '
        $newLines += '        const fileName = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;'
        $newLines += '        const downloadPath = `${FileSystem.documentDirectory}${fileName}`;'
        $newLines += '        '
        $newLines += '        await FileSystem.moveAsync({'
        $newLines += '          from: uri,'
        $newLines += '          to: downloadPath'
        $newLines += '        });'
        $newLines += ''
        $newLines += '        console.log(''[PDF] PDF guardado en:'', downloadPath);'
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += '          ''PDF Descargado'','
        $newLines += '          ''El archivo se ha guardado exitosamente.'','
        $newLines += '          [{ text: ''OK'' }]'
        $newLines += '        );'
        $newLines += '      }'
        
        # Saltar hasta el final del bloque else (línea 634)
        $i = 633
        $inPdfSection = $false
    } else {
        $newLines += $line
    }
    
    $i++
}

# Guardar
$newLines | Set-Content $file -Encoding UTF8

Write-Host "PDF generation updated to use window.print() on web"
