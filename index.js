// index.js - Configuración con IPv4 forzado a nivel de socket

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// CONFIGURACIÓN TRANSPORTE
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Usamos SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // --- AQUÍ ESTÁ EL TRUCO ---
    // family: 4 obliga a usar IPv4 y prohíbe IPv6.
    // Esto evita que Render intente conectar por la vía que suele fallar.
    family: 4, 
    tls: {
        rejectUnauthorized: false
    },
    // Tiempos de espera para no colgar el servidor
    connectionTimeout: 10000, 
    greetingTimeout: 5000
});

// Verificación al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('🔴 Error de conexión al iniciar:', error);
    } else {
        console.log('🟢 Conexión con Gmail establecida (Modo IPv4)');
    }
});

app.get('/', (req, res) => {
    res.send('Servidor funcionando (IPv4 Force Mode) 🚀');
});

app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    console.log(`\n📨 Mensaje de: ${nombre} (${email})`);

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
        console.log('✅ Enviado correctamente');
        res.status(200).json({ status: 'success', message: 'Correo enviado' });
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        res.status(500).json({ status: 'error', message: 'Error al enviar correo', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en puerto ${PORT}`);
});