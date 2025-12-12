exports.handler = async function (event) {
  // 1. Solo permitir peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método no permitido',
    };
  }

  try {
        // 2. Obtener las variables secretas del entorno
        const { N8N_URL, N8N_API_KEY } = process.env;
        
        // 3. (MODIFICADO) Parsear el cuerpo de la petición sin asumir su contenido
        const body = JSON.parse(event.body);

        let targetUrl;
        let responseBody = {};

        // 4. (NUEVO) Lógica de enrutamiento: decide a qué webhook llamar
        if (body.body) {
            // --- CASO A: Es una pregunta para el chatbot ---
            targetUrl = N8N_URL;
            
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'API-KEY': `${N8N_API_KEY}`
                },
                body: body // Enviamos solo la pregunta
            });

            responseBody = await response.json();

        } 
        // 5. Devolver la respuesta al cliente
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Cambia a tu dominio en producción
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(responseBody),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno en el servidor proxy.' }),
        };
    }
};