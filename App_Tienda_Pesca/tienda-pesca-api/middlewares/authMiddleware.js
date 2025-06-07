const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

// Middleware para verificar el token
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
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
};

module.exports = { verificarToken, verificarAdmin };
