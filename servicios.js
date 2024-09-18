document.addEventListener("DOMContentLoaded", function () {
    const contenedorServicios = document.querySelector(".servicios");
    const items = document.querySelectorAll(".item");
    const scrollInterval = 2000; // Tiempo en milisegundos entre desplazamientos

    let currentIndex = 0;

    function autoScroll() {
        // Calcular el ancho total de cada elemento (uno de los ítems)
        const itemWidth = items[0].clientWidth + parseInt(getComputedStyle(items[0]).marginRight);

        // Calcular la posición de desplazamiento basada en el índice actual
        const scrollPosition = currentIndex * itemWidth;

        // Desplazar el contenedor al siguiente elemento
        contenedorServicios.scrollTo({
            left: scrollPosition,
            behavior: "smooth"
        });

        // Incrementar el índice para pasar al siguiente elemento
        currentIndex++;

        // Si llegamos al final, volvemos al principio
        if (currentIndex >= items.length) {
            currentIndex = 0;
        }
    }

    // Iniciar el desplazamiento automático
    setInterval(autoScroll, scrollInterval);
});
