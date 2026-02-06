# Leer el archivo
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Reemplazar la sección de generación de PDF
$oldCode = @'
      // Generar el PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('[PDF] PDF generado en:', uri);

      // Guardar el PDF en la carpeta de descargas
      const fileName = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;
      const downloadPath = `${FileSystem.documentDirectory}${fileName}`;
      
      // Mover el archivo temporal a la ubicación de descargas
      await FileSystem.moveAsync({
        from: uri,
        to: downloadPath
      });

      console.log('[PDF] PDF guardado en:', downloadPath);
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'PDF Descargado',
        'El archivo se ha guardado exitosamente.',
        [{ text: 'OK' }]
      );
'@

$newCode = @'
      // Generar el PDF
      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        base64: Platform.OS === 'web' 
      });
      console.log('[PDF] PDF generado en:', uri);

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
      } else {
        // En móvil, guardar en el sistema de archivos
        const fileName = `Reporte_${reporte.id}_${new Date().getTime()}.pdf`;
        const downloadPath = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.moveAsync({
          from: uri,
          to: downloadPath
        });

        console.log('[PDF] PDF guardado en:', downloadPath);
        
        Alert.alert(
          'PDF Descargado',
          'El archivo se ha guardado exitosamente.',
          [{ text: 'OK' }]
        );
      }
'@

$content = $content.Replace($oldCode, $newCode)

Set-Content $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "Código actualizado para manejar web correctamente"
