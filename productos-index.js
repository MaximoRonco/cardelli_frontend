//En esta seccion llamo a los neumaticos para que los vea el cliente, sin la opcion de hacer modificaciones
/*Llamada a neumaticos */
// Llamada a neumáticos (productos) al cargar la página
async function fetchProductos() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/productos/');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        displayCategorias(data); // Mostrar las categorías en la barra
        displayProductos(data);  // Mostrar todos los productos por defecto
    } catch (error) {
        console.error('Error fetching productos:', error);
    }
}

// Mostrar categorías en la barra
function displayCategorias(data) {
    const categoriasContenedor = document.getElementById('categorias-contenedor');
    categoriasContenedor.innerHTML = ''; // Limpiar cualquier contenido previo

    data.forEach(categoria => {
        const categoriaBtn = document.createElement('button');
        categoriaBtn.className = 'categoria-btn';
        categoriaBtn.textContent = categoria.nombre;
        categoriaBtn.onclick = () => filtrarPorCategoria(categoria.id, data);
        categoriasContenedor.appendChild(categoriaBtn);
    });
}

// Filtrar productos por categoría
function filtrarPorCategoria(categoriaId, data) {
    const productosFiltrados = data.filter(categoria => categoria.id === categoriaId);
    displayProductos(productosFiltrados);
}

