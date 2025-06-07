const mysql = require("mysql2");
require("dotenv").config();

console.log("🔄 Intentando conectar con la base de datos...");

const connection = mysql
  .createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "tienda_pesca",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

connection
  .getConnection()
  .then(() => console.log("✅ Conexión exitosa a MySQL"))
  .catch((err) => console.error("❌ Error conectando a MySQL:", err));

module.exports = connection;
