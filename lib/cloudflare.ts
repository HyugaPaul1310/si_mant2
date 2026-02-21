import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const DEFAULT_UPLOAD_BASE = 'https://si-mant.com/upload';

const configuredUploadBase = (process.env.EXPO_PUBLIC_CLOUDFLARE_API_URL || '').trim();
const webUploadBase =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/upload`
    : '';

function getUploadBaseCandidates(): string[] {
  const candidates = [
    configuredUploadBase,
    Platform.OS === 'web' ? webUploadBase : '',
    DEFAULT_UPLOAD_BASE,
  ].filter(Boolean);

  return Array.from(new Set(candidates));
}

const API_URL = getUploadBaseCandidates()[0] || DEFAULT_UPLOAD_BASE;

const CUSTOM_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Retorna la URL del proxy del servidor Cloudflare
 * El servidor Cloudflare (puerto 5001) actúa como proxy con CORS habilitado
 */
export function getProxyUrl(cloudflareUrl: string): string {
  try {
    // En app nativa no necesitamos proxy (CORS no aplica) y es más estable en APK
    if (Platform.OS !== 'web') {
      return cloudflareUrl;
    }

    const url = new URL(cloudflareUrl);
    // decodeURIComponent decodifica espacios (%20) que new URL().pathname suele codificar
    const key = decodeURIComponent(url.pathname).replace(/^\//, '');

    // Usar el servidor Cloudflare como proxy
    // URL: https://pub-xxx.r2.dev/reportes/fotos/xxx.jpg → /api/get-file?key=reportes/fotos/xxx.jpg
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
  fileType: 'foto' | 'video' | 'pdf' | 'audio'
): Promise<UploadResult> {
  try {
    const isWeb = Platform.OS === 'web';
    const uploadBases = getUploadBaseCandidates();
    console.log(`Iniciando subida (${isWeb ? 'WEB' : 'NATIVO'})`);
    console.log(`Archivo: ${fileName} | Tipo: ${fileType}`);
    console.log(`Backends candidatos: ${uploadBases.join(' | ')}`);

    let base64String = '';
    let blob: Blob | null = null;

    if (isWeb) {
      const blobResponse = await fetch(fileUri);
      blob = await blobResponse.blob();
      console.log(`Blob leído: ${blob.size} bytes`);
    } else {
      base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log(`Base64 leído: ${base64String.length} caracteres (~${Math.round(base64String.length / 1.33 / 1024)}KB)`);
    }

    let lastError = 'No se pudo conectar al servidor de subida';

    for (const base of uploadBases) {
      try {
        let response;
        console.log(`Probando subida en: ${base}/api/upload-file`);

        if (isWeb) {
          // ========== WEB: FormData + Blob ==========
          console.log(`Modo WEB: usando FormData`);

          const formData = new FormData();
          formData.append('file', blob as Blob, fileName);
          formData.append('fileName', fileName);
          formData.append('fileType', fileType);

          console.log(`Enviando FormData...`);
          response = await fetch(`${base}/api/upload-file`, {
            method: 'POST',
            body: formData,
          });
        } else {
          // ========== NATIVO: JSON + Base64 ==========
          console.log(`Modo NATIVO: usando JSON + base64`);

          const payload = {
            fileBase64: base64String,
            fileName: fileName,
            fileType: fileType,
          };

          console.log(`Enviando JSON...`);
          response = await fetch(`${base}/api/upload-file`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.url) {
          throw new Error(data.error || 'No URL returned from server');
        }

        console.log(`Archivo subido exitosamente`);
        console.log(`URL: ${data.url}`);
        console.log(`Key: ${data.key}`);

        return {
          success: true,
          url: data.url,
          key: data.key,
        };
      } catch (attemptError) {
        const message = attemptError instanceof Error ? attemptError.message : 'Error desconocido';
        lastError = message;
        console.warn(`Falló subida en ${base}: ${message}`);
      }
    }

    return {
      success: false,
      error: lastError,
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
