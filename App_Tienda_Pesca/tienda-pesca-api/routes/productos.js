const express = require("express");
const router = express.Router();
const connection = require("../config/db");
const {
  verificarToken,
  verificarAdmin,
} = require("../middlewares/authMiddleware");

// 📌 Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const [productos] = await connection.execute("SELECT * FROM productos");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/productos/buscar:
 *   get:
 *     summary: Buscar productos con filtros, ordenación y paginación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del producto.
 *       - in: query
 *         name: precioMin
 *         schema:
 *           type: number
 *         description: Precio mínimo.
 *       - in: query
 *         name: precioMax
 *         schema:
 *           type: number
 *         description: Precio máximo.
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría.
 *       - in: query
 *         name: stockMin
 *         schema:
 *           type: integer
 *         description: Filtrar por cantidad mínima de stock.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de productos por página.
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Número de productos a omitir (para paginación).
 *     responses:
 *       200:
 *         description: Lista de productos filtrados.
 *       500:
 *         description: Error en el servidor.
 */
// 📌 Buscar productos con filtros, ordenación y paginación
router.get("/buscar", async (req, res) => {
  try {
    const {
      nombre,
      precioMin,
      precioMax,
      categoria,
      fechaInicio,
      fechaFin,
      stockMin,
      limit,
      offset,
      ordenarPor,
      orden,
    } = req.query;

    let queryBase = "FROM productos WHERE 1=1";
    let params = [];

    // ✅ Si hay nombre, filtrar por coincidencia
    if (nombre) {
      queryBase += " AND nombre LIKE ?";
      params.push(`%${nombre}%`);
    }

    // ✅ Filtrar por precio mínimo y máximo
    if (precioMin) {
      queryBase += " AND precio >= ?";
      params.push(Number(precioMin));
    }
    if (precioMax) {
      queryBase += " AND precio <= ?";
      params.push(Number(precioMax));
    }

    // ✅ Filtrar por stock mínimo
    if (stockMin) {
      queryBase += " AND stock >= ?";
      params.push(Number(stockMin));
    }

    // ✅ Filtrar por categoría (decodificar para evitar errores con caracteres especiales)
    if (categoria) {
      const categoriaDecodificada = decodeURIComponent(categoria);
      queryBase += " AND categoria = ?";
      params.push(categoriaDecodificada);
    }
    

    // ✅ Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
      queryBase += " AND fecha_creacion BETWEEN ? AND ?";
      params.push(fechaInicio, fechaFin);
    }

    // ✅ Obtener el total de productos antes de aplicar paginación
    const [totalProductos] = await connection.execute(
      `SELECT COUNT(*) as total ${queryBase}`,
      params
    );

    // 📌 Construir la consulta final con ordenación y paginación
    let query = `SELECT * ${queryBase}`;

    // 📌 Aplicar ordenación si se especifica
    const columnasValidas = ["precio", "stock", "fecha_creacion"];
    if (ordenarPor && columnasValidas.includes(ordenarPor)) {
      const ordenValido = orden === "DESC" ? "DESC" : "ASC";
      query += ` ORDER BY ${ordenarPor} ${ordenValido}`;
    }

    // 📌 Aplicar paginación si se especifica
    if (limit) {
      query += " LIMIT ?";
      params.push(Number(limit));
    }
    if (offset) {
      query += " OFFSET ?";
      params.push(Number(offset));
    }

    // 📌 Ejecutar la consulta y devolver resultados
    const [productos] = await connection.execute(query, params);

    res.json({
      total: totalProductos[0].total,
      count: productos.length,
      productos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: Permite a los administradores agregar nuevos productos a la tienda.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - precio
 *               - imagen
 *               - stock
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Caña Shimano XT"
 *               descripcion:
 *                 type: string
 *                 example: "Caña de pesca ultraligera con tecnología avanzada."
 *               precio:
 *                 type: number
 *                 example: 149.99
 *               imagen:
 *                 type: string
 *                 example: "utils/img/cana_shimano_xt.jpg"
 *               stock:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Producto creado exitosamente.
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto creado exitosamente"
 *       400:
 *         description: Datos inválidos o incompletos.
 *         content:
 *           application/json:
 *             examples:
 *               CamposFaltantes:
 *                 summary: Falta algún campo obligatorio
 *                 value:
 *                   message: "Todos los campos son obligatorios"
 *               PrecioInvalido:
 *                 summary: El precio debe ser positivo
 *                 value:
 *                   message: "El precio debe ser un número positivo"
 *               StockInvalido:
 *                 summary: Stock debe ser mayor o igual a 0
 *                 value:
 *                   message: "El stock debe ser un número mayor o igual a 0"
 *       403:
 *         description: No autorizado. Se requieren permisos de administrador.
 *         content:
 *           application/json:
 *             example:
 *               message: "No autorizado. Se requieren permisos de administrador."
 *       500:
 *         description: Error en el servidor.
 */

// 📌 Middleware para validar los campos del producto
const validarProducto = (req, res, next) => {
  const { nombre, descripcion, precio, imagen, stock } = req.body;

  if (!nombre || !descripcion || !precio || !imagen || !stock) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  if (typeof precio !== "number" || precio <= 0) {
    return res
      .status(400)
      .json({ message: "El precio debe ser un número positivo" });
  }

  if (typeof stock !== "number" || stock < 0) {
    return res
      .status(400)
      .json({ message: "El stock debe ser un número mayor o igual a 0" });
  }

  next(); // Continúa con la ejecución del endpoint si la validación pasa
};

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags:
 *       - Productos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *       500:
 *         description: Error en el servidor
 */

// 📌 Obtener todos los productos (solo usuarios autenticados)
router.get("/", verificarToken, async (req, res) => {
  try {
    const [productos] = await connection.execute("SELECT * FROM productos");
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */

// 📌 Obtener un producto por ID (Accesible por cualquier usuario autenticado)
router.get("/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags:
 *       - Productos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagen:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error en el servidor
 */
// 📌 Crear un nuevo producto (solo administradores)
router.post(
  "/",
  verificarToken,
  verificarAdmin,
  validarProducto,
  async (req, res) => {
    const { nombre, descripcion, precio, imagen, stock } = req.body;

    try {
      await connection.execute(
        "INSERT INTO productos (nombre, descripcion, precio, imagen, stock) VALUES (?, ?, ?, ?, ?)",
        [nombre, descripcion, precio, imagen, stock]
      );
      res.status(201).json({ message: "Producto creado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto por ID
 *     tags:
 *       - Productos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error en el servidor
 */

// 📌 Eliminar un producto (Solo Admin)
router.delete("/:id", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Verificamos si el producto existe antes de eliminarlo
    const [producto] = await connection.execute(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si el producto existe, procedemos a eliminarlo
    await connection.execute("DELETE FROM productos WHERE id = ?", [id]);

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     description: Permite a los administradores actualizar los datos de un producto existente en la tienda.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - precio
 *               - imagen
 *               - stock
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Caña Shimano XT"
 *               descripcion:
 *                 type: string
 *                 example: "Nueva versión mejorada de la caña Shimano XT."
 *               precio:
 *                 type: number
 *                 example: 159.99
 *               imagen:
 *                 type: string
 *                 example: "utils/img/cana_shimano_xt_v2.jpg"
 *               stock:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto actualizado correctamente"
 *       400:
 *         description: Datos inválidos o incompletos.
 *         content:
 *           application/json:
 *             examples:
 *               CamposFaltantes:
 *                 summary: Falta algún campo obligatorio
 *                 value:
 *                   message: "Todos los campos son obligatorios"
 *               PrecioInvalido:
 *                 summary: El precio debe ser positivo
 *                 value:
 *                   message: "El precio debe ser un número positivo"
 *               StockInvalido:
 *                 summary: Stock debe ser mayor o igual a 0
 *                 value:
 *                   message: "El stock debe ser un número mayor o igual a 0"
 *       403:
 *         description: No autorizado. Se requieren permisos de administrador.
 *         content:
 *           application/json:
 *             example:
 *               message: "No autorizado. Se requieren permisos de administrador."
 *       404:
 *         description: Producto no encontrado.
 *         content:
 *           application/json:
 *             example:
 *               message: "Producto no encontrado"
 *       500:
 *         description: Error en el servidor.
 */
// 📌 Actualizar un producto (Solo administradores)
router.put(
  "/:id",
  verificarToken,
  verificarAdmin,
  validarProducto,
  async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen, stock } = req.body;

    try {
      // Verificar si el producto existe antes de actualizarlo
      const [producto] = await connection.execute(
        "SELECT * FROM productos WHERE id = ?",
        [id]
      );

      if (producto.length === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Actualizar el producto
      await connection.execute(
        "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen = ?, stock = ? WHERE id = ?",
        [nombre, descripcion, precio, imagen, stock, id]
      );

      res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
