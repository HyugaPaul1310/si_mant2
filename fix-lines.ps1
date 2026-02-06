# Leer el archivo
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$lines = Get-Content $file -Encoding UTF8

# Encontrar y modificar las líneas específicas
for ($i = 0; $i -lt $lines.Count; $i++) {
    # Cambiar la línea 614 (índice 613)
    if ($i -eq 613) {
        $lines[$i] = "        'PDF Descargado',"
    }
    # Cambiar la línea 615 (índice 614)
    if ($i -eq 614) {
        $lines[$i] = "        'El archivo se ha guardado exitosamente.',"
    }
    # Cambiar la línea 616 (índice 615) - inicio del array de botones
    if ($i -eq 615) {
        $lines[$i] = "        [{ text: 'OK' }]"
    }
    # Eliminar líneas 617-630 marcándolas como null
    if ($i -ge 616 -and $i -le 629) {
        $lines[$i] = $null
    }
}

# Filtrar líneas null y guardar
$lines | Where-Object { $_ -ne $null } | Set-Content $file -Encoding UTF8

Write-Host "Archivo modificado exitosamente"
