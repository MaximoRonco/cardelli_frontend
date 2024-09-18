document.addEventListener("DOMContentLoaded", function () {
    const contenedorServicios = document.querySelector(".servicios");
    let scrollAmount = 0;
    const scrollStep = 300; // Ajusta esto según el ancho de tus elementos
    const scrollInterval = 2000; // Tiempo en milisegundos entre desplazamientos

    function autoScroll() {
        scrollAmount += scrollStep;

        // Si llegamos al final, volvemos al principio
        if (scrollAmount >= contenedorServicios.scrollWidth - contenedorServicios.clientWidth) {
            scrollAmount = 0;
        }

        contenedorServicios.scrollTo({
            left: scrollAmount,
            behavior: "smooth"
        });
    }

    // Iniciar el desplazamiento automático
    setInterval(autoScroll, scrollInterval);
});


