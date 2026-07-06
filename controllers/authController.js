// Importación directa del pool sin llaves (adaptado a tu config/database.js limpio)
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { nombre, email, telefono, password, rol } = req.body;

    try {
        // Verificar si el correo ya existe
        const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRol = rol || 'cliente';
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, telefono, password, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, telefono, hashedPassword, userRol]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar al usuario por correo usando el pool directo
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // 2. Verificar que la contraseña coincida con el hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
        }

        // 3. Generar el Token JWT conteniendo su ID y su Rol
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET || 'secretkey_temporal', 
            { expiresIn: '8h' }
        );

        // Imprimir en la consola de Node para depuración en vivo
        console.log(`🔑 LOGIN EXITOSO -> Usuario: ${user.nombre} | Rol BD: ${user.rol}`);

        // 4. Responder garantizando que los datos limpios se envíen de manera explícita
        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token: token,
            user: {
                id: Number(user.id),
                nombre: String(user.nombre),
                email: String(user.email),
                rol: String(user.rol).toLowerCase().trim() // Lo mandamos limpio y en minúsculas
            }
        });

    } catch (error) {
        console.error('❌ Error real en el proceso de login en Node:', error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = {
    register,
    login
};