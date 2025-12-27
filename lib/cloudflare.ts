import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_CLOUDFLARE_API_URL || 'http://localhost:5001';
const CUSTOM_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Convierte una URL de Cloudflare R2 a una URL del proxy del backend
 * Para cargar imágenes/videos con CORS habilitado
 */
export function getProxyUrl(cloudflareUrl: string): string {
  // Extraer la key de la URL de Cloudflare
  // URL: https://pub-e8c25e8.r2.dev/reportes/fotos/xxx.jpg
  // Key: reportes/fotos/xxx.jpg
  
  try {
    const url = new URL(cloudflareUrl);
    const key = url.pathname.replace(/^\//, ''); // Remover el / inicial
    
    // Retornar URL del proxy
    return `${API_URL}/api/get-file?key=${encodeURIComponent(key)}`;
  } catch (error) {
    console.warn('Error al convertir URL de Cloudflare:', error);
    // Si hay error, retornar la URL original
    return cloudflareUrl;
  }
}

/**
 * Sube un archivo a Cloudflare R2 vía backend
 * 
 * FLUJO WEB (FormData + Blob):
 * 1. Fetch blob desde el URI
 * 2. Crear FormData con blob + metadatos
 * 3. POST FormData al backend
 * 4. Backend parsea con multer, sube a Cloudflare
 * 
 * FLUJO NATIVO (JSON + Base64):
 * 1. Leer archivo como base64 con FileSystem
 * 2. Crear JSON payload con base64 string + metadatos
 * 3. POST JSON al backend
 * 4. Backend decodifica base64 a buffer, sube a Cloudflare
 * 
 * Ambos retornan: {success, url, key}
 */
export async function uploadToCloudflare(
  fileUri: string,
  fileName: string,
  fileType: 'foto' | 'video'
): Promise<UploadResult> {
  try {
    const isWeb = Platform.OS === 'web';
    console.log(`Iniciando subida (${isWeb ? 'WEB' : 'NATIVO'})`);
    console.log(`Archivo: ${fileName} | Tipo: ${fileType}`);
    console.log(`Backend: ${API_URL}/api/upload-file`);

    let response;

    if (isWeb) {
      // ========== WEB: FormData + Blob ==========
      console.log(`Modo WEB: usando FormData`);

      const blobResponse = await fetch(fileUri);
      const blob = await blobResponse.blob();
      console.log(`Blob leído: ${blob.size} bytes`);

      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('fileName', fileName);
      formData.append('fileType', fileType);

      console.log(`Enviando FormData...`);
      response = await fetch(`${API_URL}/api/upload-file`, {
        method: 'POST',
        body: formData,
      });
    } else {
      // ========== NATIVO: JSON + Base64 ==========
      console.log(`Modo NATIVO: usando JSON + base64`);

      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log(`Base64 leído: ${base64String.length} caracteres (~${Math.round(base64String.length / 1.33 / 1024)}KB)`);

      const payload = {
        fileBase64: base64String,
        fileName: fileName,
        fileType: fileType,
      };

      console.log(`Enviando JSON...`);
      response = await fetch(`${API_URL}/api/upload-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }

    // Procesar respuesta (igual para web y nativo)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('Error response:', errorData);
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      console.error('Invalid response:', data);
      return {
        success: false,
        error: data.error || 'No URL returned from server',
      };
    }

    console.log(`Archivo subido exitosamente`);
    console.log(`URL: ${data.url}`);
    console.log(`Key: ${data.key}`);

    return {
      success: true,
      url: data.url,
      key: data.key,
    };
  } catch (error) {
    console.error('Error en uploadToCloudflare:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Elimina un archivo de Cloudflare R2
 */
export async function deleteFromCloudflare(key: string): Promise<UploadResult> {
  try {
    const response = await fetch(`${API_URL}/api/delete-cloudflare`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'No se pudo eliminar el archivo');
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting from Cloudflare:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
