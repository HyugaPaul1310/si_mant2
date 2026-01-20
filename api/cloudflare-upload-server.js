
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Parsers para diferentes tipos de contenido
app.use(express.json({ limit: '100mb' })); // Para JSON + base64 del nativo
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Configuración desde .env
const ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const BUCKET_NAME = process.env.EXPO_PUBLIC_CLOUDFLARE_BUCKET_NAME || 'si-mant2-reportes';
const CUSTOM_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN;
const ACCESS_KEY = process.env.CLOUDFLARE_API_TOKEN;
const SECRET_KEY = process.env.CLOUDFLARE_API_SECRET;
const PORT = process.env.PORT || 5001;

// Validar configuración
if (!ACCOUNT_ID || !CUSTOM_DOMAIN || !ACCESS_KEY || !SECRET_KEY) {
  console.error(' Error: Faltan variables en .env.local');
  console.error('   - EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID');
  console.error('   - EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN');
  console.error('   - CLOUDFLARE_API_TOKEN');
  console.error('   - CLOUDFLARE_API_SECRET');
  process.exit(1);
}

// Configurar S3 Client para Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

/**
 * POST /api/upload-file
 * Recibe archivo como FormData (web) o JSON base64 (nativo)
 */
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  try {
    let fileBuffer;
    let fileName;
    let fileType;

    // Detectar si es FormData (web) o JSON (nativo)
    if (req.file) {
      // FormData (web)
      fileBuffer = req.file.buffer;
      fileName = req.body.fileName || req.file.originalname;
      fileType = req.body.fileType;
    } else if (req.body.fileBase64) {
      // JSON con base64 (nativo)
      fileName = req.body.fileName;
      fileType = req.body.fileType;
      fileBuffer = Buffer.from(req.body.fileBase64, 'base64');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros: file (FormData) o fileBase64 (JSON)',
      });
    }

    // Validar entrada
    if (!fileBuffer || !fileName || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros: fileName, fileType, y contenido del archivo',
      });
    }

    if (!['foto', 'video'].includes(fileType)) {
      return res.status(400).json({
        success: false,
        error: 'fileType debe ser "foto" o "video"',
      });
    }

    console.log(`📤 Iniciando subida: ${fileName} (${fileBuffer.length} bytes)`);

    // Generar clave única
    const timestamp = Date.now();
    const key = `reportes/${fileType}s/${timestamp}-${fileName}`;

    console.log(`🔐 Subiendo a S3: ${BUCKET_NAME}/${key}`);

    // Usar AWS SDK para subir a Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: fileType === 'video' ? 'video/mp4' : 'image/jpeg',
    });

    const response = await s3Client.send(command);
    console.log(`Archivo subido exitosamente: ${key}`);

    // URL pública del archivo
    const publicUrl = `${CUSTOM_DOMAIN}/${key}`;

    return res.json({
      success: true,
      url: publicUrl,
      key: key,
      fileSize: fileBuffer.length,
    });
  } catch (error) {
    console.error('Error en /api/upload-file:', error.message);
    console.error('   Code:', error.Code);
    console.error('   Full error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Error al subir archivo',
    });
  }
});

/**
 * DELETE /api/delete-cloudflare
 * Elimina un archivo de Cloudflare R2
 */
app.delete('/api/delete-cloudflare', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Falta parámetro: key',
      });
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    console.log(`Archivo eliminado: ${key}`);

    return res.json({
      success: true,
      message: 'Archivo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /health
 * Verificar estado del servidor
 */
app.get('/health', (req, res) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bucket: BUCKET_NAME,
  });
});

/**
 * GET /api/get-file
 * Proxy para servir archivos de Cloudflare R2 con CORS headers
 * Query params: ?key=reportes/fotos/xxx.jpg
 */
app.get('/api/get-file', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Falta parámetro: key (ej: reportes/fotos/xxx.jpg)',
      });
    }

    console.log(`Sirviendo archivo: ${key}`);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Determinar tipo MIME
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };

    const ext = key.toLowerCase().match(/\.[^.]+$/)?.[0] || '.jpg';
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Headers con CORS
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24h

    // Convertir stream a buffer y enviar
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.set('Content-Length', buffer.length);
    res.send(buffer);

    console.log(`Archivo enviado: ${key} (${buffer.length} bytes)`);
  } catch (error) {
    console.error('Error en /api/get-file:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener archivo',
    });
  }
});

// Opción OPTIONS para CORS preflight
app.options('/api/get-file', cors());

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   Cloudflare R2 Upload Server (Simple)                   ║
║   Escuchando en: http://192.168.1.148:${PORT}                    ║
║   Bucket: ${BUCKET_NAME}                         ║
║   Modo: Público (sin autenticación)                      ║
╚══════════════════════════════════════════════════════════╝

Endpoints disponibles:
  POST   /api/upload-file     - Subir archivo (FormData)
  DELETE /api/delete-cloudflare - Eliminar archivo
  GET    /health              - Verificar estado
  `);
});

// Manejo de errores
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
