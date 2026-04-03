// @ts-nocheck
import { getProxyUrl, uploadToCloudflare } from '@/lib/cloudflare';
import {
  actualizarEmpresa,
  actualizarEquipoSucursal,
  actualizarSucursal,
  crearEmpresa,
  crearEquipoSucursal,
  crearSucursal,
  eliminarEmpresa,
  eliminarEquipoSucursal,
  eliminarSucursal,
  obtenerEmpresas,
  obtenerEquiposSucursal,
  obtenerSucursalesPorEmpresa,
  type Empresa,
  type EquipoSucursal,
  type Sucursal,
} from '@/lib/empresas';
import { obtenerHistorialEquipo } from '@/lib/reportes';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CC = '#06b6d4'; // cyan
const BG = '#0f172a';
const CARD = '#111827';
const CARD2 = '#0b1220';
const BORDER = '#1f2937';

export default function GestionEmpresasScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width > 800;

  // --- data ---
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<Sucursal | null>(null);
  const [equipos, setEquipos] = useState<EquipoSucursal[]>([]);

  // historial de servicios
  const [historialEquipo, setHistorialEquipo] = useState<any[]>([]);
  const [equipoHistorial, setEquipoHistorial] = useState<EquipoSucursal | null>(null);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // --- loading ---
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoSucursales, setCargandoSucursales] = useState(false);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // --- modals ---
  const [showNuevaEmpresaModal, setShowNuevaEmpresaModal] = useState(false);
  const [showNuevaSucursalModal, setShowNuevaSucursalModal] = useState(false);
  const [showNuevoEquipoModal, setShowNuevoEquipoModal] = useState(false);
  const [showEditarEmpresaModal, setShowEditarEmpresaModal] = useState(false);
  const [showEditarSucursalModal, setShowEditarSucursalModal] = useState(false);

  // --- form fields ---
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombreSucursal, setNombreSucursal] = useState('');
  const [direccionSucursal, setDireccionSucursal] = useState('');
  const [ciudadSucursal, setCiudadSucursal] = useState('');

  // new equipment
  const [nuevoEquipoNombre, setNuevoEquipoNombre] = useState('');
  const [nuevoEquipoModelo, setNuevoEquipoModelo] = useState('');
  const [nuevoEquipoSerie, setNuevoEquipoSerie] = useState('');
  const [nuevoEquipoImageUrl, setNuevoEquipoImageUrl] = useState('');
  const [nuevoEquipoImagePreview, setNuevoEquipoImagePreview] = useState('');

  // edit empresa inline
  const [editEmpresaNombre, setEditEmpresaNombre] = useState('');

  // edit sucursal inline
  const [editSucursalNombre, setEditSucursalNombre] = useState('');
  const [editSucursalDireccion, setEditSucursalDireccion] = useState('');
  const [editSucursalCiudad, setEditSucursalCiudad] = useState('');

  const [error, setError] = useState('');

  // --- edit equipo ---
  const [showEditarEquipoModal, setShowEditarEquipoModal] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState<EquipoSucursal | null>(null);
  const [editEqNombre, setEditEqNombre] = useState('');
  const [editEqModelo, setEditEqModelo] = useState('');
  const [editEqSerie, setEditEqSerie] = useState('');
  const [editEqImageUrl, setEditEqImageUrl] = useState('');
  const [editEqImagePreview, setEditEqImagePreview] = useState('');
  const [guardandoEquipo, setGuardandoEquipo] = useState(false);

  // --- image viewer ---
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageUrl, setViewerImageUrl] = useState('');

  // --- confirmation modal ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => { cargarEmpresas(); }, []);

  useEffect(() => {
    if (empresaSeleccionada) {
      cargarSucursales(empresaSeleccionada.id);
      setSucursalSeleccionada(null);
      setEquipos([]);
    } else {
      setSucursales([]);
      setSucursalSeleccionada(null);
      setEquipos([]);
    }
  }, [empresaSeleccionada?.id]);

  useEffect(() => {
    if (sucursalSeleccionada) {
      cargarEquipos(sucursalSeleccionada.id);
    } else {
      setEquipos([]);
    }
  }, [sucursalSeleccionada?.id]);

  const cargarEmpresas = async () => {
    setCargandoEmpresas(true);
    const res = await obtenerEmpresas();
    if (res.success && res.data) {
      setEmpresas(res.data);
      if (!empresaSeleccionada && res.data.length > 0) {
        setEmpresaSeleccionada(res.data[0]);
      }
    }
    setCargandoEmpresas(false);
  };

  const cargarSucursales = async (empId: string) => {
    setCargandoSucursales(true);
    const res = await obtenerSucursalesPorEmpresa(empId);
    if (res.success && res.data) setSucursales(res.data);
    setCargandoSucursales(false);
  };

  const cargarEquipos = async (sucId: string) => {
    setCargandoEquipos(true);
    const res = await obtenerEquiposSucursal(sucId);
    if (res.success) setEquipos(res.data);
    setCargandoEquipos(false);
  };

  // ─── Image helpers ────────────────────────────────────────────────────────

  const pickAndUploadImage = async (callback: (url: string) => void) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Necesitas permitir acceso a la galería.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setSubiendoImagen(true);

      const uploadResult = await uploadToCloudflare(asset.uri, 'imagen.jpg', 'foto');
      setSubiendoImagen(false);

      if (uploadResult?.url) {
        callback(uploadResult.url);
      } else {
        Alert.alert('Error', uploadResult?.error || 'No se pudo subir la imagen.');
      }
    } catch (err: any) {
      setSubiendoImagen(false);
      Alert.alert('Error', err?.message || 'Error inesperado al subir imagen.');
    }
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleActualizarLogoEmpresa = () => {
    if (!empresaSeleccionada) return;
    pickAndUploadImage(async (url) => {
      const res = await actualizarEmpresa(empresaSeleccionada.id, { logo_url: url });
      if (res.success) {
        const updated = empresas.map(e => e.id === empresaSeleccionada.id ? { ...e, logo_url: url } : e);
        setEmpresas(updated);
        setEmpresaSeleccionada(prev => prev ? { ...prev, logo_url: url } : prev);
      }
    });
  };

  const handleActualizarImagenSucursal = () => {
    if (!sucursalSeleccionada) return;
    pickAndUploadImage(async (url) => {
      const res = await actualizarSucursal(sucursalSeleccionada.id, { imagen_url: url });
      if (res.success) {
        const updated = sucursales.map(s => s.id === sucursalSeleccionada.id ? { ...s, imagen_url: url } : s);
        setSucursales(updated);
        setSucursalSeleccionada(prev => prev ? { ...prev, imagen_url: url } : prev);
      }
    });
  };

  const handleCrearEmpresa = async () => {
    const n = nombreEmpresa.trim();
    if (!n) { setError('El nombre es requerido'); return; }
    const res = await crearEmpresa(n);
    if (!res.success) { setError(res.error || 'Error'); return; }
    setNombreEmpresa('');
    setShowNuevaEmpresaModal(false);
    await cargarEmpresas();
    if (res.data) setEmpresaSeleccionada(res.data);
  };

  const handleGuardarEmpresa = async () => {
    if (!empresaSeleccionada) return;
    const res = await actualizarEmpresa(empresaSeleccionada.id, { nombre: editEmpresaNombre });
    if (!res.success) { setError(res.error || 'Error'); return; }
    setShowEditarEmpresaModal(false);
    await cargarEmpresas();
  };

  const handleEliminarEmpresa = async () => {
    if (!empresaSeleccionada) return;
    setConfirmTitle('Eliminar empresa');
    setConfirmMsg(`¿Eliminar "${empresaSeleccionada.nombre}" y todas sus sucursales? Esta acción no se puede deshacer.`);
    setConfirmAction(() => async () => {
      const res = await eliminarEmpresa(empresaSeleccionada.id);
      if (!res.success) { setError(res.error || 'Error al eliminar'); return; }
      const nuevas = empresas.filter(e => e.id !== empresaSeleccionada.id);
      setEmpresas(nuevas);
      setEmpresaSeleccionada(nuevas.length > 0 ? nuevas[0] : null);
    });
    setShowConfirmModal(true);
  };

  const handleCrearSucursal = async () => {
    if (!empresaSeleccionada) return;
    const n = nombreSucursal.trim();
    const d = direccionSucursal.trim();
    if (!n || !d) { setError('Nombre y dirección son obligatorios'); return; }
    const res = await crearSucursal({ empresa_id: empresaSeleccionada.id, nombre: n, direccion: d, ciudad: ciudadSucursal.trim() || undefined } as any);
    if (!res.success) { setError(res.error || 'Error'); return; }
    setNombreSucursal(''); setDireccionSucursal(''); setCiudadSucursal('');
    setShowNuevaSucursalModal(false);
    await cargarSucursales(empresaSeleccionada.id);
  };

  const handleGuardarSucursal = async () => {
    if (!sucursalSeleccionada) return;
    const res = await actualizarSucursal(sucursalSeleccionada.id, {
      nombre: editSucursalNombre,
      direccion: editSucursalDireccion,
      ciudad: editSucursalCiudad,
    });
    if (!res.success) { setError(res.error || 'Error'); return; }
    setShowEditarSucursalModal(false);
    await cargarSucursales(empresaSeleccionada!.id);
  };

  const handleEliminarSucursal = (suc: Sucursal) => {
    setConfirmTitle('Eliminar sucursal');
    setConfirmMsg(`¿Eliminar "${suc.nombre}" y todos sus equipos? Esta acción no se puede deshacer.`);
    setConfirmAction(() => async () => {
      const res = await eliminarSucursal(suc.id);
      if (!res.success) { setError(res.error || 'Error al eliminar'); return; }
      if (sucursalSeleccionada?.id === suc.id) setSucursalSeleccionada(null);
      await cargarSucursales(empresaSeleccionada!.id);
    });
    setShowConfirmModal(true);
  };

  const handleCrearEquipo = async () => {
    if (!sucursalSeleccionada) return;
    const n = nuevoEquipoNombre.trim();
    if (!n) { setError('El nombre del equipo es requerido'); return; }
    const res = await crearEquipoSucursal(sucursalSeleccionada.id, {
      nombre: n,
      modelo: nuevoEquipoModelo.trim() || undefined,
      serie: nuevoEquipoSerie.trim() || undefined,
      imagen_url: nuevoEquipoImageUrl || undefined,
    });
    if (!res.success) { setError(res.error || 'Error'); return; }
    setNuevoEquipoNombre(''); setNuevoEquipoModelo(''); setNuevoEquipoSerie('');
    setNuevoEquipoImageUrl(''); setNuevoEquipoImagePreview('');
    setShowNuevoEquipoModal(false);
    await cargarEquipos(sucursalSeleccionada.id);
  };

  const handleEliminarEquipo = async (eq: EquipoSucursal) => {
    setConfirmTitle('Eliminar equipo');
    setConfirmMsg(`¿Eliminar "${eq.nombre}"? Esta acción no se puede deshacer.`);
    setConfirmAction(() => async () => {
      const res = await eliminarEquipoSucursal(eq.id);
      if (!res.success) { setError(res.error || 'Error al eliminar'); return; }
      await cargarEquipos(sucursalSeleccionada!.id);
    });
    setShowConfirmModal(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.root}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin')} style={s.backBtn}>
          <Ionicons name="arrow-back" size={21} color={CC} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestión de Empresas</Text>
      </View>

      {error ? (
        <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: 10, marginHorizontal: 16, borderRadius: 8, marginTop: 6 }}>
          <Text style={{ color: '#f87171', fontSize: 13 }}>{error}</Text>
          <TouchableOpacity onPress={() => setError('')} style={{ position: 'absolute', top: 8, right: 10 }}>
            <Ionicons name="close" size={16} color="#f87171" />
          </TouchableOpacity>
        </View>
      ) : null}

      {subiendoImagen && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, paddingHorizontal: 16 }}>
          <ActivityIndicator size="small" color={CC} />
          <Text style={{ color: CC, fontSize: 12 }}>Subiendo imagen…</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── EMPRESAS ─────────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>EMPRESAS</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => { setNombreEmpresa(''); setShowNuevaEmpresaModal(true); }}>
              <Ionicons name="add" size={14} color="#0b1220" />
              <Text style={s.addBtnText}>Nueva Empresa</Text>
            </TouchableOpacity>
          </View>

          {cargandoEmpresas ? <ActivityIndicator color={CC} style={{ marginTop: 12 }} /> : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
            {empresas.map(emp => {
              const isSelected = emp.id === empresaSeleccionada?.id;
              return (
                <TouchableOpacity
                  key={emp.id}
                  style={[s.empCard, isSelected && s.empCardSelected]}
                  onPress={() => setEmpresaSeleccionada(emp)}
                  activeOpacity={0.85}
                >
                  {/* logo */}
                  <View style={s.empLogoBox}>
                    {emp.logo_url ? (
                      <Image source={{ uri: getProxyUrl(emp.logo_url) }} style={s.empLogo} />
                    ) : (
                      <View style={[s.empLogo, { backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ color: CC, fontSize: 18, fontWeight: '800' }}>
                          {emp.nombre.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.empCardName, isSelected && { color: '#fff' }]} numberOfLines={2}>{emp.nombre}</Text>
                    <Text style={s.empCardCount}>{emp.sucursales_count ?? 0} Sucursales</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Acciones sobre la empresa seleccionada */}
          {empresaSeleccionada && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[s.actionChip, subiendoImagen && { opacity: 0.5 }]} onPress={handleActualizarLogoEmpresa} disabled={subiendoImagen}>
                {subiendoImagen ? <ActivityIndicator size="small" color={CC} /> : <Ionicons name="image-outline" size={14} color={CC} />}
                <Text style={s.actionChipText}>{subiendoImagen ? 'Subiendo...' : 'Cambiar logo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionChip} onPress={() => {
                setEditEmpresaNombre(empresaSeleccionada.nombre);
                setShowEditarEmpresaModal(true);
              }}>
                <Ionicons name="pencil-outline" size={14} color={CC} />
                <Text style={s.actionChipText}>Editar nombre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionChip, { borderColor: '#ef4444' }]} onPress={handleEliminarEmpresa}>
                <Ionicons name="trash-outline" size={14} color="#ef4444" />
                <Text style={[s.actionChipText, { color: '#ef4444' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── SUCURSALES + EQUIPOS ─────────────────────────────────────── */}
        {empresaSeleccionada && (
          <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 16 }}>

            {/* Left: sucursales */}
            <View style={{ flex: 3 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>SUCURSALES: {empresaSeleccionada.nombre}</Text>
                <TouchableOpacity style={s.addBtn} onPress={() => {
                  setNombreSucursal(''); setDireccionSucursal(''); setCiudadSucursal('');
                  setShowNuevaSucursalModal(true);
                }}>
                  <Ionicons name="add" size={14} color="#0b1220" />
                  <Text style={s.addBtnText}>Agregar</Text>
                </TouchableOpacity>
              </View>

              {cargandoSucursales ? <ActivityIndicator color={CC} style={{ marginTop: 12 }} /> : null}

              {!cargandoSucursales && sucursales.length === 0 && (
                <View style={[s.card, { alignItems: 'center', paddingVertical: 24 }]}>
                  <Ionicons name="business-outline" size={32} color="#334155" />
                  <Text style={{ color: '#475569', marginTop: 8 }}>Sin sucursales</Text>
                </View>
              )}

              {sucursales.map(suc => {
                const isSelected = suc.id === sucursalSeleccionada?.id;
                return (
                  <TouchableOpacity
                    key={suc.id}
                    style={[s.sucCard, isSelected && s.sucCardSelected]}
                    onPress={() => setSucursalSeleccionada(suc)}
                    activeOpacity={0.85}
                  >
                    {/* thumbnail */}
                    <View style={s.sucThumbBox}>
                      {suc.imagen_url ? (
                        <Image source={{ uri: getProxyUrl(suc.imagen_url) }} style={s.sucThumb} />
                      ) : (
                        <View style={[s.sucThumb, { backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="storefront-outline" size={22} color="#334155" />
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.sucName, isSelected && { color: '#fff' }]} numberOfLines={1}>{suc.nombre}</Text>
                      <Text style={s.sucDir} numberOfLines={2}>{suc.direccion}</Text>
                      {suc.ciudad ? <Text style={s.sucCity}>{suc.ciudad}</Text> : null}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                      <TouchableOpacity onPress={() => {
                        setSucursalSeleccionada(suc);
                        setEditSucursalNombre(suc.nombre);
                        setEditSucursalDireccion(suc.direccion);
                        setEditSucursalCiudad(suc.ciudad || '');
                        setShowEditarSucursalModal(true);
                      }} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(167, 139, 250, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="pencil" size={16} color="#a78bfa" />
                      </TouchableOpacity>

                      {suc.imagen_url ? (
                        <TouchableOpacity onPress={() => {
                          setViewerImageUrl(getProxyUrl(suc.imagen_url!));
                          setShowImageViewer(true);
                        }} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(56, 189, 248, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="image-outline" size={16} color="#38bdf8" />
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity onPress={() => handleEliminarSucursal(suc)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(248, 113, 113, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="trash" size={16} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Right: equipos panel */}
            {sucursalSeleccionada && (
              <View style={{ flex: 2 }}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionLabel}>INVENTARIO: EQUIPOS</Text>
                  <TouchableOpacity style={s.addBtn} onPress={() => {
                    setNuevoEquipoNombre(''); setNuevoEquipoModelo(''); setNuevoEquipoSerie('');
                    setNuevoEquipoImageUrl(''); setNuevoEquipoImagePreview('');
                    setShowNuevoEquipoModal(true);
                  }}>
                    <Ionicons name="add" size={14} color="#0b1220" />
                    <Text style={s.addBtnText}>Añadir</Text>
                  </TouchableOpacity>
                </View>



                <View style={[s.card, { padding: 0, overflow: 'hidden' }]}>
                  <View style={s.eqHeader}>
                    <Text style={s.eqHeaderText}>LISTA TÉCNICA DE EQUIPOS</Text>
                  </View>

                  {cargandoEquipos ? <ActivityIndicator color={CC} style={{ margin: 16 }} /> : null}

                  {!cargandoEquipos && equipos.length === 0 && (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Ionicons name="hardware-chip-outline" size={28} color="#334155" />
                      <Text style={{ color: '#475569', marginTop: 8, fontSize: 13 }}>Sin equipos registrados</Text>
                    </View>
                  )}

                  {equipos.map(eq => (
                    <TouchableOpacity
                      key={eq.id}
                      style={[s.eqItem, { activeOpacity: 0.8 }]}
                      onPress={async () => {
                        setEquipoHistorial(eq);
                        setShowHistorialModal(true);
                        setCargandoHistorial(true);
                        const res = await obtenerHistorialEquipo(String(eq.id));
                        setHistorialEquipo(res.data || []);
                        setCargandoHistorial(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={s.eqThumbBox}>
                        {eq.imagen_url ? (
                          <Image source={{ uri: getProxyUrl(eq.imagen_url) }} style={s.eqThumb} />
                        ) : (
                          <View style={[s.eqThumb, { backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="hardware-chip-outline" size={18} color="#334155" />
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.eqName} numberOfLines={1}>{eq.nombre}</Text>
                        {eq.modelo ? <Text style={s.eqSub} numberOfLines={1}>Modelo: {eq.modelo}</Text> : null}
                        {eq.serie ? <Text style={s.eqSub} numberOfLines={1}>SERIE: {eq.serie}</Text> : null}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            setEquipoEditando(eq);
                            setEditEqNombre(eq.nombre);
                            setEditEqModelo(eq.modelo || '');
                            setEditEqSerie(eq.serie || '');
                            setEditEqImageUrl(eq.imagen_url || '');
                            setEditEqImagePreview(eq.imagen_url ? getProxyUrl(eq.imagen_url) : '');
                            setShowEditarEquipoModal(true);
                          }}
                          style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(167, 139, 250, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="pencil" size={16} color="#a78bfa" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation?.(); handleEliminarEquipo(eq); }}
                          style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(248, 113, 113, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Ionicons name="trash" size={16} color="#f87171" />
                        </TouchableOpacity>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(6, 182, 212, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="time" size={16} color="#06b6d4" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── HISTORIAL DE EQUIPO ──────────────────────────────────────────── */}
      {/* ─── HISTORIAL DE EQUIPO ──────────────────────────────────────────── */}
      <Modal visible={showHistorialModal} transparent animationType="slide" onRequestClose={() => setShowHistorialModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.98)', paddingTop: 60, paddingHorizontal: '5%', paddingBottom: 20 }}>


          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.modalTitlePremium}>Historial de Servicios</Text>
              {equipoHistorial && (
                <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 8, fontWeight: '600' }}>
                  {equipoHistorial.nombre}
                  {equipoHistorial.modelo ? ` · Mod: ${equipoHistorial.modelo}` : ''}
                  {equipoHistorial.serie ? ` · SN: ${equipoHistorial.serie}` : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowHistorialModal(false)}
              style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <Ionicons name="close" size={24} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              {cargandoHistorial && <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />}

              {!cargandoHistorial && historialEquipo.length === 0 && (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 60, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(139, 92, 246, 0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="documents-outline" size={36} color="#8b5cf6" />
                  </View>
                  <Text style={{ color: '#cbd5e1', fontSize: 18, fontWeight: '700' }}>Sin servicios registrados</Text>
                  <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 300 }}>
                    Los reportes de este equipo aparecerán aquí una vez que sean procesados.
                  </Text>
                </View>
              )}

              {historialEquipo.map((rep, idx) => {
                const estadoColor = {
                  terminado: '#22c55e', cerrado: '#0ea5e9', finalizado_por_tecnico: '#06b6d4',
                  en_proceso: '#f59e0b', pendiente: '#94a3b8', cotizado: '#8b5cf6',
                }[rep.estado] || '#64748b';

                return (
                  <View key={rep.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 24, padding: 28,
                  }}>
                    {/* Cabecera del Reporte */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <View>
                        <Text style={{ color: '#e2e8f0', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
                          Reporte #{rep.id}
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                          {new Date(rep.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: estadoColor + '1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: estadoColor + '40' }}>
                        <Text style={{ color: estadoColor, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                          {rep.estado?.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Técnico */}
                    {rep.tecnico && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(139, 92, 246, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="person" size={14} color="#a78bfa" />
                        </View>
                        <Text style={{ color: '#cbd5e1', fontSize: 14, fontWeight: '600' }}>{rep.tecnico}</Text>
                      </View>
                    )}

                    {/* Grid de contenido */}
                    <View style={{ gap: 20 }}>
                      {rep.analisis_general ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>ANÁLISIS GENERAL</Text>
                          <View style={{ backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)' }}>
                            <Text style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 22 }}>{rep.analisis_general}</Text>
                          </View>
                        </View>
                      ) : null}

                      {rep.revision ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ color: '#a78bfa', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>REVISIÓN TÉCNICA</Text>
                          <View style={{ backgroundColor: 'rgba(167, 139, 250, 0.05)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.1)' }}>
                            <Text style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 22 }}>{rep.revision}</Text>
                          </View>
                        </View>
                      ) : null}

                      {rep.reparacion ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ color: '#34d399', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>TRABAJO REALIZADO</Text>
                          <View style={{ backgroundColor: 'rgba(52, 211, 153, 0.05)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.1)' }}>
                            <Text style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 22 }}>{rep.reparacion}</Text>
                          </View>
                        </View>
                      ) : null}

                      {rep.recomendaciones ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ color: '#fbbf24', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>RECOMENDACIONES</Text>
                          <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.05)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.1)' }}>
                            <Text style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 22 }}>{rep.recomendaciones}</Text>
                          </View>
                        </View>
                      ) : null}

                      {rep.materiales_refacciones ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ color: '#fb923c', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>MATERIALES / REFACCIONES</Text>
                          <View style={{ backgroundColor: 'rgba(251, 146, 60, 0.05)', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(251, 146, 60, 0.1)' }}>
                            <Text style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 22 }}>{rep.materiales_refacciones}</Text>
                          </View>
                        </View>
                      ) : null}
                    </View>

                    {/* Costo final */}
                    {rep.precio_cotizacion ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(34, 197, 94, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="card" size={18} color="#34d399" />
                        </View>
                        <View>
                          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Costo Estimado</Text>
                          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800' }}>
                            {rep.moneda || 'MXN'} ${Number(rep.precio_cotizacion).toLocaleString('es-MX')}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Vacío */}
                    {!rep.analisis_general && !rep.revision && !rep.reparacion && !rep.recomendaciones && !rep.materiales_refacciones && (
                      <View style={{ marginTop: 12, padding: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={24} color="#64748b" style={{ marginBottom: 8 }} />
                        <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Reporte en proceso</Text>
                        <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>El técnico aún no ha agregado detalles.</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODALS ────────────────────────────────────────────────────── */}

      {/* Nueva Empresa */}
      <Modal visible={showNuevaEmpresaModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Nueva Empresa</Text>
            <TextInput
              style={s.input}
              placeholder="Nombre de la empresa"
              placeholderTextColor="#64748b"
              value={nombreEmpresa}
              onChangeText={setNombreEmpresa}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowNuevaEmpresaModal(false)} style={s.secBtn}>
                <Text style={s.secBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCrearEmpresa} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Editar Empresa */}
      <Modal visible={showEditarEmpresaModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Editar Empresa</Text>
            <TextInput
              style={s.input}
              placeholder="Nombre de la empresa"
              placeholderTextColor="#64748b"
              value={editEmpresaNombre}
              onChangeText={setEditEmpresaNombre}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowEditarEmpresaModal(false)} style={s.secBtn}>
                <Text style={s.secBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardarEmpresa} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nueva Sucursal */}
      <Modal visible={showNuevaSucursalModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Nueva Sucursal</Text>
            <TextInput style={s.input} placeholder="Nombre de la sucursal" placeholderTextColor="#64748b" value={nombreSucursal} onChangeText={setNombreSucursal} />
            <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} placeholder="Dirección completa" placeholderTextColor="#64748b" value={direccionSucursal} onChangeText={setDireccionSucursal} multiline />
            <TextInput style={s.input} placeholder="Ciudad (opcional)" placeholderTextColor="#64748b" value={ciudadSucursal} onChangeText={setCiudadSucursal} />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowNuevaSucursalModal(false)} style={s.secBtn}>
                <Text style={s.secBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCrearSucursal} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Editar Sucursal */}
      <Modal visible={showEditarSucursalModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Editar Sucursal</Text>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity disabled={subiendoImagen} onPress={handleActualizarImagenSucursal} style={{ width: '100%', paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.1)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.3)', opacity: subiendoImagen ? 0.7 : 1 }}>
                {subiendoImagen ? <ActivityIndicator size="small" color="#a78bfa" /> : <Ionicons name="camera-outline" size={18} color="#a78bfa" />}
                <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600' }}>
                  {subiendoImagen ? 'Subiendo fotografía...' : 'Actualizar Fotografía de Sucursal'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput style={s.input} placeholder="Nombre" placeholderTextColor="#64748b" value={editSucursalNombre} onChangeText={setEditSucursalNombre} />
            <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} placeholder="Dirección" placeholderTextColor="#64748b" value={editSucursalDireccion} onChangeText={setEditSucursalDireccion} multiline />
            <TextInput style={s.input} placeholder="Ciudad" placeholderTextColor="#64748b" value={editSucursalCiudad} onChangeText={setEditSucursalCiudad} />
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setShowEditarSucursalModal(false)} style={s.secBtn}>
                <Text style={s.secBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardarSucursal} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nuevo Equipo */}
      <Modal visible={showNuevoEquipoModal} transparent animationType="fade">
        <View style={s.overlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minHeight: '100%', paddingVertical: 20 }}>
            <View style={s.modalCardPremium}>
              <View style={{ marginBottom: 32 }}>
                <Text style={s.modalTitlePremium}>Nuevo Equipo</Text>
              </View>

              <View style={[s.modalBodyPremium, !isWide && { flexDirection: 'column' }]}>
                {/* Columna Izquierda: Imagen */}
                <View style={s.modalLeftPremium}>
                  <View style={s.imageBoxPremium}>
                    <TouchableOpacity
                      style={s.imagePickerPremium}
                      activeOpacity={0.9}
                      onPress={() => {
                        if (nuevoEquipoImagePreview) {
                          setViewerImageUrl(nuevoEquipoImagePreview);
                          setShowImageViewer(true);
                        }
                      }}
                    >
                      {nuevoEquipoImagePreview ? (
                        <>
                          <Image source={{ uri: nuevoEquipoImagePreview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          <View style={s.imageViewOverlay}>
                            <Ionicons name="expand-outline" size={20} color="#fff" />
                          </View>
                        </>
                      ) : (
                        <View style={{ alignItems: 'center', gap: 16 }}>
                          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(6,182,212,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(6,182,212,0.1)' }}>
                            <Ionicons name="camera" size={32} color={CC} />
                          </View>
                          <Text style={{ color: '#64748b', fontSize: 14, textAlign: 'center' }}>No hay imagen seleccionada</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[s.btnImagePremium, subiendoImagen && { opacity: 0.7 }]}
                    disabled={subiendoImagen}
                    onPress={() => pickAndUploadImage((url) => {
                      setNuevoEquipoImageUrl(url);
                      setNuevoEquipoImagePreview(url);
                    })}
                  >
                    {subiendoImagen ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator color={CC} size="small" />
                        <Text style={s.btnImageTextPremium}>Subiendo imagen...</Text>
                      </View>
                    ) : (
                      <Text style={s.btnImageTextPremium}>Cambiar Imagen</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Columna Derecha: Formulario */}
                <View style={s.modalRightPremium}>
                  <View style={{ flex: 1 }}>
                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Nombre del Equipo *</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. Refrigerador Industrial"
                          placeholderTextColor="#475569"
                          value={nuevoEquipoNombre}
                          onChangeText={setNuevoEquipoNombre}
                        />
                      </View>
                    </View>

                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Modelo</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. Samsung RT38"
                          placeholderTextColor="#475569"
                          value={nuevoEquipoModelo}
                          onChangeText={setNuevoEquipoModelo}
                        />
                      </View>
                    </View>

                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Número de Serie</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. SN-27742"
                          placeholderTextColor="#475569"
                          value={nuevoEquipoSerie}
                          onChangeText={setNuevoEquipoSerie}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={s.modalActionsPremium}>
                    <TouchableOpacity
                      onPress={() => setShowNuevoEquipoModal(false)}
                      style={s.btnSecondaryPremium}
                    >
                      <Text style={s.btnSecondaryTextPremium}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleCrearEquipo}
                      disabled={guardandoEquipo}
                      activeOpacity={0.8}
                      style={{ width: '48%' }}
                    >
                      <LinearGradient
                        colors={['#8b5cf6', '#7c3aed']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[s.btnPrimaryPremium, { width: '100%' }]}
                      >
                        <Text style={s.btnPrimaryTextPremium}>
                          {guardandoEquipo ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={s.overlay}>
          <View style={[s.modalCard, { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 }]}>
            {/* Warning Icon */}
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderWidth: 2, borderColor: 'rgba(239, 68, 68, 0.25)',
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>

            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>
              {confirmTitle}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
              {confirmMsg}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={() => { setShowConfirmModal(false); setConfirmAction(null); }}
                style={{
                  flex: 1, height: 46, borderRadius: 10,
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderColor: '#334155',
                }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  setShowConfirmModal(false);
                  if (confirmAction) await confirmAction();
                  setConfirmAction(null);
                }}
                style={{
                  flex: 1, height: 46, borderRadius: 10,
                  backgroundColor: '#ef4444',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row', gap: 6,
                }}
              >
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal visible={showEditarEquipoModal} transparent animationType="fade" onRequestClose={() => setShowEditarEquipoModal(false)}>
        <View style={s.overlay}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', minHeight: '100%', paddingVertical: 20 }}>
            <View style={s.modalCardPremium}>
              <View style={{ marginBottom: 32 }}>
                <Text style={s.modalTitlePremium}>Editar Equipo</Text>
              </View>

              <View style={[s.modalBodyPremium, !isWide && { flexDirection: 'column' }]}>
                {/* Columna Izquierda: Imagen */}
                <View style={s.modalLeftPremium}>
                  <View style={s.imageBoxPremium}>
                    <TouchableOpacity
                      style={s.imagePickerPremium}
                      activeOpacity={0.9}
                      onPress={() => {
                        if (editEqImagePreview) {
                          setViewerImageUrl(editEqImagePreview);
                          setShowImageViewer(true);
                        }
                      }}
                    >
                      {editEqImagePreview ? (
                        <>
                          <Image source={{ uri: editEqImagePreview }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          <View style={s.imageViewOverlay}>
                            <Ionicons name="expand-outline" size={20} color="#fff" />
                          </View>
                        </>
                      ) : (
                        <View style={{ alignItems: 'center', gap: 16 }}>
                          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(167,139,250,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.1)' }}>
                            <Ionicons name="camera" size={32} color="#a78bfa" />
                          </View>
                          <Text style={{ color: '#64748b', fontSize: 14, textAlign: 'center' }}>No hay imagen seleccionada</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[s.btnImagePremium, subiendoImagen && { opacity: 0.7 }]}
                    disabled={subiendoImagen}
                    onPress={() => pickAndUploadImage((url) => {
                      setEditEqImageUrl(url);
                      setEditEqImagePreview(url);
                    })}
                  >
                    {subiendoImagen ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator color={CC} size="small" />
                        <Text style={s.btnImageTextPremium}>Subiendo imagen...</Text>
                      </View>
                    ) : (
                      <Text style={s.btnImageTextPremium}>Cambiar Imagen</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Columna Derecha: Formulario */}
                <View style={s.modalRightPremium}>
                  <View style={{ flex: 1 }}>
                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Nombre del Equipo *</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. Refrigerador Industrial"
                          placeholderTextColor="#475569"
                          value={editEqNombre}
                          onChangeText={setEditEqNombre}
                        />
                      </View>
                    </View>

                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Modelo</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. RT38K5930SL"
                          placeholderTextColor="#475569"
                          value={editEqModelo}
                          onChangeText={setEditEqModelo}
                        />
                      </View>
                    </View>

                    <View style={s.inputContainerPremium}>
                      <Text style={s.inputLabelPremium}>Número de Serie</Text>
                      <View style={s.inputWrapperPremium}>
                        <TextInput
                          style={s.inputPremium}
                          placeholder="Ej. SN-27742"
                          placeholderTextColor="#475569"
                          value={editEqSerie}
                          onChangeText={setEditEqSerie}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={s.modalActionsPremium}>
                    <TouchableOpacity
                      onPress={() => { setShowEditarEquipoModal(false); setEquipoEditando(null); }}
                      style={s.btnSecondaryPremium}
                    >
                      <Text style={s.btnSecondaryTextPremium}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={async () => {
                        if (!editEqNombre.trim() || !equipoEditando || !sucursalSeleccionada) return;
                        setGuardandoEquipo(true);
                        const res = await actualizarEquipoSucursal(equipoEditando.id, {
                          nombre: editEqNombre.trim(),
                          modelo: editEqModelo.trim() || undefined,
                          serie: editEqSerie.trim() || undefined,
                          imagen_url: editEqImageUrl || undefined,
                        });
                        if (res.success) {
                          setShowEditarEquipoModal(false);
                          setEquipoEditando(null);
                          await cargarEquipos(sucursalSeleccionada.id);
                        } else {
                          setError(res.error || 'Error al editar');
                        }
                        setGuardandoEquipo(false);
                      }}
                      disabled={guardandoEquipo}
                      activeOpacity={0.8}
                      style={{ width: '48%' }}
                    >
                      <LinearGradient
                        colors={['#8b5cf6', '#7c3aed']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[s.btnPrimaryPremium, { width: '100%' }]}
                      >
                        <Text style={s.btnPrimaryTextPremium}>
                          {guardandoEquipo ? 'Guardando...' : 'Guardar Cambios'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={showImageViewer} transparent animationType="fade" onRequestClose={() => setShowImageViewer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowImageViewer(false)}
            style={{ position: 'absolute', top: 40, right: 20, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(30, 41, 59, 0.8)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {viewerImageUrl ? (
            <Image source={{ uri: viewerImageUrl }} style={{ width: '90%', height: '70%' }} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  section: { padding: 16, paddingBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { color: CC, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: CC,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
  },
  addBtnText: { color: '#0b1220', fontSize: 12, fontWeight: '700' },

  // empresa card
  empCard: {
    width: 160, backgroundColor: CARD, borderRadius: 10, padding: 12,
    borderWidth: 1.5, borderColor: BORDER, gap: 8, flexDirection: 'row', alignItems: 'center',
  },
  empCardSelected: { borderColor: CC, backgroundColor: 'rgba(6,182,212,0.08)' },
  empLogoBox: {},
  empLogo: { width: 42, height: 42, borderRadius: 8, overflow: 'hidden' },
  empCardName: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  empCardCount: { color: '#475569', fontSize: 11, marginTop: 2 },

  // action chips
  actionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: CC, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  actionChipText: { color: CC, fontSize: 12, fontWeight: '600' },

  // sucursal card
  sucCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: CARD, borderRadius: 10, padding: 12,
    borderWidth: 1.5, borderColor: BORDER, marginBottom: 8,
  },
  sucCardSelected: { borderColor: CC, backgroundColor: 'rgba(6,182,212,0.06)' },
  sucThumbBox: {},
  sucThumb: { width: 52, height: 52, borderRadius: 8 },
  sucName: { color: '#cbd5e1', fontSize: 13, fontWeight: '700' },
  sucDir: { color: '#94a3b8', fontSize: 11, marginTop: 2, lineHeight: 16 },
  sucCity: { color: '#64748b', fontSize: 11, marginTop: 2 },

  iconBtn: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: CARD2,
    borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center',
  },

  changeBranchImageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: CC, borderRadius: 6, borderStyle: 'dashed',
    paddingVertical: 7, paddingHorizontal: 10, marginBottom: 10,
  },

  card: { backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  eqHeader: {
    padding: 10, borderBottomWidth: 1, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  eqHeaderText: { color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  // equipo item
  eqItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  eqThumbBox: {},
  eqThumb: { width: 40, height: 40, borderRadius: 6 },
  eqName: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  eqSub: { color: '#64748b', fontSize: 11, marginTop: 1 },
  eqDeleteBtn: {
    width: 26, height: 26, borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // modals
  overlay: {
    flex: 1, backgroundColor: 'rgba(2,6,23,0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    width: '90%', maxWidth: 400, backgroundColor: CARD2, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER, padding: 20, gap: 10,
  },
  modalTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  input: {
    backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, color: '#e2e8f0', fontSize: 14,
  },

  // Premium Modal Styles
  modalCardPremium: {
    width: '90%',
    maxWidth: 1100, // Forces an elegant absolute size on large screens (about 50%)
    height: '85%',
    maxHeight: 850,
    minHeight: 600,
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // bg-slate-900/80
    paddingVertical: 56,
    paddingHorizontal: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#312e81', // shadow-indigo-900
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  modalBodyPremium: {
    flexDirection: 'row',
    gap: 60,
    flex: 1,
  },
  modalLeftPremium: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalRightPremium: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalTitlePremium: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  inputContainerPremium: {
    marginBottom: 24,
  },
  inputLabelPremium: {
    color: '#cbd5e1', // text-slate-300
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapperPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  inputPremium: {
    flex: 1,
    color: '#f1f5f9', // text-slate-100
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 10,
  },
  imageBoxPremium: {
    flex: 1,
    width: '100%',
    marginBottom: 16,
  },
  imagePickerPremium: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // bg-black/40
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnImagePremium: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
  },
  btnImageTextPremium: {
    color: '#818cf8', // text-indigo-400
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imageViewOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // bg-slate-900/50
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  modalActionsPremium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnPrimaryPremium: {
    width: '48%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#6366f1', // shadow-indigo-500
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  btnPrimaryTextPremium: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnSecondaryPremium: {
    width: '48%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  btnSecondaryTextPremium: {
    color: '#cbd5e1', // text-slate-300
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 },
  primaryBtn: { backgroundColor: CC, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#0b1220', fontWeight: '700', fontSize: 14 },
  secBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  secBtnText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },

  imagePicker: {
    height: 130, backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed',
    overflow: 'hidden',
  },
});
