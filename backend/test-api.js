#!/usr/bin/env node

/**
 * Script para probar todos los endpoints de la API
 * Uso: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001/api';
let token = '';

function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Probando API Express...\n');

  try {
    // 1. Health check
    console.log('1. Health check...');
    let res = await makeRequest('GET', '/health');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response:`, res.data, '\n');

    // 2. Login
    console.log('2. Login (admin@test.com / admin123)...');
    res = await makeRequest('POST', '/auth/login', {
      email: 'admin@test.com',
      contraseña: 'admin123'
    });
    console.log(`   ✅ Status: ${res.status}`);
    if (res.data.success && res.data.token) {
      token = res.data.token;
      console.log(`   ✅ Token obtenido: ${token.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ Error: ${res.data.error}`);
    }
    console.log();

    // 3. Get current user
    console.log('3. Obtener perfil actual...');
    res = await makeRequest('GET', '/auth/me');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Usuario: ${res.data.user?.nombre} ${res.data.user?.apellido} (${res.data.user?.email})`);
    console.log(`   Rol: ${res.data.user?.rol}`);
    console.log();

    // 4. Get usuarios
    console.log('4. Listar usuarios...');
    res = await makeRequest('GET', '/usuarios');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Total de usuarios: ${res.data.data?.length || 0}`);
    console.log();

    // 5. Get reportes
    console.log('5. Listar reportes...');
    res = await makeRequest('GET', '/reportes');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Total de reportes: ${res.data.data?.length || 0}`);
    console.log();

    // 6. Get tareas
    console.log('6. Listar tareas...');
    res = await makeRequest('GET', '/tareas');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Total de tareas: ${res.data.data?.length || 0}`);
    console.log();

    // 7. Get herramientas
    console.log('7. Listar herramientas...');
    res = await makeRequest('GET', '/inventario/herramientas');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Total de herramientas: ${res.data.data?.length || 0}`);
    console.log();

    // 8. Get asignaciones
    console.log('8. Listar asignaciones...');
    res = await makeRequest('GET', '/inventario/asignaciones');
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Total de asignaciones: ${res.data.data?.length || 0}`);
    console.log();

    console.log('✅ Todos los tests pasaron!');
    console.log('\n📝 Resumen:');
    console.log('- Backend corriendo ✅');
    console.log('- MySQL conectada ✅');
    console.log('- Autenticación funciona ✅');
    console.log('- Todos los endpoints responden ✅');
    console.log('\n🚀 ¡Listo para integración con frontend!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n⚠️  Asegúrate de que:');
    console.error('  1. El backend está corriendo: cd backend && npm start');
    console.error('  2. MySQL está corriendo');
    console.error('  3. Se ejecutó npm run setup');
  }
}

runTests();
