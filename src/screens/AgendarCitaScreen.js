import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import api from '../services/api';

export default function AgendarCitaScreen({ route, navigation }) {
  const params = route.params || {};
  const user = params.user && params.user.id ? params.user : null; 
  
  const isInvitado = !user;

  // Estados para datos de invitado
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [emailInvitado, setEmailInvitado] = useState('');
  const [telefonoInvitado, setTelefonoInvitado] = useState('');

  // Estados para datos de la cita
  const [servicios, setServicios] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState(null);
  
  // Estados independientes para evitar conflictos con toISOString() en entornos web
  const [fechaStr, setFechaStr] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [horaStr, setHoraStr] = useState("12:00"); // HH:MM

  // Cargar datos iniciales desde el Backend al abrir la pantalla
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("🔄 Extrayendo servicios y barberos desde la API...");
      const [resServicios, resBarberos] = await Promise.all([
        api.get('/servicios'),
        api.get('/usuarios/barberos')
      ]);
      
      const listaServicios = resServicios.data.data || resServicios.data;
      const listaBarberos = resBarberos.data.data || resBarberos.data;

      setServicios(Array.isArray(listaServicios) ? listaServicios : []);
      setBarberos(Array.isArray(listaBarberos) ? listaBarberos : []);

    } catch (error) {
      console.error("❌ Error en fetchData:", error);
      alert('No se pudieron cargar los servicios o barberos en el navegador.');
    }
  };

  const handleAgendar = async () => {
    if (!servicioSeleccionado || !barberoSeleccionado) {
      alert('Por favor selecciona un servicio y un barbero.');
      return;
    }

    if (isInvitado && (!nombreInvitado || !emailInvitado || !telefonoInvitado)) {
      alert('Por favor llena tus datos de contacto de invitado.');
      return;
    }

    // 🌟 Unión e inyección manual en el formato nativo DATETIME de MySQL (YYYY-MM-DD HH:MM:SS)
    const fechaHoraFinal = `${fechaStr} ${horaStr}:00`;

    // Nos aseguramos de extraer el ID de manera limpia e independiente del rol
    const usuarioIdFinal = user && user.id ? user.id : null;

    const payload = {
      fecha_hora: fechaHoraFinal, 
      servicios_idservicios: servicioSeleccionado,
      barbero_id: barberoSeleccionado,
      usuarios_id: isInvitado ? null : usuarioIdFinal,
      invitado_nombre: isInvitado ? nombreInvitado : null,
      invitado_email: isInvitado ? emailInvitado : null,
      invitado_telefono: isInvitado ? telefonoInvitado : null,
    };

    try {
      console.log("📤 Enviando datos de reservación al backend:", payload);
      const response = await api.post('/citas', payload);
      
      if (response.data.success || response.status === 200 || response.status === 201) {
        alert('¡Éxito! Tu cita ha sido agendada correctamente.');
        
        // 🔄 REDIRECCIÓN INTELIGENTE: Envía a cada usuario a su pantalla correspondiente según su rol
        const userRol = user?.rol ? user.rol.toLowerCase().trim() : 'cliente';
        
        if (userRol === 'admin') {
          navigation.replace('AdminDashboard', { user });
        } else if (userRol === 'barbero') {
          navigation.replace('BarberoDashboard', { user });
        } else {
          navigation.replace('ClienteHome', { user });
        }
      }
    } catch (error) {
      console.error("❌ Error al agendar cita:", error);
      alert('Hubo un problema al procesar la cita en la base de datos.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Agendar Cita</Text>

      {/* SECCIÓN SI ES INVITADO */}
      {isInvitado && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus Datos de Contacto</Text>
          <TextInput style={styles.input} placeholder="Nombre Completo" placeholderTextColor="#666" value={nombreInvitado} onChangeText={setNombreInvitado} />
          <TextInput style={styles.input} placeholder="Correo Electrónico" placeholderTextColor="#666" value={emailInvitado} onChangeText={setEmailInvitado} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor="#666" value={telefonoInvitado} onChangeText={setTelefonoInvitado} keyboardType="phone-pad" />
        </View>
      )}

      {/* SECCIÓN SELECCIONAR SERVICIO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Selecciona el Servicio</Text>
        {servicios.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, servicioSeleccionado === item.id && styles.cardSelected]}
            onPress={() => setServicioSeleccionado(item.id)}
          >
            <Text style={styles.cardText}>{item.nombre} - ₡{item.precio}</Text>
            <Text style={styles.cardSubtext}>{item.duracion_minutos} min - {item.descripcion}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SECCIÓN SELECCIONAR BARBERO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Selecciona tu Barbero</Text>
        {barberos.map((barbero) => (
          <TouchableOpacity 
            key={barbero.id} 
            style={[styles.card, barberoSeleccionado === barbero.id && styles.cardSelected]}
            onPress={() => setBarberoSeleccionado(barbero.id)}
          >
            <Text style={styles.cardText}>{barbero.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SECCIÓN FECHA Y HORA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Fecha y Hora de la Cita</Text>
        <Text style={styles.dateTimeText}>Programado para el: {fechaStr} a las {horaStr}</Text>
        
        <View style={{ gap: 15, marginTop: 5 }}>
          <View>
            <Text style={{ color: '#d4af37', fontSize: 14, marginBottom: 6, fontWeight: '600' }}>Cambiar Fecha:</Text>
            <input 
              type="date" 
              value={fechaStr}
              onChange={(e) => setFechaStr(e.target.value)}
              style={{ backgroundColor: '#1e1e1e', color: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #333', width: '100%', fontSize: '16px' }}
            />
          </View>
          
          <View>
            <Text style={{ color: '#d4af37', fontSize: 14, marginBottom: 6, fontWeight: '600' }}>Cambiar Hora:</Text>
            <input 
              type="time" 
              value={horaStr}
              onChange={(e) => setHoraStr(e.target.value)}
              style={{ backgroundColor: '#1e1e1e', color: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #333', width: '100%', fontSize: '16px' }}
            />
          </View>
        </View>
      </View>

      {/* BOTÓN FINAL */}
      <TouchableOpacity style={styles.submitButton} onPress={handleAgendar}>
        <Text style={styles.submitButtonText}>Confirmar Reservación</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { color: '#d4af37', fontSize: 28, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  section: { marginBottom: 25 },
  sectionTitle: { color: '#d4af37', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  card: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  cardSelected: { borderColor: '#d4af37', backgroundColor: '#2a2415' },
  cardText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardSubtext: { color: '#aaa', fontSize: 13, marginTop: 4 },
  dateTimeText: { color: '#fff', marginBottom: 10, fontSize: 15 },
  submitButton: { backgroundColor: '#d4af37', padding: 16, borderRadius: 8, marginTop: 10 },
  submitButtonText: { color: '#121212', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }
});