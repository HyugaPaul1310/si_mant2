// Test que simula el flujo completo del frontend para enviar encuesta

const http = require('http');
const jwt = require('jsonwebtoken');

// Simular AsyncStorage
const mockToken = jwt.sign(
  { 
    id: 1, 
    email: 'cliente@example.com',
    rol: 'cliente'
  },
  'tu_clave_secreta_super_segura_cambiar_esto_en_produccion',
  { expiresIn: '24h' }
);

const API_URL = 'http://localhost:3001/api';

async function apiCall(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
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

// Función que simula guardarEncuestaSatisfaccion del frontend
async function guardarEncuestaSatisfaccion(encuesta) {
  try {
    console.log('📤 Llamando a guardarEncuestaSatisfaccion()...');
    console.log('   Datos:', JSON.stringify(encuesta, null, 2));
    
    const data = await apiCall('/reportes/encuestas/guardar', 'POST', encuesta);

    if (!data.success) {
      throw new Error(data.error || 'Error al guardar la encuesta');
    }

    console.log('✅ Encuesta guardada exitosamente');
    console.log('   ID:', data.data?.id);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Error al guardar encuesta:', error.message);
    return { success: false, error: error.message };
  }
}

// Simular el flujo completo
async function testFlowCompleto() {
  console.log('═════════════════════════════════════════════════════════════\n');
  console.log('🧪 TEST COMPLETO: Flujo de Encuesta de Satisfacción\n');
  console.log('═════════════════════════════════════════════════════════════\n');

  const encuestaData = {
    reporte_id: '6',
    cliente_email: 'juan@empresa.com',
    cliente_nombre: 'Juan García',
    empleado_email: 'carlos@tech.com',
    empleado_nombre: 'Carlos López',
    empresa: 'Tech Solutions',
    trato_equipo: 'Muy satisfecho',
    equipo_tecnico: 'Satisfecho',
    personal_administrativo: 'Muy satisfecho',
    rapidez: 'Satisfecho',
    costo_calidad: 'Satisfecho',
    recomendacion: 'Sí, definitivamente',
    satisfaccion: 'Muy satisfecho'
  };

  console.log('1️⃣  Datos de la encuesta:');
  console.log('   ' + JSON.stringify(encuestaData, null, 4).split('\n').join('\n   '));
  console.log('\n');

  const resultado = await guardarEncuestaSatisfaccion(encuestaData);

  console.log('\n2️⃣  Resultado:');
  if (resultado.success) {
    console.log('   ✅ Encuesta guardada en BD');
    console.log('   📊 ID Encuesta:', resultado.data.id);
    console.log('   📅 Fecha:', resultado.data.created_at);
  } else {
    console.log('   ❌ Error:', resultado.error);
  }

  console.log('\n═════════════════════════════════════════════════════════════');
  console.log('✨ Test finalizado');
  console.log('═════════════════════════════════════════════════════════════\n');
}

// Ejecutar test
testFlowCompleto().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
