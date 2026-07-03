import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // 1. Validación de campos vacíos adaptativa (Móvil + Web)
        if (!email.trim() || !password.trim()) {
            const titulo = 'Campos Obligatorios';
            const mensaje = 'Por favor, ingrese su correo electrónico y contraseña.';

            if (Alert.alert === undefined || typeof Alert.alert !== 'function' || !Alert.alert) {
                alert(`${titulo}: ${mensaje}`);
            } else {
                Alert.alert(titulo, mensaje);
            }
            return;
        }

        setLoading(true);
        try {
            console.log('Enviando datos al backend...');
            const response = await api.post('/auth/login', {
                email: email.trim(),
                password: password.trim()
            });

            console.log('Respuesta del backend recibida:', response.data);
            // Reemplaza esta sección dentro de handleLogin en LoginScreen.js
            if (response.data && response.data.success) {
                const loggedUser = response.data.user;

                // Convertimos el rol a minúsculas y quitamos espacios para evitar fallos de base de datos
                const userRol = loggedUser.rol ? loggedUser.rol.toLowerCase().trim() : '';

                if (userRol === 'admin') {
                    navigation.replace('AdminDashboard', { user: loggedUser });
                } else if (userRol === 'barbero') {
                    navigation.replace('BarberoDashboard', { user: loggedUser });
                } else {
                    navigation.replace('ClienteHome', { user: loggedUser });
                }
            
        } else {
            const errorMsg = response.data.message || 'Credenciales incorrectas';
            if (Alert.alert === undefined || typeof Alert.alert !== 'function' || !Alert.alert) {
                alert(errorMsg);
            } else {
                Alert.alert('Error de Autenticación', errorMsg);
            }
        }
    } catch (error) {
        console.error('❌ Error crítico en la petición de Login:', error);
        const msgFallo = 'No se pudo conectar con el servidor. Verifique que el backend esté encendido.';
        if (Alert.alert === undefined || typeof Alert.alert !== 'function' || !Alert.alert) {
            alert(msgFallo);
        } else {
            Alert.alert('Error de Conexión', msgFallo);
        }
    } finally {
        setLoading(false);
    }
};

return (
    <View style={styles.container}>
        <Text style={styles.logoTitle}>Pierce Barber Shop</Text>

        <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />

        <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="#121212" />
            ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('ClienteHome', { user: { rol: 'invitado', nombre: 'Invitado' } })}
        >
            <Text style={styles.guestButtonText}>Continuar como Invitado</Text>
        </TouchableOpacity>
    </View>
);
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 20 },
    logoTitle: { color: '#d4af37', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
    input: { backgroundColor: '#1e1e1e', color: '#ffffff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 8, marginTop: 10 },
    buttonText: { color: '#121212', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#aaa', textAlign: 'center', marginTop: 20, fontSize: 14 },
    guestButton: { marginTop: 30, padding: 10 },
    guestButtonText: { color: '#d4af37', textAlign: 'center', fontSize: 15, textDecorationLine: 'underline' }
});