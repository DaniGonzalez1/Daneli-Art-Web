// index.js - Backend con Zona Horaria 

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); 

// Leemos la URL de n8n
const N8N_URL = process.env.N8N_API_KEY;

app.get('/', (req, res) => {
    res.send('Backend Daneli funcionando (Hora CL arreglada) 🚀');
});

app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    
    console.log(`\n📨 Nuevo contacto recibido: ${nombre}`);

    if (!N8N_URL) {
        console.error('❌ Error CRÍTICO: Falta N8N_WEBHOOK_URL en Render');
        return res.status(500).json({ status: 'error', message: 'Error de configuración' });
    }

    try {
       
        // Forzamos al servidor a generar la fecha en hora de Chile
        const fechaChile = new Date().toLocaleString('es-CL', { 
            timeZone: 'America/Santiago', // Zona horaria de Chile
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });

        console.log(`🚀 Enviando a n8n con fecha: ${fechaChile}`);
        
        const response = await fetch(N8N_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                mensaje: mensaje,
                fecha: fechaChile 
            })
        });

        if (response.ok) {
            res.status(200).json({ status: 'success', message: 'Mensaje procesado' });
        } else {
            res.status(500).json({ status: 'error', message: 'Error en n8n' });
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al conectar con n8n' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en puerto ${PORT}`);
});