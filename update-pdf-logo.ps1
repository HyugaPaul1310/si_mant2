# Script para actualizar el diseño del PDF con un estilo más elegante
$file = "c:\Users\pgonz\Documents\GitHub\si_mant2\app\cliente-panel.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Buscar y reemplazar la sección del logo (líneas 460-465)
$oldLogo = @'
            <div class="logo-container">
              <div class="logo-icon">⚙️❄️</div>
              <div class="logo-text">
                <span class="logo-si">SI</span> <span class="logo-mant">MANT</span>
              </div>
            </div>
'@

$newLogo = @'
            <div class="logo-container">
              <svg width="120" height="120" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <!-- Engranaje (gris) -->
                <path d="M100 40 L110 45 L115 35 L125 40 L125 30 L135 30 L140 20 L150 25 L155 15 L160 20 L170 15 L170 25 L180 30 L180 40 L185 50 L180 60 L185 70 L180 80 L180 90 L170 95 L170 105 L160 110 L155 120 L150 115 L140 120 L135 130 L125 130 L125 120 L115 125 L110 135 L100 130 L90 135 L85 125 L75 130 L75 120 L65 130 L60 120 L50 115 L45 120 L40 110 L30 105 L30 95 L20 90 L20 80 L15 70 L20 60 L15 50 L20 40 L20 30 L30 25 L30 15 L40 20 L45 15 L50 25 L60 20 L65 30 L75 30 L75 40 L85 35 L90 45 Z" fill="#6c757d" stroke="#6c757d" stroke-width="3"/>
                <circle cx="100" cy="70" r="25" fill="white"/>
                
                <!-- Copo de nieve (azul) -->
                <g transform="translate(100, 130)">
                  <line x1="0" y1="-25" x2="0" y2="25" stroke="#00a8e8" stroke-width="4"/>
                  <line x1="-22" y1="-12" x2="22" y2="12" stroke="#00a8e8" stroke-width="4"/>
                  <line x1="-22" y1="12" x2="22" y2="-12" stroke="#00a8e8" stroke-width="4"/>
                  <line x1="-25" y1="0" x2="25" y2="0" stroke="#00a8e8" stroke-width="4"/>
                  <line x1="-12" y1="-22" x2="12" y2="22" stroke="#00a8e8" stroke-width="4"/>
                  <line x1="-12" y1="22" x2="12" y2="-22" stroke="#00a8e8" stroke-width="4"/>
                </g>
              </svg>
              <div class="logo-text">
                <span class="logo-si">SI</span> <span class="logo-mant">MANT</span>
              </div>
            </div>
'@

$content = $content.Replace($oldLogo, $newLogo)

Set-Content $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "Logo actualizado con diseño SVG"
