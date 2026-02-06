$filePath = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Reemplazar el Alert.alert complejo con uno simple
$oldPattern = @'
      // Mostrar mensaje de éxito
      Alert.alert\(
        'PDF Descargado',
        `El archivo se ha guardado como:\\n\$\{fileName\}`,
        \[
          \{
            text: 'Abrir',
            onPress: async \(\) => \{
              // Compartir para que el usuario pueda abrir con otra app
              if \(await Sharing\.isAvailableAsync\(\)\) \{
                await Sharing\.shareAsync\(downloadPath, \{
                  mimeType: 'application/pdf',
                  UTI: 'com\.adobe\.pdf'
                \}\);
              \}
            \}
          \},
          \{ text: 'OK', style: 'cancel' \}
        \]
      \);
'@

$newPattern = @'
      // Mostrar mensaje de éxito
      Alert.alert(
        'PDF Descargado',
        'El archivo se ha guardado exitosamente.',
        [{ text: 'OK' }]
      );
'@

$content = $content -replace $oldPattern, $newPattern

Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "Archivo actualizado exitosamente"
