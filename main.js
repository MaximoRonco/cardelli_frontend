document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
    const overlay = document.querySelector('.overlay');
    const menuClose = document.querySelector('.menu-close');

    // Abrir menú al hacer clic en el botón de menú
    menuToggle.addEventListener('click', function(event) {
        navegacion.classList.toggle('show');
        overlay.classList.toggle('show');
        event.stopPropagation();
    });

    // Cerrar menú al hacer clic en la cruz
    menuClose.addEventListener('click', function() {
        navegacion.classList.remove('show');
        overlay.classList.remove('show');
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        if (!navegacion.contains(event.target) && !menuToggle.contains(event.target)) {
            navegacion.classList.remove('show');
            overlay.classList.remove('show');
        }
    });

    // Evitar que el clic dentro del menú cierre el menú
    navegacion.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});
