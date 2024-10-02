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

/* Fin Carrusel */


window.addEventListener('load', fetchCarrusel);