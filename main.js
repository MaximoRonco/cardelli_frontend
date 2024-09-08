//Menu hamburguesa login y carrusel de imagenes del cliente

// SweetAlert

function sweet(icon, text) {
    Swal.fire({
        icon: icon,
        text: text
    });
}


/* menu hamburguesa */
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
    const overlay = document.querySelector('.overlay');
    const menuClose = document.querySelector('.menu-close');

    // Abrir menú al hacer clic en el botón de menú
    menuToggle.addEventListener('click', function(event) {
        navegacion.classList.toggle('show');
        overlay.classList.toggle('show');
        event.stopPropagation();
    });

    // Cerrar menú al hacer clic en la cruz
    menuClose.addEventListener('click', function() {
        navegacion.classList.remove('show');
        overlay.classList.remove('show');
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        if (!navegacion.contains(event.target) && !menuToggle.contains(event.target)) {
            navegacion.classList.remove('show');
            overlay.classList.remove('show');
        }
    });

    // Evitar que el clic dentro del menú cierre el menú
    navegacion.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});



// Login
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validar campos vacíos
    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, ingrese el nombre de usuario y la contraseña.',
            customClass: {
                container: 'my-swal-container'
            }
        });
        return; // Detener la ejecución si hay campos vacíos
    }

    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: username, password: password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Almacenar el token en localStorage
            localStorage.setItem('authToken', data.token);

            // Mensaje de éxito y redirección
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo...',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    container: 'my-swal-container'
                }
            }).then(() => {
                localStorage.setItem('loggedIn', 'true'); // Guardar el estado de la sesión
                window.location.href = 'carrusel-admin.html';
            });
        } else {
            // Manejo de errores de autenticación
            sweet("error",data.error || "Nombre de usuario o contraseña incorrectos");
        }
        
    } catch (error) {
        console.error('Error durante el login:', error);
        sweet("error","Nombre de usuario o contraseña incorrectos");
    }
}

/* ACA CAMBIA EL TOKEN EN EL HEADER */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Token not found');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Eliminar 'Content-Type' si el body es una instancia de FormData
    if (options.body instanceof FormData) {
        delete options.headers['Content-Type'];
    } else {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);
    let data;
    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }
    return { data, ok: response.ok };
}

// Verificar si el usuario ha iniciado sesión
function checkLoginStatus() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        alert('Debe iniciar sesión para acceder a esta página.');
        window.location.href = 'sesion.html'; // Redirigir a la página de inicio de sesión
    }
}

// Ejecutar la verificación de sesión solo en index-admin.html y menu-admin.html
if (window.location.pathname.endsWith('carrusel-admin.html') ||  window.location.pathname.endsWith('medidas-admin.html') ||  window.location.pathname.endsWith('ofertas-admin.html') ||  window.location.pathname.endsWith('productos-admin.html') ) {
    checkLoginStatus();
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('loggedIn'); // Eliminar el estado de la sesión
}
/* FIN INCIO DE SESION */



/* Inicio Carrusel */
/*
//Establece la duracion del carrusel
document.addEventListener('DOMContentLoaded', () => {
    // Función para inicializar el carrusel
    const initializeCarousel = () => {
        const carousel = new bootstrap.Carousel(document.querySelector('#carouselExampleFade'), {
            interval: 3000, // Intervalo de 2 segundos
            ride: 'carousel'
        });
    };
    initializeCarousel();
});

/*llamada al carrusel */

async function fetchCarrusel() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/carrusel/images/urls');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        displayCarrusel(data);
    } catch (error) {
        console.error('Error fetching the carrusel:', error);
    }
}

function displayCarrusel(data) {
    const carouselInner = document.getElementById('carousel-inner');
    carouselInner.innerHTML = ''; // Clear existing content

    data.forEach((url, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item';
        if (index === 0) {
            itemDiv.classList.add('active');
        }
        const img = document.createElement('img');
        img.src = url;
        img.className = 'd-block w-100';
        itemDiv.appendChild(img);
        carouselInner.appendChild(itemDiv);
    });
}

/* Fin Carrusel */


/* Traer productos a la pagina principal */

/*GET DE PRODUCTOS*/
async function fetchProductos() {
    try {
        const response = await fetch('http://cardelli-backend.vercel.app/api/cardelli/productos/');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();  // Convertimos la respuesta a JSON
        displayProductos(data);
    } catch (error) {
        console.error('Error fetching productos:', error);
    }
}

function displayProductos(data) {
    const productosDiv = document.getElementById('todos-neumaticos');

    if (!productosDiv) {
        console.error('No se encontró el elemento #todos-neumaticos en el DOM');
        return;
    }

    productosDiv.innerHTML = '';

    // Recorrer las categorías y subcategorías
    data.forEach(categoria => {
        // Crear contenedor para la categoría
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'category-container';
        categoriaDiv.innerHTML = `<h2>${categoria.nombre}</h2>`;
        
        categoria.subcategorias.forEach(subcategoria => {
            // Crear contenedor para la subcategoría
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategory-container';
            subcategoriaDiv.innerHTML = `<h3>${subcategoria.nombre}</h3>`;

            const productsRowDiv = document.createElement('div');
            productsRowDiv.className = 'products-row';

            // Recorrer productos de la subcategoría
            subcategoria.productos.forEach(producto => {
                const productContainerDiv = document.createElement('div');
                productContainerDiv.classList.add('product-container');

                const productoDiv = document.createElement('div');
                productoDiv.classList.add('product-index');
                productoDiv.id = `producto-${producto.id}`;

                // Mostrar solo la primera foto del producto
                const img = document.createElement('img');
                img.src = producto.fotos[0]?.url || 'placeholder.jpg';  // Imagen por defecto si no hay fotos
                img.alt = producto.nombre;
                img.classList.add('product-image');

                // Información del producto
                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br>
                    <div class="divPrecio">$${producto.precio}</div>
                `;

                // Botón para agregar al carrito
                const addToCartButton = document.createElement('button');
                addToCartButton.textContent = 'Agregar al carrito';
                addToCartButton.classList.add('add-to-cart-btn');
                addToCartButton.onclick = () => addToCart(producto.id);

                // Agregar elementos al contenedor del producto
                productoDiv.appendChild(img);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(addToCartButton);
                productContainerDiv.appendChild(productoDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            // Añadir productos al contenedor de la subcategoría
            subcategoriaDiv.appendChild(productsRowDiv);
            // Añadir subcategoría al contenedor de la categoría
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        // Añadir categoría al contenedor principal
        productosDiv.appendChild(categoriaDiv);
    });
}



// Función para agregar productos al carrito
function addToCart(productId) {
    console.log(`Producto ${productId} agregado al carrito`);
    // Aquí puedes agregar la lógica para manejar el carrito, como actualizar la UI o llamar a una API
}


/* INICIO CARRITO */

let cartCount = 0;

function addToCart() {
    cartCount++;
    const cartCountElement = document.getElementById('cart-count');
    const cartContainer = document.getElementById('cart-container');

    cartCountElement.textContent = cartCount;

    // Mostrar u ocultar el contenedor basado en el contador
    if (cartCount > 0) {
        cartContainer.style.display = 'flex'; // Muestra el contenedor
    } else {
        cartContainer.style.display = 'none'; // Oculta el contenedor
    }
}

// Agregar un evento a los botones "Añadir al carrito"
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', addToCart);
});



window.onload = () => {
    fetchCarrusel();
    fetchProductos();
};