/* INICIO CARRITO */

// Variables globales
let cartCount = 0;
let total = 0;
let totalCarrito = document.getElementById("totalCarrito");
let noProductos = document.getElementById("noProductos");
let listadoCarrito = document.getElementById("listadoCarrito");

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

// Función para agregar productos al carrito
function addToCart(productoId) {
    cartCount++;
    const cartCountElement = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');

    cartContainer.classList.remove("display-none");
    cartCountElement.textContent = cartCount;

    // Mostrar u ocultar el contenedor basado en el contador
    if (cartCount > 0) {
        cartContainer.style.display = 'flex'; // Muestra el contenedor
    } else {
        cartContainer.style.display = 'none'; // Oculta el contenedor
    }

    fetch(`http://cardelli-backend.vercel.app/api/cardelli/productos/${productoId}`)
        .then((response) => response.json())
        .then((producto) => {
            const newProduct = {
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                medida: producto.Medidas[0].nombre,
                imagen: producto.Fotos_Productos[0].url,
            };

            // Agregar el producto al array de cartItems
            cartItems.push(newProduct);
            saveCartToLocalStorage(cartItems); // Guardar el carrito actualizado en localStorage

            noProductos.classList.add("display-none");

            const modelo = `
                <li>
                    <img src="${newProduct.imagen}"/>
                    <div class="producto-carrito">
                        <h1>${newProduct.nombre}</h1>
                        <p>${newProduct.medida}</p>
                    </div>
                    <p>$${newProduct.precio}</p>
                    <button class="eliminar btn btn-danger" onclick="eliminarP(${newProduct.precio}, '${newProduct.id}')">X</button>
                </li>
            `;

            listadoCarrito.innerHTML += modelo;

            // Calcular el total
            calcTotal(newProduct.precio);

            // Añadir la funcionalidad de eliminación de productos
            attachRemoveEvent();
        })
        .catch((error) => {
            console.error("Error al obtener el producto: ", error);
        });
}

// Función para calcular el total del carrito
const calcTotal = (precio) => {
    total += parseInt(precio);
    let redTotal = parseFloat(total.toFixed(2));
    console.log("el total es: ", total);
    totalCarrito.innerHTML = `$${redTotal}`;
}

// Función para restar el precio al total y eliminar un producto del carrito
const eliminarP = (precio, productId) => {
    total -= parseInt(precio);
    let redTotal = parseFloat(total.toFixed(2));
    totalCarrito.innerHTML = `$${redTotal}`;
    console.log("El total ahora es de: " + total);

    // Eliminar el producto del array de cartItems
    cartItems = cartItems.filter(item => item.id !== productId);
    saveCartToLocalStorage(cartItems); // Guardar el carrito actualizado en localStorage
}

// Función para añadir el evento de eliminar productos al botón 'X'
function attachRemoveEvent() {
    let eliminarCarrito = document.querySelectorAll(".eliminar");
    eliminarCarrito.forEach((boton) => {
        boton.addEventListener("click", () => {
            cartCount--;
            document.getElementById('cart-count').innerHTML = cartCount;
            const lista = boton.parentNode.parentNode;
            const elemento = boton.parentNode;
            lista.removeChild(elemento);
            if (cartCount == 0) {
                noProductos.classList.remove("display-none");
                cartContainer.classList.add("display-none");
            }
        });
    });
}

// Cargar los productos del carrito al cargar la página
window.addEventListener('load', () => {
    const cartItems = loadCartFromLocalStorage();
    cartItems.forEach(item => {
        const modelo = `
            <li>
                <img src="${item.imagen}"/>
                <div class="producto-carrito">
                    <h1>${item.nombre}</h1>
                    <p>${item.medida}</p>
                </div>
                <p>$${item.precio}</p>
                <button class="eliminar btn btn-danger" onclick="eliminarP(${item.precio}, '${item.id}')">X</button>
            </li>
        `;
        listadoCarrito.innerHTML += modelo;
        calcTotal(item.precio);
    });
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

    mensaje += `Total: $${total.toFixed(2)}`; // Añadir el total al mensaje

    const numeroTelefono = "3572538967"; // Número de WhatsApp al que enviar el mensaje
    const mensajeEncoded = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensajeEncoded}`;

    // Abrir WhatsApp con el mensaje
    window.open(urlWhatsApp, "_blank");
}

// Agregar el evento al botón "Comprar"
document.getElementById("compraFinal").addEventListener("click", comprar);
