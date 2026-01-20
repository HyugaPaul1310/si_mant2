const http = require('http');
const jwt = require('jsonwebtoken');

// Datos de prueba
const testData = {
  reporte_id: 6,
  cliente_email: 'cliente@example.com',
  cliente_nombre: 'Juan Cliente',
  empleado_email: 'empleado@example.com',
  empleado_nombre: 'Carlos Técnico',
  empresa: 'Tech Solutions',
  trato_equipo: 'Muy satisfecho',
  equipo_tecnico: 'Satisfecho',
  personal_administrativo: 'Satisfecho',
  rapidez: 'Muy satisfecho',
  costo_calidad: 'Satisfecho',
  recomendacion: 'Sí',
  satisfaccion: 'Muy satisfecho'
};

// Crear token JWT para autenticación
const token = jwt.sign(
  { 
    id: 1, 
    email: 'cliente@example.com',
    rol: 'cliente'
  },
  'tu_clave_secreta_super_segura_cambiar_esto_en_produccion',
  { expiresIn: '24h' }
);

console.log('🧪 TEST: Guardando encuesta de satisfacción...\n');
console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2));

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/reportes/encuestas/guardar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`\n📡 Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n✅ Response recibida:');
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      
      if (parsedData.success) {
        console.log('\n🎉 ¡Encuesta guardada exitosamente!');
        console.log(`   ID generado: ${parsedData.data?.id}`);
      } else {
        console.log('\n❌ Error:', parsedData.error);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la solicitud:', error);
});

console.log('\n📤 Enviando solicitud POST a /api/reportes/encuestas/guardar...\n');
req.write(JSON.stringify(testData));
req.end();
