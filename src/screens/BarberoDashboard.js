import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function BarberoDashboard({ route, navigation }) {
  const { user } = route.params || {}; // Aquí viene el objeto con el ID del barbero logueado
  const [misCitas, setMisCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMisCitas();
  }, []);

const fetchMisCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/citas');
      // Soportamos si viene directo o dentro de .data.data
      const listaCitas = response.data.data || response.data;
      
      if (Array.isArray(listaCitas)) {
        // Evaluamos múltiples nombres de columna comunes para no romper la app
        const filtradas = listaCitas.filter(cita => {
          const barberoIdEnCita = cita.barbero_id || cita.id_barbero || cita.barbero_idusuarios || cita.id;
          return String(barberoIdEnCita) === String(user?.id);
        });
        setMisCitas(filtradas);
      } else {
        setMisCitas([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar la agenda del barbero:", error);
      setMisCitas([]); // Evita que la pantalla se rompa
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda del Barbero</Text>
      <Text style={styles.welcome}>Hola, {user?.nombre || 'Barbero'}</Text>

      <Text style={styles.sectionTitle}>📋 Tus Próximos Cortes Asignados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#d4af37" style={{ marginVertical: 20 }} />
      ) : misCitas.length === 0 ? (
        <Text style={styles.noDataText}>No tienes citas asignadas para hoy.</Text>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {misCitas.map((cita, idx) => (
            <View key={cita.id || idx} style={styles.citaCard}>
              <Text style={styles.citaFecha}>⏰ Hora: {cita.fecha_hora}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Cliente:</Text> {cita.invitado_nombre || cita.cliente_nombre || 'Invitado'}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Teléfono:</Text> {cita.invitado_telefono || 'N/A'}</Text>
              <Text style={styles.citaDetalle}><Text style={styles.label}>Servicio:</Text> {cita.servicio_nombre || 'Corte Estándar'}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.button} onPress={fetchMisCitas}>
        <Text style={styles.buttonText}>🔄 Actualizar Mi Agenda</Text>
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
  welcome: { color: '#ffffff', fontSize: 15, marginBottom: 25, textAlign: 'center' },
  sectionTitle: { color: '#d4af37', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  scrollContainer: { flex: 1, marginBottom: 15 },
  noDataText: { color: '#aaa', textAlign: 'center', marginVertical: 35, fontSize: 16 },
  citaCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#d4af37' },
  citaFecha: { color: '#d4af37', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  citaDetalle: { color: '#fff', fontSize: 14, marginBottom: 2 },
  label: { color: '#aaa', fontWeight: '600' },
  button: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  buttonText: { color: '#ffffff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  logoutButton: { padding: 15, borderRadius: 8, backgroundColor: '#3a1313' },
  logoutText: { color: '#ff4444', textAlign: 'center', fontWeight: 'bold' }
});