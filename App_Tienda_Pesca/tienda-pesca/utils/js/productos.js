document.addEventListener("DOMContentLoaded", () => {
  const productosContainer = document.getElementById("productos-container");
  const searchInput = document.getElementById("buscarProducto");
  const categorySelect = document.getElementById("filtroCategoria");
  const priceInput = document.getElementById("filtroPrecio");

  if (!productosContainer || !searchInput || !categorySelect || !priceInput) {
    console.error(
      "❌ Elementos del DOM no encontrados. Verifica los IDs en el HTML."
    );
    return;
  }

  const API_URL = "http://localhost:4000/api/productos/buscar";

  // ✅ Token de demostración (si no hay token en localStorage, usa este)
  const TOKEN_DEMO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Tu token aquí

  let token = localStorage.getItem("token") || TOKEN_DEMO;
  console.log("🛡️ Token utilizado:", token);

  async function cargarProductos() {
    try {
      let filtros = {};

      if (searchInput.value.trim()) {
        filtros.nombre = searchInput.value.trim();
      }
      if (categorySelect.value && categorySelect.value !== "") {
        filtros.categoria = categorySelect.value.normalize("NFC"); // ✅ Normalizar caracteres especiales
      }
      if (
        priceInput.value &&
        !isNaN(priceInput.value) &&
        Number(priceInput.value) > 0
      ) {
        filtros.precioMax = Number(priceInput.value);
      }

      // ✅ Verificar qué valores se están enviando
      console.log("🔍 Filtros enviados:", filtros);

      let queryParams = new URLSearchParams();
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });

      console.log("🌎 URL generada:", `${API_URL}?${queryParams.toString()}`);

      const respuesta = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok)
        throw new Error(
          `❌ Error al obtener los productos: ${respuesta.status}`
        );

      const data = await respuesta.json();
      console.log("✅ Productos recibidos:", data.productos);
      mostrarProductos(data.productos || []);
    } catch (error) {
      console.error("⚠️ Error en cargarProductos:", error);
      productosContainer.innerHTML = `<p class="text-danger">Error al cargar productos.</p>`;
    }
  }

  function mostrarProductos(productos) {
    productosContainer.innerHTML = "";
    if (productos.length === 0) {
      productosContainer.innerHTML = `<p class="text-warning">No se encontraron productos.</p>`;
      return;
    }

    productos.forEach((producto) => {
      const productoHTML = `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
              <h5 class="card-title">${producto.nombre}</h5>
              <p class="card-text">${producto.descripcion}</p>
              <h4 class="text-success">$${producto.precio}</h4>
              <button class="btn btn-success agregar-carrito" 
                data-id="${producto.id}" 
                data-nombre="${producto.nombre}" 
                data-precio="${producto.precio}" 
                data-imagen="${producto.imagen}">Agregar al Carrito</button>
            </div>
          </div>
        </div>`;
      productosContainer.innerHTML += productoHTML;
    });

    document.querySelectorAll(".agregar-carrito").forEach((boton) => {
      boton.addEventListener("click", agregarAlCarrito);
    });
  }

  function agregarAlCarrito(event) {
    const boton = event.target;
    const producto = {
      id: boton.getAttribute("data-id"),
      nombre: boton.getAttribute("data-nombre"),
      precio: boton.getAttribute("data-precio"),
      imagen: boton.getAttribute("data-imagen"),
      cantidad: 1,
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productoExistente = carrito.find((item) => item.id === producto.id);

    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push(producto);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarritoContador();
  }

  function actualizarCarritoContador() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    document.getElementById("carrito-contador").textContent = carrito.length;
  }

  searchInput.addEventListener("input", cargarProductos);
  categorySelect.addEventListener("change", cargarProductos);
  priceInput.addEventListener("input", cargarProductos);

  cargarProductos();
  actualizarCarritoContador();
});
