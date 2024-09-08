//En esta seccion llamo a los neumaticos para que los vea el cliente, sin la opcion de hacer modificaciones
/*Llamada a neumaticos */
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

/*MOSTRAR LOS PRODUCTOS */
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

            const productsRowDiv = document.createElement('div');
            productsRowDiv.className = 'products-row';

            subcategoria.productos.forEach(producto => {
                const productContainerDiv = document.createElement('div');
                productContainerDiv.classList.add('product-container');

                const productoDiv = document.createElement('div');
                productoDiv.classList.add('product-index');
                productoDiv.id = `producto-${producto.id}`;

                // Crear el carrusel de imágenes
                const carouselDiv = document.createElement('div');
                carouselDiv.classList.add('carousel');

                const carouselImagesDiv = document.createElement('div');
                carouselImagesDiv.classList.add('carousel-images');
                producto.fotos.forEach(foto => {
                    const img = document.createElement('img');
                    img.src = foto.url;
                    img.alt = producto.nombre;
                    img.classList.add('carousel-image');
                    carouselImagesDiv.appendChild(img);
                });

                const prevButton = document.createElement('button');
                prevButton.classList.add('carousel-control', 'prev');
                prevButton.innerHTML = '&lt;';
                prevButton.onclick = () => moveCarousel(-1, carouselImagesDiv);

                const nextButton = document.createElement('button');
                nextButton.classList.add('carousel-control', 'next');
                nextButton.innerHTML = '&gt;';
                nextButton.onclick = () => moveCarousel(1, carouselImagesDiv);

                carouselDiv.appendChild(prevButton);
                carouselDiv.appendChild(carouselImagesDiv);
                carouselDiv.appendChild(nextButton);

                // Información del producto
                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br> 
                    <p>${producto.descripcion}</p> 
                    <div class="divPrecio">$${producto.precio}</div>
                `;

                // Medidas del producto (lista desplegable)
                const medidasSelect = document.createElement('select');
                medidasSelect.classList.add('medidas-info');
                // Hacer que el select sea visible y funcional
                producto.medidas.forEach(medida => {
                    const option = document.createElement('option');
                    option.value = medida.id;
                    option.textContent = medida.nombre;
                    medidasSelect.appendChild(option);
                });

                // Botones de acciones del producto
                const productoButtonsDiv = document.createElement('div');
                productoButtonsDiv.classList.add('product-buttons');
                productoButtonsDiv.innerHTML = `

                `;

                productoDiv.appendChild(carouselDiv);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(medidasSelect);
                productContainerDiv.appendChild(productoDiv);
                productContainerDiv.appendChild(productoButtonsDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            subcategoriaDiv.appendChild(productsRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        productosDiv.appendChild(categoriaDiv);
    });

    // Agregar el evento de clic para desplegar la lista de medidas
    document.querySelectorAll('.medidas-info').forEach(select => {
        select.addEventListener('click', function () {
            this.removeAttribute('disabled');
            this.focus();
        });
    });
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