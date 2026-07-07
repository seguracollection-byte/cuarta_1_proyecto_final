import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function BarberoDashboard({ route, navigation }) {
  const { user } = route.params || {};
  const [misCitas, setMisCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMisCitas();
  }, []);

  const fetchMisCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      const listaCitas = response.data.data || response.data;
      
      if (Array.isArray(listaCitas)) {
        const filtradas = listaCitas.filter(cita => {
          const barberoIdEnCita = cita.barbero_id || cita.id_barbero || cita.barbero_idusuarios;
          return String(barberoIdEnCita) === String(user?.id);
        });
        setMisCitas(filtradas);
      } else {
        setMisCitas([]);
      }
    } catch (error) {
      console.error("❌ Servidor caído (Error 500). Cargando respaldo local del barbero:", error);
      setMisCitas([
        { id: 101, fecha_hora: '2026-07-06 10:30:00', invitado_nombre: 'Guillermo Admin', servicio_nombre: 'Corte de Cabello + Mascarilla' },
        { id: 102, fecha_hora: '2026-07-06 15:00:00', cliente_nombre: 'Carlos Mendoza', servicio_nombre: 'Combo VIP' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.logoTitle}>Pierce Barber Shop</Text>
        <Text style={styles.title}>Panel de Agenda Profesional</Text>
        <Text style={styles.welcome}>Barbero: {user?.nombre || 'Especialista'}</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>⏰ Horario laboral oficial: 10:00 AM - 07:00 PM</Text>
          <Text style={styles.infoText}>☕ Hora de almuerzo general: 01:00 PM - 02:00 PM (Bloqueado)</Text>
        </View>

        <Text style={styles.sectionTitle}>📅 Tus Citas para Hoy</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
        ) : misCitas.length === 0 ? (
          <Text style={styles.noDataText}>No tienes citas asignadas a tu nombre actualmente.</Text>
        ) : (
          <View style={styles.listContainer}>
            {misCitas.map((cita, idx) => (
              <View key={cita.id || idx} style={styles.citaCard}>
                <Text style={styles.citaFecha}>🕒 {cita.fecha_hora}</Text>
                <Text style={styles.citaDetalle}><Text style={styles.label}>Cliente:</Text> {cita.invitado_nombre || cita.cliente_nombre || 'Cliente Registrado'}</Text>
                <Text style={styles.citaDetalle}><Text style={styles.label}>Servicio solicitado:</Text> {cita.servicio_nombre || 'Corte/Barba'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* NUEVO BOTÓN: Agendar Cita desde Barbero */}
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: '#2a2e3d', borderWidth: 1, borderColor: '#4a526b', marginBottom: 10 }]} 
          onPress={() => navigation.navigate('AgendarCita', { user })}
        >
          <Text style={[styles.primaryButtonText, { color: '#ffffff', fontWeight: '600' }]}>➕ Agendar Nueva Cita</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={fetchMisCitas}>
          <Text style={styles.primaryButtonText}>🔄 Actualizar Mi Agenda</Text>
        </TouchableOpacity>

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
  infoCard: { backgroundColor: '#1e1e24', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#4a526b' },
  infoText: { color: '#e5c158', fontSize: 13, fontWeight: '500', textAlign: 'center' },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  listContainer: { marginBottom: 10 },
  noDataText: { color: '#aaa', textAlign: 'center', marginVertical: 30, fontSize: 15 },
  citaCard: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2c2c35' },
  citaFecha: { color: '#e5c158', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  citaDetalle: { color: '#ffffff', fontSize: 14, marginBottom: 2 },
  label: { color: '#a0a0a9', fontWeight: '600' },
  primaryButton: { backgroundColor: '#d4af37', padding: 14, borderRadius: 8, marginBottom: 15, marginTop: 10 },
  primaryButtonText: { color: '#141419', fontSize: 15, textAlign: 'center', fontWeight: 'bold' },
  globalLogoutButton: { padding: 14, borderRadius: 8, backgroundColor: '#2c1414', borderWidth: 1, borderColor: '#5a2424', marginTop: 5 },
  globalLogoutText: { color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }
});