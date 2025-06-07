const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerDocs = require("./config/swagger");

const app = express();
const DEFAULT_PORT = process.env.PORT || 4000;

// 📌 Middleware
app.use(cors());
app.use(express.json());

// 📌 Servir archivos estáticos desde la carpeta "tienda-pesca"
const staticPath = path.join(__dirname, "../tienda-pesca");
app.use(express.static(staticPath));
console.log(`📂 Serviendo archivos estáticos desde: ${staticPath}`);

// 📌 Ruta principal para servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// 📌 Importar rutas de la API
const authRoutes = require("./routes/auth");
const productosRoutes = require("./routes/productos");
const usuariosRoutes = require("./routes/usuarios");

// 📌 Importar middleware de autenticación correctamente
const {
  verificarToken,
  verificarAdmin,
} = require("./middlewares/authMiddleware");

// 📌 Definir rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/usuarios", usuariosRoutes);

// 📌 Configurar Swagger después de definir las rutas
swaggerDocs(app);

// 📌 Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// 📌 Manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// 📌 Función para iniciar el servidor y manejar puertos ocupados
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Servidor API corriendo en http://localhost:${port}`);
    console.log(
      `📄 Documentación disponible en http://localhost:${port}/api-docs`
    );
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(
        `⚠️ El puerto ${port} está en uso, intentando con el siguiente...`
      );
      startServer(port + 1);
    } else {
      console.error("❌ Error al iniciar el servidor:", err);
    }
  });
};

// 📌 Iniciar servidor en el puerto predeterminado
startServer(DEFAULT_PORT);
