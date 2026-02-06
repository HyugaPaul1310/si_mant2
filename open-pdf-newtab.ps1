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
        # Agregar el nuevo código
        $newLines += '      // Generar el PDF'
        $newLines += '      const { uri } = await Print.printToFileAsync({ html: htmlContent });'
        $newLines += '      console.log(''[PDF] PDF generado en:'', uri);'
        $newLines += ''
        $newLines += '      if (Platform.OS === ''web'') {'
        $newLines += '        // En web, abrir el PDF en una nueva pestaña para descarga'
        $newLines += '        window.open(uri, ''_blank'');'
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += '          ''PDF Generado'','
        $newLines += '          ''El PDF se ha abierto en una nueva pestaña. Puedes descargarlo desde ahí.'','
        $newLines += '          [{ text: ''OK'' }]'
        $newLines += '        );'
        $newLines += '      } else {'
        $newLines += '        // En móvil, guardar en el sistema de archivos'
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
    } else {
        $newLines += $line
    }
    
    $i++
}

# Guardar
$newLines | Set-Content $file -Encoding UTF8

Write-Host "PDF generation updated - web opens in new tab"
