import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ClienteHome({ route, navigation }) {
  const { user } = route.params || {};
  const isInvitado = user?.rol === 'invitado';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pierce Barber Shop</Text>
      <Text style={styles.welcome}>
        {isInvitado ? 'Modo Invitado' : `Bienvenido, ${user?.nombre}`}
      </Text>

      {/* Botón principal de flujo de negocio */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AgendarCita', { user })}
      >
        <Text style={styles.primaryButtonText}>Agendar Nueva Cita</Text>
      </TouchableOpacity>

      {!isInvitado && (
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Mis Citas Agendadas</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>{isInvitado ? 'Volver al Login' : 'Cerrar Sesión'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center' },
  title: { color: '#d4af37', fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  welcome: { color: '#ffffff', fontSize: 16, marginBottom: 40, textAlign: 'center' },
  primaryButton: { backgroundColor: '#d4af37', padding: 15, borderRadius: 8, marginBottom: 15 },
  primaryButtonText: { color: '#121212', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  button: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  buttonText: { color: '#ffffff', fontSize: 16, textAlign: 'center', fontWeight: '600' },
  logoutButton: { marginTop: 40 },
  logoutText: { color: '#ba1a1a', textAlign: 'center', fontWeight: 'bold' }
});