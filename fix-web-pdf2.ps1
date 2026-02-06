# Leer el archivo línea por línea
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$lines = Get-Content $file -Encoding UTF8

# Crear nuevo contenido
$newLines = @()
$i = 0
$skipUntil = -1

while ($i -lt $lines.Count) {
    # Si estamos en la línea 596 (índice 595), reemplazar toda la sección
    if ($i -eq 595 -and $lines[$i] -match '// Generar el PDF') {
        # Agregar el nuevo código
        $newLines += '      // Generar el PDF'
        $newLines += '      const { uri } = await Print.printToFileAsync({ '
        $newLines += '        html: htmlContent,'
        $newLines += "        base64: Platform.OS === 'web' "
        $newLines += '      });'
        $newLines += "      console.log('[PDF] PDF generado en:', uri);"
        $newLines += ''
        $newLines += "      if (Platform.OS === 'web') {"
        $newLines += '        // En web, crear un enlace de descarga y hacer clic automáticamente'
        $newLines += "        const link = document.createElement('a');"
        $newLines += '        link.href = uri;'
        $newLines += '        link.download = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;'
        $newLines += '        document.body.appendChild(link);'
        $newLines += '        link.click();'
        $newLines += '        document.body.removeChild(link);'
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += "          'PDF Descargado',"
        $newLines += "          'El archivo se ha guardado en tu carpeta de descargas.',"
        $newLines += "          [{ text: 'OK' }]"
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
        $newLines += "        console.log('[PDF] PDF guardado en:', downloadPath);"
        $newLines += '        '
        $newLines += '        Alert.alert('
        $newLines += "          'PDF Descargado',"
        $newLines += "          'El archivo se ha guardado exitosamente.',"
        $newLines += "          [{ text: 'OK' }]"
        $newLines += '        );'
        $newLines += '      }'
        
        # Saltar las líneas antiguas (596-617, índices 595-616)
        $i = 616
    } else {
        $newLines += $lines[$i]
    }
    $i++
}

# Guardar el archivo
$newLines | Set-Content $file -Encoding UTF8

Write-Host "Archivo actualizado con manejo de plataforma web"