// Mostrar productos filtrados o sin filtrar
function displayProductos(data) {
    if (!Array.isArray(data)) {
        console.error('Los datos de los productos no son un array:', data);
        return;
    }

    const productosDiv = document.getElementById('productos');

    if (!productosDiv) {
        console.error('No se encontró el elemento #productos en el DOM');
        return;
    }

    // Vaciar el contenedor
    productosDiv.innerHTML = '';

    data.forEach(categoria => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'category';
        categoriaDiv.id = `category-${categoria.id}`;
        categoriaDiv.innerHTML = `<h2>${categoria.nombre}</h2>`;

        categoria.subcategorias.forEach(subcategoria => {
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategory';
            subcategoriaDiv.id = `subcategoria-${subcategoria.id}`;
            subcategoriaDiv.innerHTML = `<h3>${subcategoria.nombre}</h3>`;

            const productsRowDiv = document.createElement('div');
            productsRowDiv.className = 'products-row';

            subcategoria.productos.forEach(producto => {
                const productContainerDiv = document.createElement('div');
                productContainerDiv.classList.add('product-container');

                const productoDiv = document.createElement('div');
                productoDiv.classList.add('product-index');
                productoDiv.id = `producto-${producto.id}`;

                const img = document.createElement('img');
                img.src = producto.fotos[0]?.url || 'ruta-de-imagen-por-defecto.jpg';
                img.alt = producto.nombre;
                img.classList.add('product-image');

                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br> 
                    <div class="flex medidas">
                        <p>Medidas:</p>
                        <select id="medidasSelectModal">
                            ${producto.medidas.map(medida => `<option value="${medida.id}">${medida.nombre}</option>`).join('')}
                        </select>
                    </div>
                    <div class="divPrecio">$${Math.floor(producto.precio).toLocaleString('es-ES')}</div> <!-- Cambié aquí -->
                `;

                const verMasBtn = document.createElement('button');
                verMasBtn.classList.add('ver-mas-btn');
                verMasBtn.innerHTML = 'Ver más';
                verMasBtn.onclick = function () {
                    openModal(producto);
                };

                productoDiv.appendChild(img);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(verMasBtn);
                productContainerDiv.appendChild(productoDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            subcategoriaDiv.appendChild(productsRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        productosDiv.appendChild(categoriaDiv);
    });
}

// Filtrar productos por búsqueda
function filtrarPorBusqueda() {
    const inputBusqueda = document.getElementById('buscar-input').value.toLowerCase();

    fetch('https://cardelli-backend.vercel.app/api/cardelli/productos/')
        .then(response => response.json())
        .then(data => {
            const categoriasFiltradas = data.filter(categoria => {
                const categoriaMatch = categoria.nombre.toLowerCase().includes(inputBusqueda);

                const subcategoriasFiltradas = categoria.subcategorias.filter(subcategoria => {
                    const subcategoriaMatch = subcategoria.nombre.toLowerCase().includes(inputBusqueda);
                    
                    const productosFiltrados = subcategoria.productos.filter(producto => {
                        const productoMatch = producto.nombre.toLowerCase().includes(inputBusqueda);
                        return productoMatch;
                    });

                    return subcategoriaMatch || productosFiltrados.length > 0;
                });

                return categoriaMatch || subcategoriasFiltradas.length > 0;
            });

            displayProductos(categoriasFiltradas);
        })
        .catch(error => {
            console.error('Error al filtrar productos:', error);
        });
}

// Al cargar el DOM, configuramos eventos para la búsqueda
document.addEventListener('DOMContentLoaded', function() {
    const buscarBtn = document.getElementById('buscar-btn');
    
    buscarBtn.addEventListener('click', function() {
        filtrarPorBusqueda();
    });
    
    const inputBusqueda = document.getElementById('buscar-input');
    inputBusqueda.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            filtrarPorBusqueda();
        }
    });
});

// Función para abrir el modal con la información del producto
function openModal(producto) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modal-product-info');

    // Inicializar la primera imagen como la imagen principal
    let mainImageUrl = producto.fotos[0]?.url || 'ruta-de-imagen-por-defecto.jpg';

    // Llenar el modal con la información del producto
    modalContent.innerHTML = `
        <div class="imagenes_neumaticos">
            <div class="main-image-container">
                <img src="${mainImageUrl}" alt="${producto.nombre}" id="mainModalImage" class="modal-main-image" />
            </div>
            <div class="thumbnail-images-container">
                ${producto.fotos.map((foto, index) => `
                    <img src="${foto.url}" alt="${producto.nombre}" class="modal-thumbnail-image" onclick="changeMainImage('${foto.url}')" />
                `).join('')}
            </div>
        </div>
        <div class="descripcion_neumaticos">
            <h2>${producto.nombre}</h2>
            <p class="divPrecioGrande"><strong>$${Math.floor(producto.precio).toLocaleString('es-ES')}</strong> </p>
            <select id="medidasSelectModal">
                ${producto.medidas.map(medida => `<option value="${medida.id}">${medida.nombre}</option>`).join('')}
            </select>
            <p><strong></strong> ${producto.descripcion}</p>

            <!-- Aquí añadimos el contador de cantidad -->
            <div class="quantity-container">
                <button class="quantity-btn" onclick="decreaseQuantityModal()">-</button>
                <input type="number" value="1" min="1" id="quantity-modal" class="quantity-input" readonly>
                <button class="quantity-btn" onclick="increaseQuantityModal()">+</button>
            </div>

            <!-- Botón para agregar al carrito con la cantidad seleccionada -->
            <button class="add-to-cart-btn" onclick="addToCartFromModal(${producto.id}, ${producto.precio})">Agregar al carrito</button>
        </div>
    `;

    // Mostrar el modal
    modal.style.display = 'flex';
}

// Funciones para incrementar y decrementar la cantidad en el modal
function increaseQuantityModal() {
    const input = document.getElementById('quantity-modal');
    let currentValue = parseInt(input.value);
    input.value = currentValue + 1;
}

function decreaseQuantityModal() {
    const input = document.getElementById('quantity-modal');
    let currentValue = parseInt(input.value);
    if (currentValue > 1) {
        input.value = currentValue - 1;
    }
}

// Función para cambiar la imagen principal en el modal
function changeMainImage(newImageUrl) {
    const mainImage = document.getElementById('mainModalImage');
    mainImage.src = newImageUrl;
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

function moveCarousel(direction, carouselImagesDiv) {
    // Obtener las imágenes del carrusel
    const images = carouselImagesDiv.querySelectorAll('img');
    const totalImages = images.length;
    const currentIndex = Array.from(images).findIndex(img => img.style.display === 'block');
    
    if (currentIndex === -1) {
        images[0].style.display = 'block'; // Mostrar la primera imagen si ninguna está visible
    } else {
        // Ocultar la imagen actual
        images[currentIndex].style.display = 'none';

        // Calcular el nuevo índice basado en la dirección
        let newIndex = (currentIndex + direction + totalImages) % totalImages;
        
        // Mostrar la nueva imagen
        images[newIndex].style.display = 'block';
    }
}



window.onload = () => {
    fetchProductos();
};