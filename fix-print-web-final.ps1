# Leer el archivo
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$lines = Get-Content $file -Encoding UTF8

# Crear nuevo contenido
$newLines = @()
$i = 0

while ($i -lt $lines.Count) {
    $line = $lines[$i]
    
    # Detectar inicio de la sección de PDF (línea 596)
    if ($line -match '^\s+// Generar el PDF$' -and $i -ge 595 -and $i -le 597) {
        # Agregar el nuevo código que NO llama a Print en web
        $newLines += '      // Generar el PDF'
        $newLines += '      if (Platform.OS === ''web'') {'
        $newLines += '        // En web, crear un blob del HTML y descargarlo directamente'
        $newLines += '        const blob = new Blob([htmlContent], { type: ''text/html'' });'
        $newLines += '        const url = URL.createObjectURL(blob);'
        $newLines += '        '
        $newLines += '        // Abrir en nueva ventana para que el navegador lo convierta a PDF'
        $newLines += '        const printWindow = window.open(url, ''_blank'');'
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += '          ''PDF Generado'','
        $newLines += '          ''El PDF se ha abierto en una nueva pestaña. Usa Ctrl+P para guardarlo como PDF.'','
        $newLines += '          [{ text: ''OK'' }]'
        $newLines += '        );'
        $newLines += '        '
        $newLines += '        // Limpiar el blob después de un tiempo'
        $newLines += '        setTimeout(() => URL.revokeObjectURL(url), 1000);'
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
        
        # Saltar hasta el final del bloque (línea 626)
        $i = 625
    } else {
        $newLines += $line
    }
    
    $i++
}

# Guardar
$newLines | Set-Content $file -Encoding UTF8

Write-Host "Fixed: Print.printToFileAsync now only called on mobile"
