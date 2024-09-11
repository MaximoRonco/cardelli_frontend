/*async function fetchProductos(){
    try{
        const response = await fetch('http://cardelli-backend.vercel.app/api/cardelli/productos/');
        if (!response.ok) {
            throw new Error('Network response was not ok' + response.statusText);
        }
        const data = await response.json();
        displayProducto(data);
    }catch(error){
        console.error('Error fetching productos:', error);
    }
}

function displayProducto(producto) {
    // Inicializar la primera imagen como la imagen principal
    let mainImageUrl = producto.fotos[0]?.url || 'ruta-de-imagen-por-defecto.jpg';

    // Llenar la información del producto en la página
    document.getElementById('mainProductImage').src = mainImageUrl;
    document.getElementById('productName').textContent = producto.nombre;
    document.getElementById('productPrice').textContent = producto.precio;
    document.getElementById('productDescription').textContent = producto.descripcion;

    // Llenar las imágenes en miniatura
    const thumbnailContainer = document.getElementById('thumbnailImagesContainer');
    thumbnailContainer.innerHTML = producto.fotos.map((foto, index) => `
        <img src="${foto.url}" alt="${producto.nombre}" class="thumbnail-image" onclick="changeMainImage('${foto.url}')" />
    `).join('');

    // Llenar las opciones de medidas
    const medidasSelect = document.getElementById('medidasSelect');
    medidasSelect.innerHTML = producto.medidas.map(medida => `
        <option value="${medida.id}">${medida.nombre}</option>
    `).join('');
}

// Función para cambiar la imagen principal al hacer clic en una miniatura
function changeMainImage(newImageUrl) {
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = newImageUrl;
}*/