// services/emailService.js
const nodemailer = require('nodemailer');

// Configuración del transportador utilizando Gmail
// NOTA: Reemplaza con un correo real de Gmail y su contraseña de aplicación de 16 letras
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mo.420ras@gmail.com', // 👈 Pon aquí tu correo real de Gmail
        pass: 'tcyv bllk tydk oays'          // 👈 Tu contraseña de aplicación de Google (16 letras)
    }
});

/**
 * Envía un correo electrónico genérico en formato HTML
 */
const enviarCorreo = async (destinatario, asunto, cuerpoHtml) => {
    try {
        const mailOptions = {
            from: '"Pierce Barber Shop" <tu_correo_barberia@gmail.com>', // 👈 El mismo correo aquí
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