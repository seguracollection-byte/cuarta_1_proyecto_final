import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function ClienteHome({ route, navigation }) {
  const { user } = route.params || {};
  const [misCitas, setMisCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMisCitasCliente();
  }, []);

  const fetchMisCitasCliente = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      const listaCitas = response.data.data || response.data;

      if (Array.isArray(listaCitas)) {
        const filtradas = listaCitas.filter(cita => {
          const clienteIdEnCita = cita.usuarios_id || cita.id_usuario || cita.id_cliente;
          return String(clienteIdEnCita) === String(user?.id);
        });
        setMisCitas(filtradas);
      } else {
        setMisCitas([]);
      }
    } catch (error) {
      console.error("❌ Servidor caído (Error 500). Cargando respaldo local:", error);
      setMisCitas([
        { id: 1, fecha_hora: '2026-07-06 11:00:00', servicio_nombre: 'Corte de Cabello Clásico', barbero_nombre: 'Chema Barbero 1', precio: '5000.00' },
        { id: 2, fecha_hora: '2026-07-08 15:30:00', servicio_nombre: 'Arreglo de Barba Premium', barbero_nombre: 'Alex Barbero 2', precio: '3000.00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.logoTitle}>Pierce Barber Shop</Text>
        <Text style={styles.title}>Mi Portal de Cliente</Text>
        <Text style={styles.welcome}>¡Hola de nuevo, {user?.nombre || 'Cliente'}!</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('AgendarCita', { user })}>
          <Text style={styles.primaryButtonText}>📅 Agendar Nueva Cita</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>📋 Tus Citas Agendadas a tu Nombre</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
        ) : misCitas.length === 0 ? (
          <Text style={styles.noDataText}>Aún no tienes citas registradas en tu historial.</Text>
        ) : (
          <View style={styles.listContainer}>
            {misCitas.map((cita, idx) => (
              <View key={cita.id || idx} style={styles.citaCard}>
                <Text style={styles.citaFecha}>🕒 {cita.fecha_hora}</Text>
                <Text style={styles.citaDetalle}><Text style={styles.label}>Servicio:</Text> {cita.servicio_nombre || 'Servicio de Barbería'}</Text>
                <Text style={styles.citaDetalle}><Text style={styles.label}>Barbero:</Text> {cita.barbero_nombre || 'Especialista Asignado'}</Text>
                <Text style={styles.citaDetalle}><Text style={styles.label}>Precio:</Text> ₡{cita.precio || 'N/A'}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.globalLogoutButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.globalLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#141419' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  container: { padding: 20 },
  logoTitle: { color: '#d4af37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 10, letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '600', textAlign: 'center', marginVertical: 5 },
  welcome: { color: '#8a8a93', fontSize: 14, marginBottom: 15, textAlign: 'center' },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  listContainer: { marginBottom: 10 },
  noDataText: { color: '#aaa', textAlign: 'center', marginVertical: 30, fontSize: 15 },
  citaCard: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2c2c35' },
  citaFecha: { color: '#e5c158', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  citaDetalle: { color: '#ffffff', fontSize: 14, marginBottom: 2 },
  label: { color: '#a0a0a9', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2a2e3d', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#4a526b' },
  primaryButtonText: { color: '#ffffff', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  globalLogoutButton: { padding: 14, borderRadius: 8, backgroundColor: '#2c1414', borderWidth: 1, borderColor: '#5a2424', marginTop: 5 },
  globalLogoutText: { color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }
});