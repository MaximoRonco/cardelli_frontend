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

                // Información de la oferta
                const ofertaInfoDiv = document.createElement('div');
                ofertaInfoDiv.classList.add('oferta-info');
                ofertaInfoDiv.innerHTML = `
                    <strong>${oferta.nombre}</strong> <br> 
                    <p>${oferta.descripcion}</p> 
                    <div class="divPrecio">$${oferta.precio}</div>
                `;

                // Botones de acciones de la oferta
                const ofertaButtonsDiv = document.createElement('div');
                ofertaButtonsDiv.classList.add('oferta-buttons');
                ofertaButtonsDiv.innerHTML = `
                `;

                ofertaDiv.appendChild(ofertaInfoDiv);
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

window.onload = () => {
    fetchPromociones();
};
