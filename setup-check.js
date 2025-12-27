#!/usr/bin/env node

/**
 * 🎯 SETUP VERIFICATION SCRIPT
 * 
 * Ejecuta: node setup-check.js
 * 
 * Este script verifica que todo está configurado correctamente
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  checks.push({
    name: description,
    status: exists ? '✅' : '❌',
    message: exists ? 'Archivo existe' : 'Archivo no encontrado'
  });
  return exists;
}

function checkEnvVar(varName, description) {
  const value = process.env[varName];
  const hasValue = !!value && value !== '' && !value.includes('<');
  checks.push({
    name: `${description} (${varName})`,
    status: hasValue ? '✅' : '⚠️',
    message: hasValue ? `Valor: ${value.substring(0, 20)}...` : 'No configurado o incompleto'
  });
  return hasValue;
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║        CLOUDFLARE R2 SETUP VERIFICATION                   ║
║                                                            ║
║  Este script verifica que todo está listo para funcionar   ║
╚════════════════════════════════════════════════════════════╝
`);

console.log('\n📁 VERIFICANDO ARCHIVOS...\n');

// Verificar archivos
checkFile('./api/cloudflare-upload-server.js', 'Backend API (cloudflare-upload-server.js)');
checkFile('./lib/cloudflare.ts', 'Librería Cloudflare (lib/cloudflare.ts)');
checkFile('./lib/reportes.ts', 'Funciones Reportes actualizado (lib/reportes.ts)');
checkFile('./app/modal.tsx', 'Modal actualizado (app/modal.tsx)');
checkFile('./components/galeria-reporte.tsx', 'Componente Galería (components/galeria-reporte.tsx)');
checkFile('./.env', 'Variables de entorno (.env)');
checkFile('./package.json', 'package.json actualizado');

console.log('\n🔐 VERIFICANDO VARIABLES DE ENTORNO...\n');

// Verificar variables de entorno
checkEnvVar('CLOUDFLARE_API_TOKEN', 'Token Cloudflare');
checkEnvVar('CLOUDFLARE_API_SECRET', 'Secret Cloudflare');
checkEnvVar('EXPO_PUBLIC_CLOUDFLARE_BUCKET_NAME', 'Nombre del bucket');
checkEnvVar('EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID', 'Account ID Cloudflare');
checkEnvVar('EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN', 'Dominio personalizado');
checkEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'Supabase URL');
checkEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'Supabase Anon Key');

console.log('\n📦 VERIFICANDO DEPENDENCIAS...\n');

// Verificar dependencias
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const requiredDeps = ['express', 'cors', 'body-parser', 'dotenv', '@supabase/supabase-js', 'expo-file-system'];

requiredDeps.forEach(dep => {
  const exists = !!packageJson.dependencies[dep];
  checks.push({
    name: `Dependencia: ${dep}`,
    status: exists ? '✅' : '❌',
    message: exists ? `${packageJson.dependencies[dep]}` : 'No instalado'
  });
});

console.log('\n📋 RESUMEN DE VERIFICACIÓN\n');

let allOk = true;
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  console.log(`   → ${check.message}`);
  if (!check.status.includes('✅')) allOk = false;
});

console.log('\n' + '═'.repeat(60));

if (allOk) {
  console.log('\n✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!\n');
  console.log('Próximos pasos:');
  console.log('  1. npm install          (instalar dependencias)');
  console.log('  2. npm run start:api    (iniciar backend)');
  console.log('  3. npm start            (en otra terminal - iniciar app)');
  console.log('\nLuego ve a: CLOUDFLARE_PASOS.md para completar la configuración\n');
} else {
  console.log('\n⚠️  HAY PROBLEMAS QUE RESOLVER\n');
  console.log('Revisa:');
  console.log('  - .env: Completa las variables incompletas');
  console.log('  - Archivos: Verifica que existan todos los archivos');
  console.log('  - package.json: Ejecuta "npm install"\n');
}

console.log('═'.repeat(60) + '\n');

process.exit(allOk ? 0 : 1);
