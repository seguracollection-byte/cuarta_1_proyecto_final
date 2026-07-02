const pool = require('../config/database'); 

// 1. Obtener todas las citas
const getCitas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vw_citas_detalladas ORDER BY fecha_hora ASC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener citas de la vista:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// 2. Crear una nueva cita (Invitado o Registrado)
const createCita = async (req, res) => {
    const { 
        fecha_hora,
        servicios_idservicios, 
        barbero_id, 
        usuarios_id, 
        invitado_nombre, 
        invitado_email, 
        invitado_telefono 
    } = req.body;

    try {
        if (!barbero_id || !servicios_idservicios || !fecha_hora) {
            return res.status(400).json({ 
                success: false, 
                message: 'Los campos barbero_id, servicios_idservicios y fecha_hora son obligatorios.' 
            });
        }

        const [result] = await pool.query(
            `INSERT INTO citas 
            (fecha_hora, servicios_idservicios, barbero_id, usuarios_id, invitado_nombre, invitado_email, invitado_telefono) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                fecha_hora,
                servicios_idservicios,
                barbero_id,
                usuarios_id || null, 
                invitado_nombre || null, 
                invitado_email || null, 
                invitado_telefono || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Cita agendada exitosamente',
            citaId: result.insertId
        });

    } catch (error) {
        console.error('❌ Error real al crear la cita en MariaDB:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = {
    getCitas,
    createCita
};