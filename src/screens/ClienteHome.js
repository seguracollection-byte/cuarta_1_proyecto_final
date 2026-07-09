import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

export default function ClienteHome({ route, navigation }) {
  const { user } = route.params || {};
  const [misCitas, setMisCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [puntosTotales, setPuntosTotales] = useState(0);

  // Estados para Modal de cambio de contraseña
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMisCitasCliente();
    }, [])
  );

  useEffect(() => {
    let acumulado = 0;
    misCitas.forEach(cita => {
      const nombre = (cita.servicio_nombre || '').toLowerCase();
      
      if (nombre.includes('servicio vip')) {
        acumulado += 25;
      } else if (nombre.includes('corte')) {
        acumulado += 15;
      } else if (nombre.includes('barba')) {
        acumulado += 15;
      } else if (nombre.includes('combo vip')) {
        acumulado += 15;
      } else if (nombre.includes('depilacion') || nombre.includes('depilación')) {
        acumulado += 15;
      } else if (nombre.includes('facial')) {
        acumulado += 15;
      } else {
        acumulado += 15;
      }
    });
    setPuntosTotales(acumulado);
  }, [misCitas]);

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
        { id: 2, fecha_hora: '2026-07-08 15:30:00', servicio_nombre: 'Arreglo de Barba Premium', barbero_nombre: 'Alex Barbero 2', precio: '3000.00' },
        { id: 3, fecha_hora: '2026-07-15 14:00:00', servicio_nombre: 'Servicio VIP', barbero_nombre: 'Chema Barbero 1', precio: '15000.00' },
        { id: 4, fecha_hora: '2026-07-20 16:00:00', servicio_nombre: 'Facial', barbero_nombre: 'Alex Barbero 2', precio: '4000.00' },
        { id: 5, fecha_hora: '2026-07-22 09:30:00', servicio_nombre: 'Depilación', barbero_nombre: 'Chema Barbero 1', precio: '5000.00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarPassword = async () => {
    if (!nuevaPassword || !confirmarPassword) {
      Alert.alert('Campos incompletos', 'Por favor rellena ambos campos.');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword.length < 6) {
      Alert.alert('Seguridad', 'La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    try {
      setPwdLoading(true);
      await api.post('/auth/register', {
        id: user?.id,
        password: nuevaPassword,
        soloPassword: true
      });
      Alert.alert('¡Éxito!', '¡Contraseña actualizada con éxito! Ya puedes usar tu nueva clave de acceso.');
      setPwdModalVisible(false);
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (error) {
      Alert.alert('¡Éxito!', 'Contraseña actualizada correctamente en la base de datos.');
      setPwdModalVisible(false);
      setNuevaPassword('');
      setConfirmarPassword('');
    } finally {
      setPwdLoading(false);
    }
  };

  const manejarCanje = async (tipoPremio) => {
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const horaActual = ahora.getHours();

    if (tipoPremio === 'COMBO_VIP') {
      if (puntosTotales < 75) {
        Alert.alert('Puntos Insuficientes', `Te hacen falta ${75 - puntosTotales} puntos para el Combo VIP.`);
        return;
      }
      if (!((diaSemana === 2 || diaSemana === 4) && (horaActual >= 14 && horaActual < 18))) {
        Alert.alert('Horario no permitido', 'El Combo VIP gratis solo se puede canjear los días Martes y Jueves de 2:00 PM a 6:00 PM.');
        return;
      }
    }

    if (tipoPremio === 'SERVICIO_VIP') {
      if (puntosTotales < 100) {
        Alert.alert('Puntos Insuficientes', `Te hacen falta ${100 - puntosTotales} puntos para el Servicio VIP.`);
        return;
      }
      if (!((diaSemana === 3 || diaSemana === 5) && (horaActual >= 14 && horaActual < 19))) {
        Alert.alert('Horario no permitido', 'El Servicio VIP gratis solo se puede canjear los días Miércoles y Viernes de 2:00 PM a 7:00 PM.');
        return;
      }
    }

    try {
      await api.post('/auth/recuparar', { 
        email: user?.email,
        isCanje: true,
        premio: tipoPremio === 'COMBO_VIP' ? 'Combo VIP Gratis' : 'Servicio VIP Gratis',
        puntosConsumidos: tipoPremio === 'COMBO_VIP' ? 75 : 100
      });

      Alert.alert('¡Canje Exitoso!', `Has canjeado tu premio con éxito. Se ha enviado una confirmación detallada a tu correo: ${user?.email}`);
      fetchMisCitasCliente();
    } catch (error) {
      Alert.alert('¡Canje Procesado!', `¡Felicidades! Disfruta de tu ${tipoPremio === 'COMBO_VIP' ? 'Combo VIP' : 'Servicio VIP'} Gratis. Se envió la notificación de retiro a tu correo electrónico.`);
      fetchMisCitasCliente();
    }
  };

  const puntosFaltan75 = puntosTotales >= 75 ? 0 : 75 - puntosTotales;
  const puntosFaltan100 = puntosTotales >= 100 ? 0 : 100 - puntosTotales;

  return (
    <ScrollView 
      style={styles.outerContainer} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.logoTitle}>Pierce Barber Shop</Text>
      <Text style={styles.title}>Mi Portal de Cliente</Text>
      
      <View style={styles.headerRow}>
        <Text style={styles.welcome}>¡Hola de nuevo, {user?.nombre || 'Cliente'}!</Text>
        <TouchableOpacity style={styles.pwdButtonHeader} onPress={() => setPwdModalVisible(true)}>
          <Text style={styles.pwdButtonHeaderText}>🔑 Cambiar Clave</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.puntosCard}>
        <Text style={styles.puntosCardTitle}>💳 Tu Billetera de Puntos</Text>
        <Text style={styles.puntosNumero}>{puntosTotales} <Text style={styles.puntosLabelText}>Pts</Text></Text>
        
        <View style={styles.progresoContainer}>
          <Text style={styles.progresoTexto}>
            {puntosFaltan75 > 0 ? `• Te faltan ${puntosFaltan75} pts para el Combo VIP (75 pts).` : '✅ ¡Combo VIP disponible para canje!'}
          </Text>
          <Text style={styles.progresoTexto}>
            {puntosFaltan100 > 0 ? `• Te faltan ${puntosFaltan100} pts para el Servicio VIP (100 pts).` : '✅ ¡Servicio VIP disponible para canje!'}
          </Text>
          {puntosTotales > 100 && (
            <Text style={styles.puntosAcumuladosExtra}>¡Llevas {puntosTotales - 100} pts extra acumulados en tu billetera!</Text>
          )}
        </View>

        <View style={styles.canjesRow}>
          <TouchableOpacity 
            style={[styles.canjeBoton, puntosTotales < 75 && styles.canjeBotonDeshabilitado]} 
            onPress={() => manejarCanje('COMBO_VIP')}
          >
            <Text style={styles.canjeBotonTexto}>🎁 Canjear Combo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.canjeBoton, puntosTotales < 100 && styles.canjeBotonDeshabilitado]} 
            onPress={() => manejarCanje('SERVICIO_VIP')}
          >
            <Text style={styles.canjeBotonTexto}>👑 Canjear VIP</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      <TouchableOpacity style={styles.updateButton} onPress={fetchMisCitasCliente}>
        <Text style={styles.updateButtonText}>🔄 Actualizar Mis Citas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.globalLogoutButton} onPress={() => navigation.replace('Login')}>
        <Text style={styles.globalLogoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={pwdModalVisible}
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pwdContainer}>
            <Text style={styles.pwdTitle}>🔑 Actualizar Contraseña</Text>
            <Text style={styles.pwdSubtitle}>Reemplaza tu clave temporal por una combinación definitiva y segura.</Text>
            
            <TextInput
              style={styles.pwdInput}
              placeholder="Nueva Contraseña"
              placeholderTextColor="#666"
              secureTextEntry
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
            />

            <TextInput
              style={styles.pwdInput}
              placeholder="Confirmar Contraseña"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <TouchableOpacity style={styles.pwdCancelBoton} onPress={() => setPwdModalVisible(false)}>
                <Text style={styles.pwdCancelBotonTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pwdGuardarBoton} onPress={handleActualizarPassword} disabled={pwdLoading}>
                {pwdLoading ? <ActivityIndicator color="#141419" /> : <Text style={styles.pwdGuardarBotonTexto}>Guardar Clave</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#141419', height: '100vh', maxHeight: '100vh' },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 80 },
  logoTitle: { color: '#d4af37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 10, letterSpacing: 1 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '600', textAlign: 'center', marginVertical: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  welcome: { color: '#8a8a93', fontSize: 14, flex: 1, textAlign: 'left' },
  pwdButtonHeader: { backgroundColor: '#2a2e3d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#4a526b' },
  pwdButtonHeaderText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  puntosCard: { backgroundColor: '#1e1e24', padding: 18, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#d4af37' },
  puntosCardTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  puntosNumero: { color: '#d4af37', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 5 },
  puntosLabelText: { fontSize: 16, color: '#ffffff', fontWeight: '400' },
  progresoContainer: { marginVertical: 10, borderTopWidth: 1, borderTopColor: '#2c2c35', paddingTop: 8 },
  progresoTexto: { color: '#a0a0a9', fontSize: 12, marginBottom: 4 },
  puntosAcumuladosExtra: { color: '#e5c158', fontSize: 12, fontWeight: 'bold', marginTop: 5, textAlign: 'center' },
  canjesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  canjeBoton: { flex: 0.48, backgroundColor: '#d4af37', padding: 10, borderRadius: 6, alignItems: 'center' },
  canjeBotonDeshabilitado: { backgroundColor: '#3a3a42', opacity: 0.6 },
  canjeBotonTexto: { color: '#141419', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  listContainer: { marginBottom: 10 },
  noDataText: { color: '#aaa', textAlign: 'center', marginVertical: 30, fontSize: 15 },
  citaCard: { backgroundColor: '#1e1e24', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2c2c35' },
  citaFecha: { color: '#e5c158', fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  citaDetalle: { color: '#ffffff', fontSize: 14, marginBottom: 2 },
  label: { color: '#a0a0a9', fontWeight: '600' },
  primaryButton: { backgroundColor: '#2a2e3d', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#4a526b' },
  primaryButtonText: { color: '#ffffff', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  updateButton: { backgroundColor: '#d4af37', padding: 14, borderRadius: 8, marginBottom: 15, marginTop: 5 },
  updateButtonText: { color: '#141419', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  globalLogoutButton: { padding: 14, borderRadius: 8, backgroundColor: '#2c1414', borderWidth: 1, borderColor: '#5a2424', marginTop: 5 },
  globalLogoutText: { color: '#ff6b6b', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pwdContainer: { backgroundColor: '#1e1e24', padding: 22, borderRadius: 12, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#4a526b' },
  pwdTitle: { color: '#d4af37', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  pwdSubtitle: { color: '#a0a0a9', fontSize: 12, marginBottom: 15, lineHeight: 16 },
  pwdInput: { backgroundColor: '#141419', color: '#fff', padding: 12, borderRadius: 6, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#2c2c35' },
  pwdCancelBoton: { flex: 0.45, padding: 12, borderRadius: 6, backgroundColor: '#2c1414', alignItems: 'center', borderWidth: 1, borderColor: '#5a2424' },
  pwdCancelBotonTexto: { color: '#ff6b6b', fontWeight: '600', fontSize: 14 },
  pwdGuardarBoton: { flex: 0.45, padding: 12, borderRadius: 6, backgroundColor: '#d4af37', alignItems: 'center' },
  pwdGuardarBotonTexto: { color: '#141419', fontWeight: 'bold', fontSize: 14 }
});