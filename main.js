/* Menu hamburguesa */
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');


    menuToggle.addEventListener('click', function() {
        navegacion.classList.toggle('show');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');

    // Mostrar el menú cuando se hace clic en el ícono de menú
    menuToggle.addEventListener('click', function() {
        navegacion.classList.add('show');
        navegacion.classList.remove('hide');
    });

    // Cerrar el menú cuando se hace clic fuera de él
    document.addEventListener('click', function(event) {
        const menuToggle = document.querySelector('.menu-toggle');
        const navegacion = document.querySelector('.navegacion');
        const overlay = document.querySelector('.overlay');
        overlay.classList.toggle('show');
        
        const isClickInside = navegacion.contains(event.target) || menuToggle.contains(event.target);

        if (!isClickInside) {
            navegacion.classList.add('hide');
            navegacion.classList.remove('show');
            navegacion.classList.toggle('show');    
            
            // Esperar a que la animación de salida termine antes de quitar la clase
            setTimeout(() => {
                navegacion.classList.remove('hide');
            }, 800); // Duración de la animación (800ms)
        }
    });
});


