// Componente para mostrar galería de fotos y videos en reportes
// Usa esto en admin.tsx y cliente-panel.tsx cuando quieras mostrar archivos

import { obtenerFotosReporte, obtenerVideosReporte } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReporteArchivo {
  id: string;
  cloudflare_url: string;
  tipo_archivo: 'foto' | 'video';
  nombre_original?: string;
}

interface GaleriaReporteProps {
  reporteId: string;
  onFotosLoaded?: (fotos: ReporteArchivo[]) => void;
  onVideosLoaded?: (videos: ReporteArchivo[]) => void;
}

/**
 * COMPONENTE: Galería de fotos y videos
 * 
 * Uso en admin.tsx:
 * 
 * <GaleriaReporte 
 *   reporteId={selectedReporte.id}
 *   onFotosLoaded={(fotos) => console.log('Fotos:', fotos)}
 *   onVideosLoaded={(videos) => console.log('Videos:', videos)}
 * />
 */
export function GaleriaReporte({ reporteId, onFotosLoaded, onVideosLoaded }: GaleriaReporteProps) {
  const [fotos, setFotos] = useState<ReporteArchivo[]>([]);
  const [videos, setVideos] = useState<ReporteArchivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [showFotoModal, setShowFotoModal] = useState(false);

  useEffect(() => {
    cargarArchivos();
  }, [reporteId]);

  const cargarArchivos = async () => {
    setLoading(true);
    try {
      // Cargar fotos
      const fotosResult = await obtenerFotosReporte(reporteId);
      if (fotosResult.success && fotosResult.data) {
        setFotos(fotosResult.data);
        onFotosLoaded?.(fotosResult.data);
      }

      // Cargar videos
      const videosResult = await obtenerVideosReporte(reporteId);
      if (videosResult.success && videosResult.data) {
        setVideos(videosResult.data);
        onVideosLoaded?.(videosResult.data);
      }
    } catch (error) {
      console.error('Error al cargar archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  const totalArchivos = fotos.length + videos.length;

  if (totalArchivos === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images" size={40} color="#cbd5e1" />
        <Text style={styles.emptyText}>Sin fotos ni videos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fotos */}
      {fotos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fotos ({fotos.length})</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.fotoScroll}
            contentContainerStyle={{ gap: 8 }}
          >
            {fotos.map((foto) => (
              <TouchableOpacity
                key={foto.id}
                onPress={() => {
                  setSelectedFoto(foto.cloudflare_url);
                  setShowFotoModal(true);
                }}
                style={styles.fotoThumb}
              >
                <Image
                  source={{ uri: foto.cloudflare_url }}
                  style={styles.fotoImage}
                  resizeMode="cover"
                />
                <View style={styles.fotoOverlay}>
                  <Ionicons name="expand" size={16} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Videos ({videos.length})</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.videoScroll}
            contentContainerStyle={{ gap: 8 }}
          >
            {videos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoThumb}
                onPress={() => {
                  // Aquí puedes abrir un reproductor de video
                  // Por ahora solo mostrar URL
                  console.log('Video URL:', video.cloudflare_url);
                }}
              >
                <View style={styles.videoPlayButton}>
                  <Ionicons name="play" size={24} color="white" />
                </View>
                <Text style={styles.videoLabel}>Video</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modal para ver foto en grande */}
      <Modal
        visible={showFotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFotoModal(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          {selectedFoto && (
            <Image
              source={{ uri: selectedFoto }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  fotoScroll: {
    paddingHorizontal: 16,
  },
  fotoThumb: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  fotoImage: {
    width: '100%',
    height: '100%',
  },
  fotoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoScroll: {
    paddingHorizontal: 16,
  },
  videoThumb: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  videoPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

export default GaleriaReporte;

/* 
  INSTRUCCIONES DE INTEGRACIÓN:
  
  1. Copiar este archivo a: components/galeria-reporte.tsx
  
  2. En admin.tsx, en el modal de detalles del reporte, agregar:
  
     import { GaleriaReporte } from '@/components/galeria-reporte';
     
     // Dentro del modal:
     <GaleriaReporte 
       reporteId={selectedReporte.id}
       onFotosLoaded={(fotos) => console.log('Fotos cargadas:', fotos)}
     />
  
  3. En cliente-panel.tsx, agregar similar en vista de detalles de reporte
  
  4. Para reproductor de video completo, usar:
     npm install expo-video
     
  Y crear un componente VideoPlayer personalizado
*/
