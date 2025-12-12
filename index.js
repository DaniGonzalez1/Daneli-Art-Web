// index.js - Solución definitiva para Timeouts en Render (IPv4)

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
// 1. Importamos la librería de sistema DNS
const dns = require('dns'); 

// 2. PARCHE MÁGICO: Obligamos a Node.js a usar IPv4
// Esto evita que Render intente usar IPv6 y se quede colgado
try {
    if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
    }
} catch (e) {
    console.log('Versión de Node antigua, omitiendo configuración DNS');
}

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors()); 

// 3. Volvemos a la configuración "service: gmail"
// Ahora que forzamos IPv4, esta es la forma más segura y compatible
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: {
        rejectUnauthorized: false // Sigue ayudando con los certificados
    }
});

app.get('/', (req, res) => {
    res.send('Servidor de Email funcionando correctamente 🚀');
});

app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    console.log(`\n📨 Recibiendo solicitud de: ${nombre}`);
    console.log(`   Email: ${email}`);

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
        console.log('🚀 Intentando conectar con Gmail...');
        await transporter.sendMail(mailOptions);
        console.log('✅ ¡Correo enviado con éxito!');
        res.status(200).json({ status: 'success', message: 'Correo enviado' });
    } catch (error) {
        console.error('❌ Error fatal enviando correo:', error);
        res.status(500).json({ status: 'error', message: 'Error al enviar correo', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en el puerto ${PORT}`);
    console.log('   Modo IPv4 Forzado activado\n');
});