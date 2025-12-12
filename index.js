// index.js - El cerebro de tu formulario

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); 

// Configuración del servicio de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
  
    tls: {
        rejectUnauthorized: false
    }
  
});

// Ruta principal
app.get('/', (req, res) => {
    res.send('Servidor de Email funcionando correctamente 🚀');
});

// Ruta para enviar el email
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
        console.error('❌ Error enviando correo:', error); // Aquí veremos si falla
        res.status(500).json({ status: 'error', message: 'Error al enviar correo', error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en http://localhost:${PORT}`);
});