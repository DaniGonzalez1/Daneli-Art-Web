// index.js - Backend con Zona Horaria y Newsletter

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); 

// 1. URL para Formulario de Contacto
const N8N_CONTACTO_URL = process.env.N8N_API_KEY;

// 2. NUEVA URL para Newsletter (Asegúrate de agregarla en tu .env y en Render)
const N8N_NEWSLETTER_URL = process.env.N8N_NEWSLETTER_URL;

app.get('/', (req, res) => {
    res.send('Backend Daneli funcionando (Contacto + Newsletter) 🚀');
});

// --- RUTA 1: Formulario de Contacto (Existente) ---
app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    
    console.log(`\n📨 Nuevo contacto recibido: ${nombre}`);

    if (!N8N_CONTACTO_URL) {
        console.error('❌ Error CRÍTICO: Falta N8N_API_KEY en Render');
        return res.status(500).json({ status: 'error', message: 'Error de configuración (Contacto)' });
    }

    try {
        const fechaChile = new Date().toLocaleString('es-CL', { 
            timeZone: 'America/Santiago',
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        console.log(`🚀 Enviando contacto a n8n...`);
        
        const response = await fetch(N8N_CONTACTO_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, mensaje, fecha: fechaChile })
        });

        if (response.ok) {
            res.status(200).json({ status: 'success', message: 'Mensaje procesado' });
        } else {
            res.status(500).json({ status: 'error', message: 'Error en n8n Contacto' });
        }

    } catch (error) {
        console.error('❌ Error conexión Contacto:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al conectar con n8n' });
    }
});

// --- RUTA 2: Suscripción a Newsletter (NUEVA) ---
app.post('/newsletter', async (req, res) => {
    // Generalmente para newsletter solo pedimos email, pero puedes pedir nombre si quieres
    const { email } = req.body;
    
    console.log(`\n📰 Nueva suscripción a Newsletter: ${email}`);

    if (!N8N_NEWSLETTER_URL) {
        console.error('❌ Error CRÍTICO: Falta N8N_NEWSLETTER_URL en Render');
        return res.status(500).json({ status: 'error', message: 'Error de configuración (Newsletter)' });
    }

    if (!email || !email.includes('@')) {
        return res.status(400).json({ status: 'error', message: 'Email inválido' });
    }

    try {
        const fechaChile = new Date().toLocaleString('es-CL', { 
            timeZone: 'America/Santiago',
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric', year: 'numeric'
        });

        // Enviamos el email a tu flujo de n8n del Newsletter
        const response = await fetch(N8N_NEWSLETTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email,
                origen: 'Web Portfolio', // Útil para saber de dónde vino el lead
                fecha: fechaChile
            })
        });

        if (response.ok) {
            console.log('✅ Suscripción enviada a n8n correctamente');
            res.status(200).json({ status: 'success', message: 'Suscripción exitosa' });
        } else {
            console.error('⚠️ Error respuesta n8n Newsletter');
            res.status(500).json({ status: 'error', message: 'Error al procesar suscripción' });
        }

    } catch (error) {
        console.error('❌ Error conexión Newsletter:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en puerto ${PORT}`);
});