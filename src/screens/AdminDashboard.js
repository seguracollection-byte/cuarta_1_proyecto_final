import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function AdminDashboard({ route, navigation }) {
  const { user } = route.params || {};
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar todas las citas del negocio al entrar
  useEffect(() => {
    fetchTodasLasCitas();
  }, []);

  const fetchTodasLasCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      // Extraemos usando .data.data debido a nuestra estructura del controlador
      const listaCitas = response.data.data || response.data;
      setCitas(Array.isArray(listaCitas) ? listaCitas : []);
    } catch (error) {
      console.error("❌ Error al cargar citas en Admin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Administración</Text>
      <Text style={styles.welcome}>Bienvenido, {user?.nombre || 'Administrador'}</Text>

      <Text style={styles.sectionTitle}>📅 Reporte General de Citas Activas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
      ) : citas.length === 0 ? (
        <Text style={styles.noDataText}>No hay citas registradas en el sistema todavía.</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {citas.map((cita, idx) => (
            <View key={cita.id || index} style={styles.citaCard}>
              <Text style={styles.citaFecha}>📅 {cita.fecha_hora}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Cliente:</Text> {cita.invitado_nombre || cita.cliente_nombre || 'Registrado'}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Barbero:</Text> {cita.barbero_nombre || 'No asignado'}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Servicio:</Text> {cita.servicio_nombre || 'Corte Estándar'}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Botón de Actualizar Manual */}
      <TouchableOpacity style={styles.button} onPress={fetchTodasLasCitas}>
        <Text style={styles.buttonText}>🔄 Sincronizar Citas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: '#d4af37', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  welcome: { color: '#ffffff', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  sectionTitle: { color: '#d4af37', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  scrollContainer: { flex: 1, marginBottom: 15 },
  noDataText: { color: '#aaa', textAlign: 'center', marginVertical: 30, fontSize: 16 },
  citaCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  citaFecha: { color: '#d4af37', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  citaDetalle: { color: '#fff', fontSize: 14, marginBottom: 2 },
  label: { color: '#aaa', fontWeight: '600' },
  button: { backgroundColor: '#2a2415', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#d4af37' },
  buttonText: { color: '#d4af37', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  logoutButton: { padding: 15, borderRadius: 8, backgroundColor: '#3a1313' },
  logoutText: { color: '#ff4444', textAlign: 'center', fontWeight: 'bold' }
});