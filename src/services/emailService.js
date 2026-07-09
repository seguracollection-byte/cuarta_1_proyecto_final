// src/services/emailService.js
const nodemailer = require('nodemailer');

// Configuración del transportador utilizando Gmail
// NOTA: Para producción con Gmail, se usa una "Contraseña de Aplicación" generada en tu cuenta de Google
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tu_correo_barberia@gmail.com', // 👈 Reemplaza con el correo real de soporte de la barbería
        pass: 'xxxx xxxx xxxx xxxx'          // 👈 Reemplaza con la contraseña de aplicación de Google de 16 letras
    }
});

/**
 * Envía un correo electrónico genérico en formato HTML
 */
const enviarCorreo = async (destinatario, asunto, cuerpoHtml) => {
    try {
        const mailOptions = {
            from: '"Pierce Barber Shop" <tu_correo_barberia@gmail.com>',
            to: destinatario,
            subject: asunto,
            html: cuerpoHtml
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Correo enviado con éxito: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    enviarCorreo
};