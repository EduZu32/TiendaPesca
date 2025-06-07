const express = require("express");
const router = express.Router();
const connection = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  verificarToken,
  verificarAdmin,
} = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios (solo administradores).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *       403:
 *         description: No autorizado.
 *       500:
 *         description: Error en el servidor.
 */

// 📌 Obtener todos los usuarios (solo administradores)
router.get("/", verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [usuarios] = await connection.execute(
      "SELECT id, nombre, email, tipo FROM usuarios"
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor.
 */

// 📌 Obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const [usuario] = await connection.execute(
      "SELECT id, nombre, email, tipo FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );
    if (usuario.length === 0) {
      // ✅ Corregido el error de "lenght"
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Acceso correcto", usuario: usuario[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/usuarios/registro:
 *   post:
 *     summary: Registrar un nuevo usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 example: "juan@email.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente.
 *       400:
 *         description: Datos inválidos.
 *       500:
 *         description: Error en el servidor.
 */
router.post("/registro", async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const [existe] = await connection.execute(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    if (existe.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    await connection.execute(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exportar el router correctamente
module.exports = router;
