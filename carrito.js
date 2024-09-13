/* INICIO CARRITO */

// Variables globales
let cartCount = 0;
let total = 0;
let totalCarrito = document.getElementById("totalCarrito");
let noProductos = document.getElementById("noProductos");
let listadoCarrito = document.getElementById("listadoCarrito");
let cartContainer = document.getElementById("cart-container");  // Agrega esto aquí

// Guardar el carrito en localStorage
function saveCartToLocalStorage(cartItems) {
    localStorage.setItem('cart', JSON.stringify(cartItems));
}

// Cargar el carrito desde localStorage
function loadCartFromLocalStorage() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Inicializar el carrito con los productos almacenados en localStorage
let cartItems = loadCartFromLocalStorage();
cartCount = cartItems.length;
document.getElementById('cart-count').textContent = cartCount;

function addToCartFromModal(productoId, precioUnitario) {
    const cantidad = parseInt(document.getElementById('quantity-modal').value);

    // Obtener la medida seleccionada en el modal
    const medidaSelect = document.getElementById('medidasSelectModal');
    const medidaSeleccionada = medidaSelect.options[medidaSelect.selectedIndex].text;

    console.log("Medida seleccionada:", medidaSeleccionada); // Para verificar la medida

    cartCount += cantidad;
    const cartCountElement = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');

    cartContainer.classList.remove("display-none");
    cartCountElement.textContent = cartCount;

    if (cartCount > 0) {
        cartContainer.style.display = 'flex';
    } else {
        cartContainer.style.display = 'none';
    }

    fetch(`https://cardelli-backend.vercel.app/api/cardelli/productos/${productoId}`)
        .then((response) => response.json())
        .then((producto) => {
            const newProduct = {
                id: producto.id,
                nombre: producto.nombre,
                precio: precioUnitario * cantidad,
                medida: medidaSeleccionada,
                imagen: producto.Fotos_Productos[0].url,
                cantidad: cantidad
            };

            console.log("Producto agregado al carrito:", newProduct);

            cartItems.push(newProduct);
            saveCartToLocalStorage(cartItems);

            noProductos.classList.add("display-none");

            const modelo = `
                <li>
                    <img src="${newProduct.imagen}"/>
                    <div class="producto-carrito">
                        <h1>${newProduct.nombre}</h1>
                        <p class="centrar">${newProduct.medida}</p>
                    </div>
                    <div>
                        <p class="cantidad">Cantidad: ${newProduct.cantidad}</p>
                        <p class="precioCarrito">$${newProduct.precio}</p>
                    </div> 
                    <button class="eliminar btn btn-danger" onclick="eliminarP(${newProduct.precio}, '${newProduct.id}', '${newProduct.medida}')">X</button>
                </li>
            `;

            listadoCarrito.innerHTML += modelo;
            calcTotal(newProduct.precio);
        })
        .catch((error) => {
            console.error("Error al obtener el producto: ", error);
        });

    closeModal();
}


// Función para calcular el total del carrito
const calcTotal = (precio) => {
    total += parseInt(precio);
    let redTotal = parseFloat(total);
    console.log("el total es: ", total);
    totalCarrito.innerHTML = `$${redTotal}`;
}

const eliminarP = (precio, productId, medida) => {
    console.log("Intentando eliminar producto con ID:", productId, "y medida:", medida);

    // Log para verificar los IDs y medidas almacenados en el carrito
    console.log("Productos en el carrito:", cartItems.map(item => ({ id: item.id, medida: item.medida })));

    // Restar el precio al total
    total -= parseFloat(precio);
    totalCarrito.innerHTML = `$${total.toFixed(2)}`;
    console.log("Total después de eliminar:", total);

    // Buscar el producto a eliminar en el carrito por su id y medida
    const indexToRemove = cartItems.findIndex(item => item.id.toString() === productId.toString() && item.medida === medida);

    if (indexToRemove !== -1) {
        console.log("Producto encontrado en el array del carrito:", cartItems[indexToRemove]);

        // Restar la cantidad del producto eliminado del contador de carrito
        cartCount -= cartItems[indexToRemove].cantidad;
        document.getElementById('cart-count').innerHTML = cartCount;

        // Eliminar el producto del array `cartItems`
        cartItems.splice(indexToRemove, 1);

        // Guardar el nuevo array de `cartItems` en localStorage
        saveCartToLocalStorage(cartItems);
        console.log("LocalStorage actualizado. Nuevo estado del carrito:", cartItems);

        // Eliminar el producto del DOM
        const itemToRemove = document.querySelector(`button[onclick="eliminarP(${precio}, '${productId}', '${medida}')"]`).closest('li');

        // Verificación si el elemento existe antes de eliminar
        if (itemToRemove) {
            listadoCarrito.removeChild(itemToRemove);
        } else {
            console.log("No se encontró el elemento para eliminar en el DOM.");
        }

        // Verificar si el carrito está vacío para mostrar u ocultar elementos
        if (cartCount === 0) {
            noProductos.classList.remove("display-none");
            cartContainer.classList.add("display-none");
        }

        console.log("Producto eliminado del carrito y DOM actualizado.");
    } else {
        console.log("Producto no encontrado en el carrito, no se eliminó nada.");
    }
};



