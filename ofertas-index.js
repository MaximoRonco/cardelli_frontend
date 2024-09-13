//En esta seccion muestro las ofertas a los clientes, sin la opcion de realizar modificaciones


// Función para obtener las promociones desde la API
async function fetchPromociones() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/ofertas/');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();  // Convertimos la respuesta a JSON
        displayPromociones(data);
    } catch (error) {
        console.error('Error fetching promociones:', error);
    }
}

/* MOSTRAR LAS PROMOCIONES */
function displayPromociones(data) {
    if (!Array.isArray(data)) {
        console.error('Los datos de las promociones no son un array:', data);
        return;
    }

    const promocionesDiv = document.getElementById('promociones');

    if (!promocionesDiv) {
        console.error('No se encontró el elemento #promociones en el DOM');
        return;
    }

    // Vaciar el contenedor
    promocionesDiv.innerHTML = '';

    // Recorrer las categorías y agregarlas al DOM
    data.forEach(categoria => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'category';
        categoriaDiv.id = `category-${categoria.id}`;
        categoriaDiv.innerHTML = `
            <h2>${categoria.nombre}</h2>
        `;

        categoria.subcategorias.forEach(subcategoria => {
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategory';
            subcategoriaDiv.id = `subcategoria-${subcategoria.id}`;
            subcategoriaDiv.innerHTML = `
                <h3>${subcategoria.nombre}</h3>
            `;

            const ofertasRowDiv = document.createElement('div');
            ofertasRowDiv.className = 'ofertas-row';

            subcategoria.ofertas.forEach(oferta => {
                const ofertaContainerDiv = document.createElement('div');
                ofertaContainerDiv.classList.add('oferta-container');

                const ofertaDiv = document.createElement('div');
                ofertaDiv.classList.add('oferta-index');
                ofertaDiv.id = `oferta-${oferta.id}`;

                // Mostrar solo la primera imagen del producto
                const img = document.createElement('img');
                img.src = oferta.fotos[0]?.url || 'ruta-de-imagen-por-defecto.jpg'; // Si no hay imagen, muestra una por defecto
                img.alt = oferta.nombre;
                img.classList.add('oferta-image');

                // Información de la oferta
                const ofertaInfoDiv = document.createElement('div');
                ofertaInfoDiv.classList.add('oferta-info');
                ofertaInfoDiv.innerHTML = `
                    <strong>${oferta.nombre}</strong> <br> 
                    <div class="divPrecio">$${oferta.precioSinOferta}</div>
                    <div class="divPrecio">$${oferta.precioConOferta}</div>

                `;
                // Botón para agregar al carrito
                const addToCartButton = document.createElement('button');
                addToCartButton.textContent = 'Agregar al carrito';
                addToCartButton.classList.add('add-to-cart-btn');
                addToCartButton.onclick = () => addToCart(oferta.id);

                // Botón "Ver más" para abrir el modal
                const verMasBtn = document.createElement('button');
                verMasBtn.classList.add('ver-mas-btn');
                verMasBtn.innerHTML = 'Ver más';
                verMasBtn.onclick = function() {
                    openModal(oferta);
                }


                // Botones de acciones de la oferta
                const ofertaButtonsDiv = document.createElement('div');
                ofertaButtonsDiv.classList.add('oferta-buttons');

                // Añadir las partes de la oferta al contenedor
                ofertaDiv.appendChild(img);
                ofertaDiv.appendChild(ofertaInfoDiv);
                ofertaDiv.appendChild(verMasBtn);
                ofertaDiv.appendChild(addToCartButton);

                ofertaContainerDiv.appendChild(ofertaDiv);
                ofertaContainerDiv.appendChild(ofertaButtonsDiv);
                ofertasRowDiv.appendChild(ofertaContainerDiv);
            });
        
            subcategoriaDiv.appendChild(ofertasRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        promocionesDiv.appendChild(categoriaDiv);
    });
}

function openModal(oferta) {
    
    const modal = document.getElementById('ofertaModal');
    const modalContent = document.getElementById('modal-oferta-info');
    

    // Inicializar la primera imagen como la imagen principal
    let mainImageUrl = oferta.fotos[0]?.url || 'ruta-de-imagen-por-defecto.jpg';

    // Llenar el modal con la información del oferta
    modalContent.innerHTML = `
        <div class="imagenes_neumaticos">
            
            <div class="main-image-container">
                <img src="${mainImageUrl}" alt="${oferta.nombre}" id="mainModalImage" class="modal-main-image" />
            </div>
            <div class="thumbnail-images-container">
                ${oferta.fotos.map((foto, index) => `
                    <img src="${foto.url}" alt="${oferta.nombre}" class="modal-thumbnail-image" onclick="changeMainImage('${foto.url}')" />
                `).join('')}
            </div>
        </div>
        <div class="descripcion_neumaticos">
            <h2>${oferta.nombre}</h2>
            <p class="divPrecioGrande"><strong></strong> $${oferta.precioSinOferta}</p>
            <p class="divPrecioGrande"><strong></strong> $${oferta.precioConOferta}</p>
            <select id="medidasSelectModal">
                ${oferta.medidas.map(medida => `<option value="${medida.id}">${medida.nombre}</option>`).join('')}
            </select>
            <p><strong></strong> ${oferta.descripcion}</p>

                        <!-- Aquí añadimos el contador de cantidad -->
            <div class="quantity-container">
                <button class="quantity-btn" onclick="decreaseQuantityModal()">-</button>
                <input type="number" value="1" min="1" id="quantity-modal" class="quantity-input" readonly>
                <button class="quantity-btn" onclick="increaseQuantityModal()">+</button>
            </div>

            <!-- Botón para agregar al carrito con la cantidad seleccionada -->
            <button class="add-to-cart-btn" onclick="addToCartFromModal(${oferta.id}, ${oferta.precio})">Agregar al carrito</button>
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
    const modal = document.getElementById('ofertaModal');
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
    fetchPromociones();
};
