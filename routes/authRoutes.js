// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas de registro y login tradicionales que ya tenías
router.post('/register', authController.register);
router.post('/login', authController.login);

// 🌟 NUEVA RUTA: Conectamos el endpoint de recuperación con el controlador actualizado
router.post('/recuperar', authController.recuperarPassword);

module.exports = router;