function attachRemoveEvent() {
    let eliminarCarrito = document.querySelectorAll(".eliminar");

    eliminarCarrito.forEach((boton) => {
        boton.addEventListener("click", () => {
            const precio = boton.getAttribute('data-precio');
            const productId = boton.getAttribute('data-id');

            // Actualiza el contador de productos restando la cantidad correspondiente
            const producto = cartItems.find(item => item.id === productId);
            if (producto) {
                cartCount -= producto.cantidad;
                document.getElementById('cart-count').innerHTML = cartCount;
                
                // Actualizar el total del carrito
                total -= producto.precio;
                let redTotal = parseFloat(total.toFixed(2));
                totalCarrito.innerHTML = `$${redTotal}`;
                console.log("El total ahora es de: " + total);

                // Eliminar el producto del array de cartItems
                cartItems = cartItems.filter(item => item.id !== productId);

                // Guardar el carrito actualizado en localStorage
                saveCartToLocalStorage(cartItems);
            }

            // Eliminar el producto del DOM
            const lista = boton.parentNode.parentNode;
            const elemento = boton.parentNode;
            lista.removeChild(elemento);

            // Mostrar u ocultar los mensajes según la cantidad de productos en el carrito
            if (cartCount == 0) {
                noProductos.classList.remove("display-none");
                cartContainer.classList.add("display-none");
            }

            console.log("Producto eliminado del carrito y localStorage actualizado.");
        });
    });
}


// Función para cargar el carrito al recargar la página
window.addEventListener('load', () => {
    const cartItems = loadCartFromLocalStorage();
    console.log("Cargando productos del carrito desde localStorage:", cartItems);

    cartItems.forEach(item => {
        const modelo = `
            <li>
                <img src="${item.imagen}"/>
                <div class="producto-carrito">
                    <h1>${item.nombre}</h1>
                    <p class="centrar">${item.medida}</p>
                </div>
                <div>
                    <p class="cantidad">Cantidad: ${item.cantidad}</p>
                    <p class="precioCarrito">$${item.precio}</p>
                </div>
                <button class="eliminar btn btn-danger" onclick="eliminarP(${item.precio}, '${item.id}', '${item.medida}')">X</button>
            </li>
        `;
        listadoCarrito.innerHTML += modelo;
        calcTotal(item.precio);
    });

    console.log("Productos cargados en el DOM. Total actual:", total);

    attachRemoveEvent(); // Volver a añadir los eventos de eliminación
});

// Agregar un evento a los botones "Añadir al carrito"
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => addToCart(button.dataset.productId));
});

// Función para salir del carrito
let salirCarrito = document.getElementById("salirCarrito");
salirCarrito.addEventListener("click", () => {
    pantallaCarrito.classList.add("display-none");
    pantallaFondoCarr.classList.add("display-none");
});

let pantallaFondoCarr = document.getElementById("pantallaFondoCarr");
pantallaFondoCarr.addEventListener("click", () => {
    pantallaCarrito.classList.add("display-none");
    pantallaFondoCarr.classList.add("display-none");
});

// Función para abrir el carrito
let carrito = document.querySelector('.shop-cart-icono');
carrito.addEventListener("click", () => {
    pantallaCarrito.classList.remove("display-none");
    pantallaFondoCarr.classList.remove("display-none");
});


// Función para vaciar el carrito
function vaciarCarrito() {
    // Vaciar el array de productos
    cartItems = [];
    // Actualizar el localStorage
    saveCartToLocalStorage(cartItems);
    // Vaciar el contenido del listado en la interfaz
    listadoCarrito.innerHTML = '';
    // Resetear el total
    total = 0;
    totalCarrito.innerHTML = `$${total}`;
    // Reiniciar el contador del carrito
    cartCount = 0;
    document.getElementById('cart-count').textContent = cartCount;
    // Mostrar el mensaje de "NO TIENES PRODUCTOS AGREGADOS"
    noProductos.classList.remove("display-none");
    // Ocultar el contenedor del carrito
    const cartContainer = document.getElementById('cart-container');
    cartContainer.style.display = 'none'; 
}

// Evento para vaciar el carrito
document.getElementById('vaciarCarrito').addEventListener('click', vaciarCarrito);



// Función para manejar la compra y enviar mensaje a WhatsApp
function comprar() {
    if (cartItems.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let mensaje = "NUEVO PEDIDO:\n";
    let total = 0;

    cartItems.forEach(item => {
        mensaje += `Producto: ${item.nombre}\nMedida: ${item.medida}\nPrecio: $${item.precio}\n\n`;
        total += parseFloat(item.precio);
    });

    mensaje += `Total: $${total}`; // Añadir el total al mensaje

    const numeroTelefono = "3572538967"; // Número de WhatsApp al que enviar el mensaje
    const mensajeEncoded = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensajeEncoded}`;

    // Abrir WhatsApp con el mensaje
    window.open(urlWhatsApp, "_blank");
}

// Agregar el evento al botón "Comprar"
document.getElementById("compraFinal").addEventListener("click", comprar);
