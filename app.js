const express = require('express');
const cors = require('cors');

// 1. Importaciones de tus enrutadores
const servicioRoutes = require('./routes/servicioRoutes');
const usuariosRoutes = require('./routes/usuarios.routes');
const citaRoutes = require('./routes/citaRoutes');
const authRoutes = require('./routes/authRoutes'); // Controla login y register

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// 2. Registro de rutas en la API limpias y sin colisiones
app.use('/api/servicios', servicioRoutes);
app.use('/api/usuarios', usuariosRoutes); // Maneja /api/usuarios/barberos
app.use('/api/citas', citaRoutes);        // Maneja /api/citas (GET y POST)

// 🚨 SOLUCIÓN AL CHOQUE: Ponemos el prefijo /api/auth para el Login
app.use('/api/auth', authRoutes);          // Esto creará: /api/auth/login

// Función limpia para levantar el servidor
const startServer = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor escuchando en el puerto http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error.message);
    }
};

startServer();