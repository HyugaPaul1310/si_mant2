import {
    actualizarEmpresa,
    actualizarSucursal,
    crearEmpresa,
    crearSucursal,
    eliminarEmpresa,
    eliminarSucursal,
    obtenerEmpresas,
    obtenerSucursalesPorEmpresa,
    type Empresa,
    type Sucursal,
} from '@/lib/empresas';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GestionEmpresasScreen() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<Empresa | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<{
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // formularios
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nombreSucursal, setNombreSucursal] = useState('');
  const [direccionSucursal, setDireccionSucursal] = useState('');

  // edición inline
  const [editandoEmpresa, setEditandoEmpresa] = useState<{ id: string; nombre: string } | null>(null);
  const [editandoSucursal, setEditandoSucursal] = useState<Sucursal | null>(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  useEffect(() => {
    if (empresaSeleccionada) {
      cargarSucursales(empresaSeleccionada.id);
    } else {
      setSucursales([]);
    }
  }, [empresaSeleccionada]);

  const cargarEmpresas = async () => {
    setCargando(true);
    const res = await obtenerEmpresas();
    if (res.success && res.data) {
      setEmpresas(res.data);
      if (!empresaSeleccionada && res.data.length > 0) setEmpresaSeleccionada(res.data[0]);
    } else {
      setError(res.error || 'No se pudieron cargar las empresas');
    }
    setCargando(false);
  };

  const cargarSucursales = async (empresaId: string) => {
    const res = await obtenerSucursalesPorEmpresa(empresaId);
    if (res.success && res.data) setSucursales(res.data);
  };

  const handleEliminarEmpresa = () => {
    if (!empresaSeleccionada) {
      setError('Selecciona una empresa');
      return;
    }
    setConfirm({
      title: 'Eliminar empresa',
      message: `¿Eliminar ${empresaSeleccionada.nombre}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        const res = await eliminarEmpresa(empresaSeleccionada.id);
        if (!res.success) {
          setError(res.error || 'No se pudo eliminar');
          return;
        }
        setEmpresaSeleccionada(null);
        await cargarEmpresas();
        setSucursales([]);
      },
    });
  };

  const handleEliminarSucursal = (sucursalId: string, nombre: string) => {
    setConfirm({
      title: 'Eliminar sucursal',
      message: `¿Eliminar ${nombre}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      danger: true,
      onConfirm: async () => {
        const res = await eliminarSucursal(sucursalId);
        if (!res.success) {
          setError(res.error || 'No se pudo eliminar sucursal');
          return;
        }
        if (empresaSeleccionada) await cargarSucursales(empresaSeleccionada.id);
      },
    });
  };

  const handleCrearEmpresa = async () => {
    setError('');
    const limpio = nombreEmpresa.trim();
    if (!limpio) {
      setError('Ingresa el nombre de la empresa');
      return;
    }
    setConfirm({
      title: 'Crear empresa',
      message: `¿Crear "${limpio}"?`,
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const res = await crearEmpresa(nombreEmpresa);
        if (!res.success) {
          setError(res.error || 'No se pudo crear');
          return;
        }
        setNombreEmpresa('');
        await cargarEmpresas();
        if (res.data) setEmpresaSeleccionada(res.data);
      },
    });
  };

  const handleCrearSucursal = async () => {
    if (!empresaSeleccionada) {
      setError('Selecciona una empresa');
      return;
    }
    const n = nombreSucursal.trim();
    const d = direccionSucursal.trim();
    if (!n || !d) {
      setError('Nombre y dirección de sucursal son obligatorios');
      return;
    }

    // Validar que no exista una sucursal con el mismo nombre
    const sucursalExistente = sucursales.some(
      (s) => s.nombre.toLowerCase() === n.toLowerCase()
    );
    if (sucursalExistente) {
      setError(`Ya existe una sucursal llamada "${n}" en esta empresa`);
      return;
    }

    setConfirm({
      title: 'Crear sucursal',
      message: `¿Crear "${n}"?`,
      confirmText: 'Crear',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        const res = await crearSucursal({
          empresa_id: empresaSeleccionada.id,
          nombre: n,
          direccion: d,
        } as any);
        if (!res.success) {
          setError(res.error || 'No se pudo crear sucursal');
          return;
        }
        setNombreSucursal('');
        setDireccionSucursal('');
        await cargarSucursales(empresaSeleccionada.id);
      },
    });
  };

  const handleGuardarEmpresa = async () => {
    if (!editandoEmpresa) return;
    const limpio = editandoEmpresa.nombre.trim();
    if (!limpio) {
      setError('El nombre no puede estar vacío');
      return;
    }
    const res = await actualizarEmpresa(editandoEmpresa.id, { nombre: limpio });
    if (!res.success) {
      setError(res.error || 'No se pudo actualizar');
      return;
    }
    setEditandoEmpresa(null);
    await cargarEmpresas();
    if (empresaSeleccionada?.id === editandoEmpresa.id && res.data) {
      setEmpresaSeleccionada(res.data);
    }
  };

  const handleGuardarSucursal = async () => {
    if (!editandoSucursal) return;
    const n = editandoSucursal.nombre.trim();
    const d = editandoSucursal.direccion.trim();
    if (!n || !d) {
      setError('Nombre y dirección son obligatorios');
      return;
    }
    const res = await actualizarSucursal(editandoSucursal.id, {
      nombre: n,
      direccion: d,
    });
    if (!res.success) {
      setError(res.error || 'No se pudo actualizar');
      return;
    }
    setEditandoSucursal(null);
    if (empresaSeleccionada) await cargarSucursales(empresaSeleccionada.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#06b6d4" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Empresas</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Empresas</Text>
          <View style={styles.rowWrap}>
            {empresas.map((emp) => (
              <TouchableOpacity
                key={emp.id}
                style={[styles.chip, emp.id === empresaSeleccionada?.id && styles.chipActive]}
                onPress={() => setEmpresaSeleccionada(emp)}
              >
                <Text style={styles.chipText}>{emp.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formRow}>
            <TextInput
              placeholder="Nueva empresa"
              placeholderTextColor="#94a3b8"
              value={nombreEmpresa}
              onChangeText={setNombreEmpresa}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleCrearEmpresa} style={styles.primaryBtn}>
              <Text style={styles.btnText}>Agregar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!empresaSeleccionada) {
                  setError('Selecciona una empresa');
                  return;
                }
                setEditandoEmpresa({ id: empresaSeleccionada.id, nombre: empresaSeleccionada.nombre });
              }}
              style={styles.editBtn}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEliminarEmpresa} style={styles.dangerBtn}>
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sucursales</Text>
          {cargando && <Text style={styles.helper}>Cargando...</Text>}
          {!cargando && sucursales.length === 0 && (
            <Text style={styles.helper}>No hay sucursales para esta empresa.</Text>
          )}
          {sucursales.map((s) => (
            <View key={s.id}>
              {editandoSucursal?.id === s.id ? (
                <View style={styles.editSucursalCard}>
                  <TextInput
                    value={editandoSucursal.nombre}
                    onChangeText={(t) => setEditandoSucursal({ ...editandoSucursal, nombre: t })}
                    style={styles.input}
                    placeholder="Nombre"
                    placeholderTextColor="#64748b"
                  />
                  <TextInput
                    value={editandoSucursal.direccion}
                    onChangeText={(t) => setEditandoSucursal({ ...editandoSucursal, direccion: t })}
                    style={[styles.input, { minHeight: 60 }]}
                    placeholder="Dirección"
                    placeholderTextColor="#64748b"
                    multiline
                  />
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity onPress={handleGuardarSucursal} style={[styles.primaryBtn, { flex: 1 }]}>
                      <Text style={styles.btnText}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditandoSucursal(null)} style={[styles.secondaryBtn, { flex: 1 }]}>
                      <Text style={styles.secondaryText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.sucursalItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sucursalTitle}>{s.nombre}</Text>
                    <Text style={styles.sucursalDir}>{s.direccion}</Text>
                    {s.ciudad ? <Text style={styles.sucursalCity}>{s.ciudad}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    {!s.activo && <Text style={styles.badge}>Inactiva</Text>}
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity onPress={() => setEditandoSucursal(s)} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={16} color="#06b6d4" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEliminarSucursal(s.id, s.nombre)}
                        style={styles.iconBtn}
                      >
                        <Ionicons name="trash" size={16} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Agregar sucursal</Text>
          <View style={styles.formCol}>
            <TextInput
              placeholder="Nombre de la sucursal"
              placeholderTextColor="#94a3b8"
              value={nombreSucursal}
              onChangeText={setNombreSucursal}
              style={styles.input}
            />
            <TextInput
              placeholder="Dirección completa"
              placeholderTextColor="#94a3b8"
              value={direccionSucursal}
              onChangeText={setDireccionSucursal}
              style={[styles.input, { minHeight: 60 }]}
              multiline
            />
            <TouchableOpacity onPress={handleCrearSucursal} style={[styles.primaryBtn, { alignSelf: 'stretch' }]}>
              <Text style={styles.btnText}>Agregar sucursal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {confirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {confirm.title ? <Text style={styles.modalTitle}>{confirm.title}</Text> : null}
            <Text style={styles.modalMessage}>{confirm.message}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setConfirm(null)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>{confirm.cancelText || 'Cancelar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await confirm.onConfirm();
                  setConfirm(null);
                }}
                style={confirm.danger ? styles.dangerBtn : styles.primaryBtn}
              >
                <Text style={confirm.danger ? styles.btnTextLight : styles.btnText}>{confirm.confirmText || 'Confirmar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {editandoEmpresa && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar empresa</Text>
            <TextInput
              value={editandoEmpresa.nombre}
              onChangeText={(t) => setEditandoEmpresa({ ...editandoEmpresa, nombre: t })}
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Nombre de la empresa"
              placeholderTextColor="#64748b"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditandoEmpresa(null)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardarEmpresa} style={styles.primaryBtn}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: { marginRight: 12 },
  title: { color: '#e2e8f0', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: { color: '#e2e8f0', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  chipActive: { backgroundColor: '#0ea5e9' },
  chipText: { color: '#e2e8f0', fontSize: 13 },
  formRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e2e8f0',
  },
  primaryBtn: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
  },
  dangerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 96,
  },
  btnText: { color: '#0b1220', fontWeight: '700' },
  btnTextLight: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#e2e8f0', fontWeight: '600' },
  helper: { color: '#94a3b8', fontSize: 13 },
  sucursalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0b1220',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  sucursalTitle: { color: '#e2e8f0', fontWeight: '700' },
  sucursalDir: { color: '#cbd5e1', fontSize: 12 },
  sucursalCity: { color: '#94a3b8', fontSize: 12 },
  badge: {
    color: '#f97316',
    fontWeight: '700',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b1220',
  },
  formCol: { gap: 8, marginTop: 8 },
  chipContainer: { position: 'relative' },
  editChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#e2e8f0',
    fontSize: 13,
    minWidth: 120,
  },
  saveBtn: {
    padding: 4,
  },
  cancelBtn: {
    padding: 4,
  },
  editIconBtn: {
    marginLeft: 4,
    padding: 2,
  },
  editSucursalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#0b1220',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  modalMessage: { color: '#94a3b8', fontSize: 13 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  error: {
    color: '#f87171',
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
