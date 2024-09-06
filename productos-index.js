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

                // Agregar la imagen del producto (si existe)
                const productoImg = document.createElement('img');
                productoImg.src = producto.fotos[0]?.url || '';  // Mostrar la primera foto si existe
                productoImg.alt = producto.nombre;

                // Información del producto
                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br> 
                    <p>${producto.descripcion}</p> 
                    <div class="divPrecio">$${producto.precio}</div>
                `;

                // Medidas del producto
                const medidasDiv = document.createElement('div');
                medidasDiv.classList.add('medidas-info');
                producto.medidas.forEach(medida => {
                    const medidaSpan = document.createElement('span');
                    medidaSpan.classList.add('medida-item');
                    medidaSpan.textContent = medida.nombre;
                    medidasDiv.appendChild(medidaSpan);
                });



                productoDiv.appendChild(productoImg);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(medidasDiv);
                productContainerDiv.appendChild(productoDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            subcategoriaDiv.appendChild(productsRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        productosDiv.appendChild(categoriaDiv);
    });
}



window.onload = () => {
    fetchProductos();
    fetchCarrusel();
};