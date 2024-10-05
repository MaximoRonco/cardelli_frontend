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
        displayMarcas(data);     // Mostrar las marcas (subcategorías) en la barra
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

// Mostrar marcas (subcategorías) en la barra
function displayMarcas(data) {
    const marcasContenedor = document.getElementById('marcas-contenedor');
    marcasContenedor.innerHTML = ''; // Limpiar cualquier contenido previo

    data.forEach(categoria => {
        categoria.subcategorias.forEach(subcategoria => {
            const marcaBtn = document.createElement('button');
            marcaBtn.className = 'marca-btn';
            marcaBtn.textContent = subcategoria.nombre;
            marcaBtn.onclick = () => filtrarPorMarca(subcategoria.id, data);
            marcasContenedor.appendChild(marcaBtn);
        });
    });
}

let categoriaSeleccionadaId = null;

// Filtrar productos por categoría
function filtrarPorCategoria(categoriaId, data) {
    const marcasContenedor = document.getElementById('marcas-contenedor');

    if (categoriaSeleccionadaId === categoriaId) {
        // Si se hace clic en la misma categoría, ocultar el contenedor de marcas
        marcasContenedor.style.display = 'none';
        categoriaSeleccionadaId = null;
        marcasContenedor.innerHTML = ''; // Limpiar marcas
    } else {
        // Actualizar la categoría seleccionada
        categoriaSeleccionadaId = categoriaId;
        const categoriaFiltrada = data.find(categoria => categoria.id === categoriaId);
        if (categoriaFiltrada) {
            // Mostrar el contenedor de marcas (subcategorías)
            marcasContenedor.style.display = 'block';
            displayMarcas([categoriaFiltrada]);
            displayProductos([categoriaFiltrada]);
        }
    }
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
                    <div class="divPrecio">$${Math.floor(producto.precio).toLocaleString('es-ES')}</div>
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

let productosData = [];

// Obtener los datos iniciales al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    fetch('https://cardelli-backend.vercel.app/api/cardelli/productos/')
        .then(response => response.json())
        .then(data => {
            productosData = data; // Almacenar los datos obtenidos
            displayProductos(productosData); // Mostrar todos los productos inicialmente
        })
        .catch(error => {
            console.error('Error al obtener productos:', error);
        });

    const buscarInput = document.getElementById('buscar-input');
    buscarInput.addEventListener('input', filtrarPorBusqueda);
});

// Filtrar productos por búsqueda en tiempo real
function filtrarPorBusqueda() {
    const inputBusqueda = document.getElementById('buscar-input').value.toLowerCase();

    // Filtrar categorías, subcategorías y productos según la búsqueda
    const categoriasFiltradas = productosData.map(categoria => {
        // Coincidencia en el nombre de la categoría
        const categoriaMatch = categoria.nombre.toLowerCase().includes(inputBusqueda);

        // Si la categoría coincide, devolvemos toda la categoría sin modificar
        if (categoriaMatch) {
            return categoria;
        }

        // Filtrar subcategorías según la búsqueda
        const subcategoriasFiltradas = categoria.subcategorias.map(subcategoria => {
            // Coincidencia en el nombre de la subcategoría
            const subcategoriaMatch = subcategoria.nombre.toLowerCase().includes(inputBusqueda);

            // Filtrar productos según la búsqueda
            const productosFiltrados = subcategoria.productos.filter(producto =>
                producto.nombre.toLowerCase().includes(inputBusqueda)
            );

            // Si la subcategoría coincide, devolvemos todos sus productos; si no, solo los productos coincidentes
            if (subcategoriaMatch) {
                return { ...subcategoria };
            } else if (productosFiltrados.length > 0) {
                return { ...subcategoria, productos: productosFiltrados };
            } else {
                return null; // Si no coincide, devolver null para descartarla
            }
        }).filter(subcategoria => subcategoria !== null);

        // Devolver categoría solo si tiene subcategorías coincidentes
        if (subcategoriasFiltradas.length > 0) {
            return { ...categoria, subcategorias: subcategoriasFiltradas };
        } else {
            return null; // Si no coincide, devolver null para descartarla
        }
    }).filter(categoria => categoria !== null);

    displayProductos(categoriasFiltradas);
}

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

            <!-- Título de Medidas -->
            <h3>Medidas</h3>
            <!-- Aquí se crea el contenedor de medidas con botones -->
            <div class="medidas-container">
                ${producto.medidas.map(medida => `
                    <button class="medida-btn" onclick="selectMedida(this, '${medida.id}')">${medida.nombre}</button>
                `).join('')}
            </div>

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

// Función para seleccionar una medida
function selectMedida(button, medidaId) {
    // Desmarcar todos los botones
    const allButtons = document.querySelectorAll('.medida-btn');
    allButtons.forEach(btn => btn.classList.remove('selected'));

    // Marcar el botón seleccionado
    button.classList.add('selected');

    // Puedes almacenar el 'medidaId' seleccionado en una variable si lo necesitas para otras funciones
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