import { Platform } from 'react-native';

const API_URL =
  process.env.EXPO_PUBLIC_CLOUDFLARE_API_URL ||
  (Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/upload`
    : 'http://217.216.43.185/upload');
const CUSTOM_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFLARE_CUSTOM_DOMAIN || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Sube un archivo a Cloudflare R2 vía backend (FormData)
 * Funciona en web y React Native nativo
 */
export async function uploadToCloudflare(
  fileUri: string,
  fileName: string,
  fileType: 'foto' | 'video'
): Promise<UploadResult> {
  try {
    console.log(`🚀🚀🚀 [CLOUDFLARE.TS] Iniciando subida de ${fileName}...`);
    console.log(`🚀🚀🚀 [CLOUDFLARE.TS] URL Backend: ${API_URL}`);

    // Crear FormData
    const formData = new FormData();
    
    if (Platform.OS === 'web') {
      // En web: fetch el blob y agregarlo
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('file', blob, fileName);
    } else {
      // En React Native nativo: usar URI directamente
      formData.append('file', {
        uri: fileUri,
        type: fileType === 'video' ? 'video/mp4' : 'image/jpeg',
        name: fileName,
      } as any);
    }
    
    formData.append('fileName', fileName);
    formData.append('fileType', fileType);

    // Enviar al backend
    console.log(`🚀🚀🚀 [CLOUDFLARE.TS] POST a: ${API_URL}/api/upload-file`);
    const uploadResponse = await fetch(`${API_URL}/api/upload-file`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ error: uploadResponse.statusText }));
      console.error('Upload error:', errorData);
      throw new Error(errorData.error || `Upload failed: ${uploadResponse.statusText}`);
    }

    const data = await uploadResponse.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || 'No URL returned from server');
    }

    console.log(`✅ Archivo subido: ${data.url}`);

    return {
      success: true,
      url: data.url,
      key: data.key,
    };
  } catch (error) {
    console.error('❌ Error en uploadToCloudflare:', error);
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
