// index.js - Backend que conecta tu web con n8n
// Este código recibe el formulario y se lo pasa a n8n para que envíe el correo.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); 

//  URL DE N8N 
const N8N_URL = process.env.N8N_API_KEY;

app.get('/', (req, res) => {
    res.send('Backend Daneli (Conectado a n8n) 🚀');
});

app.post('/send-email', async (req, res) => {
    const { nombre, email, mensaje } = req.body;
    console.log(`\n📨 Recibiendo mensaje de: ${nombre}`);

    // Validamos que n8n esté configurado
    if (!N8N_URL) {
        console.error('❌ Error: Falta la URL de n8n en el archivo .env');
        return res.status(500).json({ status: 'error', message: 'Error de configuración en el servidor' });
    }

    try {
        // En lugar de enviar el correo nosotros, le pedimos a n8n que lo haga
        // Esto es mucho más rápido y no da errores de Timeout en Render.
        const response = await fetch(N8N_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                mensaje: mensaje,
                fecha: new Date().toLocaleString()
            })
        });

        if (response.ok) {
            console.log('✅ Datos enviados a n8n correctamente');
            res.status(200).json({ status: 'success', message: 'Mensaje procesado' });
        } else {
            console.error('⚠️ n8n respondió con error:', response.status);
            res.status(500).json({ status: 'error', message: 'Error al procesar mensaje' });
        }

    } catch (error) {
        console.error('❌ Error de conexión con n8n:', error);
        res.status(500).json({ status: 'error', message: 'Error de conexión', error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor listo en puerto ${PORT}`);
});