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
        # Agregar el nuevo código que llama al backend
        $newLines += '      // Generar el PDF'
        $newLines += '      if (Platform.OS === ''web'') {'
        $newLines += '        // En web, enviar al backend para generar PDF'
        $newLines += '        try {'
        $newLines += '          const response = await fetch(''http://192.168.1.254:3001/api/pdf/generate'', {'
        $newLines += '            method: ''POST'','
        $newLines += '            headers: { ''Content-Type'': ''application/json'' },'
        $newLines += '            body: JSON.stringify({ html: htmlContent })'
        $newLines += '          });'
        $newLines += '          '
        $newLines += '          if (!response.ok) throw new Error(''Error al generar PDF'');'
        $newLines += '          '
        $newLines += '          const blob = await response.blob();'
        $newLines += '          const url = URL.createObjectURL(blob);'
        $newLines += '          const link = document.createElement(''a'');'
        $newLines += '          link.href = url;'
        $newLines += '          link.download = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;'
        $newLines += '          document.body.appendChild(link);'
        $newLines += '          link.click();'
        $newLines += '          document.body.removeChild(link);'
        $newLines += '          URL.revokeObjectURL(url);'
        $newLines += '          '
        $newLines += '          Alert.alert('
        $newLines += '            ''PDF Descargado'','
        $newLines += '            ''El archivo se ha guardado en tu carpeta de descargas.'','
        $newLines += '            [{ text: ''OK'' }]'
        $newLines += '          );'
        $newLines += '        } catch (error) {'
        $newLines += '          console.error(''[PDF] Error:'', error);'
        $newLines += '          Alert.alert(''Error'', ''No se pudo generar el PDF'');'
        $newLines += '        }'
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
        
        # Saltar hasta el final del bloque (línea 633)
        $i = 632
    } else {
        $newLines += $line
    }
    
    $i++
}

# Guardar
$newLines | Set-Content $file -Encoding UTF8

Write-Host "Frontend updated to use backend PDF generation"
