$filePath = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Buscar y reemplazar el bloque completo del Alert
$content = $content -replace "text: 'Abrir',\s+onPress: async \(\) => \{[^}]+\}[^}]+\},\s+\{ text: 'OK', style: 'cancel' \}", "{ text: 'OK' }"
$content = $content -replace "El archivo se ha guardado como:\\\\n\`\$\{fileName\}\`", "'El archivo se ha guardado exitosamente.'"

Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "Cambios aplicados"
