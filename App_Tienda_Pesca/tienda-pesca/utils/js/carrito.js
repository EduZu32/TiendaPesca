document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.getElementById("carrito-container");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    carritoContainer.innerHTML = `<p class="text-center text-danger">El carrito está vacío.</p>`;
    return;
  }

  carritoContainer.innerHTML = ""; // Limpiamos antes de agregar los productos

  carrito.forEach((producto, index) => {
    const productoHTML = `
          <div class="col-md-4 mb-4">
              <div class="card shadow-sm">
                  <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                  <div class="card-body">
                      <h5 class="card-title">${producto.nombre}</h5>
                      <p class="card-text">Precio: <strong>$${producto.precio}</strong></p>
                      <p class="card-text">Cantidad: ${producto.cantidad}</p>
                      <button class="btn btn-danger btn-sm eliminar-producto" data-index="${index}">
                          Eliminar
                      </button>
                  </div>
              </div>
          </div>
      `;
    carritoContainer.innerHTML += productoHTML;
  });

  // Evento para eliminar productos individuales
  document.querySelectorAll(".eliminar-producto").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      carrito.splice(index, 1); // Elimina el producto del array
      localStorage.setItem("carrito", JSON.stringify(carrito)); // Guarda el carrito actualizado
      location.reload(); // Recarga la página para actualizar la vista
    });
  });

  // Vaciar carrito
  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.removeItem("carrito");
    location.reload();
  });

  // Finalizar compra
  document.getElementById("finalizar-compra").addEventListener("click", () => {
    alert("Compra realizada con éxito");
    localStorage.removeItem("carrito");
    location.reload();
  });
});
