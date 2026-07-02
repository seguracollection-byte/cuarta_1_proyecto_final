const mysql = require('mysql2/promise');

// Configuración limpia utilizando promesas de manera nativa
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Carlos2026', // 👈 Coloca aquí la contraseña real de tu MariaDB
  database: 'barberia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportamos directamente el pool para que responda a db.query() en las rutas
module.exports = pool;