// index.js - Backend Seguro (CORS + Anti-Spam) con Zona Horaria y Newsletter

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Nueva librería de seguridad
require('dotenv').config();

const app = express();

// ==========================================
// 1. SEGURIDAD: CONFIGURACIÓN DE CORS
// ==========================================
// Lista de sitios permitidos (Tu Netlify y tu Localhost)
const allowedOrigins = [
    'https://daneli-art.netlify.app', // Tu frontend en producción
    'http://localhost:3000',          // Tu backend local
    'http://127.0.0.1:5500',          // Live Server de VS Code
    'http://localhost:5500'           // Live Server alternativo
];

app.use(cors({
    origin: function (origin, callback) {
        // !origin permite peticiones sin origen (como desde Postman local o server-to-server)
        // Si quieres bloquear Postman en prod, quita "|| !origin"
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("🚫 Bloqueado por CORS:", origin);
            callback(new Error('Acceso bloqueado por seguridad (CORS)'));
        }
    }
}));

app.use(express.json());

// ==========================================
// 2. SEGURIDAD: LIMITADOR DE VELOCIDAD (Anti-Spam)
// ==========================================
// Regla: Máximo 10 peticiones cada 15 minutos por IP
const spamLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Límite de 10 intentos
    message: { 
        status: 'error', 
        message: 'Has enviado demasiadas solicitudes. Por favor espera 15 minutos.' 
    },
    standardHeaders: true, // Devuelve info en los headers `RateLimit-*`
    legacyHeaders: false,
});

// Aplicamos el candado anti-spam a las rutas de envío
app.use('/send-email', spamLimiter);
app.use('/newsletter', spamLimiter);


// ==========================================
// LÓGICA DEL SERVIDOR
// ==========================================

// 1. URL para Formulario de Contacto
const N8N_CONTACTO_URL = process.env.N8N_API_KEY;

// 2. URL para Newsletter
const N8N_NEWSLETTER_URL = process.env.N8N_NEWSLETTER_URL;

app.get('/', (req, res) => {
    res.send('Backend Daneli Seguro 🔒 funcionando (Contacto + Newsletter) 🚀');
});

// --- RUTA 1: Formulario de Contacto ---
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

// --- RUTA 2: Suscripción a Newsletter ---
app.post('/newsletter', async (req, res) => {
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
    console.log(`\n🚀 Servidor seguro listo en puerto ${PORT}`);
});