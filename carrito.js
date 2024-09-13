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

// Función para agregar al carrito desde el modal
function addToCartFromModal(productoId, precioUnitario) {
    const cantidad = parseInt(document.getElementById('quantity-modal').value);

    // Obtener la medida seleccionada en el modal
    const medidaSelect = document.getElementById('medidasSelectModal');
    const medidaSeleccionada = medidaSelect.options[medidaSelect.selectedIndex].text;  // El nombre de la medida seleccionada

    // Restante código similar al addToCart, pero considerando la cantidad y multiplicando el precio
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
                precio: precioUnitario * cantidad,  // Multiplicar por la cantidad
                medida: medidaSeleccionada,  // Guardar la medida seleccionada
                imagen: producto.Fotos_Productos[0].url,
                cantidad: cantidad  // Guardar la cantidad
            };

            cartItems.push(newProduct);
            saveCartToLocalStorage(cartItems);

            noProductos.classList.add("display-none");

            const modelo = `
                <li>
                    <img src="${newProduct.imagen}"/>
                    <div class="producto-carrito">
                        <h1>${newProduct.nombre}</h1>
                        <p class="centrar">${newProduct.medida}</p> <!-- Mostrar la medida seleccionada -->
                    </div>
                    <div>
                        <p class="cantidad">Cantidad: ${newProduct.cantidad}</p> <!-- Mostrar la cantidad -->
                        <p class="precioCarrito">$${newProduct.precio}</p> <!-- Mostrar el precio multiplicado -->
                    </div> 
                    <button class="eliminar btn btn-danger" onclick="eliminarP(${newProduct.precio}, '${newProduct.id}')">X</button>
                </li>
            `;

            listadoCarrito.innerHTML += modelo;
            calcTotal(newProduct.precio);
        })
        .catch((error) => {
            console.error("Error al obtener el producto: ", error);
        });

    // Cerrar el modal
    closeModal();
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
                    <p class="centrar">${item.medida}</p>
                </div>
                <div>
                    <p class="cantidad">Cantidad: ${item.cantidad}</p> <!-- Mostrar la cantidad -->
                    <p class="precioCarrito">$${item.precio}</p>
                </div>
                <button class="eliminar btn btn-danger" onclick="eliminarP(${item.precio}, '${item.id}')">X</button>
            </li>
        `;
        listadoCarrito.innerHTML += modelo;
        calcTotal(item.precio);
    });
    attachRemoveEvent(); // Volver a añadir los eventos de eliminación
        // Si hay productos en el carrito, ocultar el mensaje de "No tienes productos agregados"
        if (cartItems.length > 0) {
            noProductos.classList.add("display-none");  // Ocultar el mensaje de "No tienes productos agregados"
            cartContainer.classList.remove("display-none");  // Mostrar el contenedor del carrito
            divTotal.style.display = 'block';  // Mostrar el total
        } else {
            noProductos.classList.remove("display-none");  // Mostrar el mensaje de "No tienes productos agregados"
            cartContainer.classList.add("display-none");   // Ocultar el contenedor del carrito
            divTotal.style.display = 'none';  // Ocultar el total
        }
    
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
    totalCarrito.innerHTML = `$${total.toFixed(2)}`;
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

    mensaje += `Total: $${total.toFixed(2)}`; // Añadir el total al mensaje

    const numeroTelefono = "3572538967"; // Número de WhatsApp al que enviar el mensaje
    const mensajeEncoded = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensajeEncoded}`;

    // Abrir WhatsApp con el mensaje
    window.open(urlWhatsApp, "_blank");
}

// Agregar el evento al botón "Comprar"
document.getElementById("compraFinal").addEventListener("click", comprar);
