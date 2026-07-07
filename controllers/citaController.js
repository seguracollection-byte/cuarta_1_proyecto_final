const pool = require('../config/database'); 

// 1. Obtener todas las citas (Corregido para soportar Clientes Registrados e Invitados de forma segura)
const getCitas = async (req, res) => {
    try {
        // Usamos un query dinámico con LEFT JOIN para evitar colapsos por valores NULL en los invitados
        const query = `
            SELECT 
                c.idcitas AS id,
                c.fecha_hora,
                c.usuarios_id,
                c.invitado_nombre,
                c.invitado_email,
                c.invitado_telefono,
                s.nombre AS servicio,
                s.precio AS precio,
                s.descripcion AS servicio_descripcion,
                b.nombre AS barbero,
                u.nombre AS cliente_registrado
            FROM citas c
            LEFT JOIN servicios s ON c.servicios_idservicios = s.idservicios
            LEFT JOIN usuarios b ON c.barbero_id = b.id
            LEFT JOIN usuarios u ON c.usuarios_id = u.id
            ORDER BY c.fecha_hora ASC
        `;

        const [rows] = await pool.query(query);

        // Mapeamos los resultados para asegurar que los páneles del frontend lean siempre la misma estructura
        const citasFormateadas = rows.map(cita => {
            // Regla de oro: si hay cliente_registrado se usa ese, sino usamos el nombre del invitado
            let nombreCliente = 'Cliente Invitado';
            if (cita.cliente_registrado) {
                nombreCliente = cita.cliente_registrado;
            } else if (cita.invitado_nombre) {
                nombreCliente = cita.invitado_nombre;
            }

            return {
                id: cita.id,
                fecha_hora: cita.fecha_hora,
                servicio: cita.servicio || 'Servicio no especificado',
                precio: cita.precio || 0,
                barbero: cita.barbero || 'Barbero no asignado',
                cliente: nombreCliente, // El frontend leerá este campo unificado directamente
                email: cita.invitado_email || '',
                telefono: cita.invitado_telefono || '',
                es_invitado: !cita.usuarios_id
            };
        });

        res.json({
            success: true,
            data: citasFormateadas
        });
    } catch (error) {
        console.error('❌ Error al obtener o procesar el listado de citas:', error);
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