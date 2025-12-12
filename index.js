// index.js - Configuración específica para evitar Timeouts en Render

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors()); 

// --- CAMBIO IMPORTANTE: CONFIGURACIÓN SEGURA ---
// Usamos el puerto 465 (SSL) explícitamente para evitar bloqueos en la nube
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Servidor de Gmail
    port: 465,              // Puerto seguro SSL
    secure: true,           // true para el puerto 465
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: {
        rejectUnauthorized: false // Ayuda a evitar errores de certificados
    }
});

app.get('/', (req, res) => {
    res.send('Servidor de Email funcionando correctamente 🚀');
});

app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    console.log(`Intentando enviar correo de: ${nombre}...`);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, 
        subject: `✨ Nuevo mensaje de: ${nombre}`,
        html: `
            <h3>Nuevo mensaje desde tu Portafolio</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong> ${mensaje}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ ¡Correo enviado con éxito!');
        res.status(200).json({ status: 'success', message: 'Correo enviado' });
    } catch (error) {
        console.error('❌ Error enviando correo:', error);
        res.status(500).json({ status: 'error', message: 'Error al enviar correo', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en el puerto ${PORT}`);
});