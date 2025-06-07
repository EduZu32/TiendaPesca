const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const connection = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

// 📌 Middleware para verificar el token
const verificarToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    const tokenSinBearer = token.replace("Bearer ", "");
    const verificado = jwt.verify(tokenSinBearer, JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido" });
  }
};

// Middleware para verificar si el usuario es administrador
const verificarAdmin = (req, res, next) => {
  if (req.usuario.tipo !== "admin") {
    return res.status(403).json({
      message: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }
  next();
};

// 📌 REGISTRO DE USUARIO
router.post(
  "/register",
  [
    body("nombre").not().isEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Debe ser un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    console.log("🟢 Se ha recibido una solicitud en /api/auth/register");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password } = req.body;

    try {
      const [users] = await connection.execute(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
      );
      if (users.length > 0) {
        return res.status(400).json({ message: "El email ya está registrado" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await connection.execute(
        "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
        [nombre, email, hashedPassword]
      );

      res.json({ message: "Usuario registrado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en la tienda.
 *     description: Retorna un token JWT si las credenciales son correctas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna un token JWT.
 *       400:
 *         description: Credenciales incorrectas.
 */

// 📌 INICIO DE SESIÓN
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Debe ser un email válido"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("La contraseña es obligatoria"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users] = await connection.execute(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
      );
      if (users.length === 0) {
        return res.status(400).json({ message: "Credenciales incorrectas" });
      }

      const user = users[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Credenciales incorrectas" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, tipo: user.tipo },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.json({ message: "Inicio de sesión exitoso", token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// 📌 Ruta protegida para obtener perfil del usuario autenticado
router.get("/perfil", verificarToken, async (req, res) => {
  try {
    const [users] = await connection.execute(
      "SELECT id, nombre, email, tipo FROM usuarios WHERE id = ?",
      [req.usuario.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Acceso permitido", usuario: users[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.verificarToken = verificarToken;
module.exports.verificarAdmin = verificarAdmin;
