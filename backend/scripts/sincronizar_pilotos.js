/* Testing para pasar datos de una API a una base de datos */

const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config({path: '.env'}); 

async function sincronizarPilotos() {
    
    console.log('Conectando a la base de datos...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('Conexión a la base de datos establecida.');

    try {
        const sessionKey = process.env.OPENF1_SESSION_KEY;
        const url = `${process.env.OPENF1_API_URL}/drivers?session_key=${sessionKey}`;

        console.log('Sincronizando pilotos...');

        const response = await axios.get(url);
        const pilotos = response.data;

        console.log('Pilotos sincronizados.');

        console.log('Guardando pilotos en la base de datos...');

        const sql = 
            `INSERT INTO real_drivers (driver_number, full_name, team_name, team_colour, country_code) 
            VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
            full_name = VALUES(full_name), 
            team_name = VALUES(team_name), 
            team_colour = VALUES(team_colour), 
            country_code = VALUES(country_code)
            `;

        for (const p of pilotos) {

            await connection.execute(sql, 
                [p.driver_number || null, 
                p.full_name || null, 
                p.team_name || null, 
                p.team_colour || null, 
                p.country_code || null]);

            console.log(`Piloto ${p.driver_number} guardado en la base de datos.`);
        }
    } catch (error) {
        console.error('Error al sincronizar pilotos:', error);
    } finally {
        connection.end();
    }
}

sincronizarPilotos();