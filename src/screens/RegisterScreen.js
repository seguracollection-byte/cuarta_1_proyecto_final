import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!nombre || !email || !telefono || !password) {
            Alert.alert('Error', 'Todos los campos son obligatorios.');
            return;
        }

        setLoading(true);
        try {
            // Envía los datos limpios esperados por la validación del backend
            const response = await api.post('/auth/register', {
                nombre,
                email,
                telefono,
                password,
                rol: 'cliente' // Por defecto se registra como cliente
            });

            if (response.data.success) {
                // 1. Muestra la alerta de éxito tradicional
                Alert.alert('¡Éxito!', 'Usuario creado correctamente.');

                // 2. Hace la redirección automática e inmediata sin depender del botón
                navigation.navigate('Login');
            }
        } catch (error) {
            console.log('Error de registro:', error.response?.data);
            const errorMsg = error.response?.data?.message || 'Error al procesar el registro';
            Alert.alert('Error de Registro', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Crear Cuenta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre Completo"
                placeholderTextColor="#666"
                value={nombre}
                onChangeText={setNombre}
            />

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
                placeholder="Teléfono"
                placeholderTextColor="#666"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña (Mínimo 6 caracteres)"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Registrarse</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#121212' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#d4af37', marginBottom: 40, textAlign: 'center' },
    input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#d4af37', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
    linkText: { color: '#aaa', textAlign: 'center', marginTop: 25, fontSize: 14 }
});