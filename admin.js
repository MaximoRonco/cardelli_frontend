/* Inicio Login */

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validar campos vacíos
    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, ingrese el nombre de usuario y la contraseña.',
            customClass: {
                container: 'my-swal-container'
            }
        });
        return; // Detener la ejecución si hay campos vacíos
    }

    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: username, password: password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Almacenar el token en localStorage
            localStorage.setItem('authToken', data.token);

            // Mensaje de éxito y redirección
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo...',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    container: 'my-swal-container'
                }
            }).then(() => {
                localStorage.setItem('loggedIn', 'true'); // Guardar el estado de la sesión
                window.location.href = 'index-admin.html';
            });
        } else {
            // Manejo de errores de autenticación
            sweet("error",data.error || "Nombre de usuario o contraseña incorrectos");
        }
        
    } catch (error) {
        console.error('Error durante el login:', error);
        sweet("error","Nombre de usuario o contraseña incorrectos");
    }
}

/* HASTA ACA TODO BIEN */


/* ACA CAMBIA EL TOKEN EN EL HEADER */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Token not found');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Eliminar 'Content-Type' si el body es una instancia de FormData
    if (options.body instanceof FormData) {
        delete options.headers['Content-Type'];
    } else {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);
    let data;
    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }
    return { data, ok: response.ok };
}


function sweet(icon, text) {
    Swal.fire({
        icon: icon,
        text: text
    });
}

/* Inicio Carrusel */

async function fetchCarruselAdmin() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/carrusel/images/urls');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log('Fetched carrusel data:', data);
        displayCarruselAdmin(data);
    } catch (error) {
        console.error('Error fetching the carrusel:', error);
    }
}

function displayCarruselAdmin(data) {                                            // Borro eso pero todavia me falta el token de autorizacion, tengo que esperar el postman
    const carouselInnerAdmin = document.getElementById('carousel-inner-admin'); // En esta borro el -admin y se va el error, el tema es que en ARRE esta y el html esta igual
    carouselInnerAdmin.innerHTML = ""; // Limpia el carrusel

    data.forEach((url, index) => {
        console.log(`Adding image URL: ${url}`);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'carousel-item';
        if (index === 0) {
            itemDiv.classList.add('active'); // Marca el primer ítem como activo
        }

        const img = document.createElement('img');
        img.src = url;
        img.className = 'd-block w-100';

        /*img.onload = () => {
            console.log(`Image loaded: ${url}`);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
        };*/

        itemDiv.appendChild(img);
        carouselInnerAdmin.appendChild(itemDiv);
    });
}

window.addEventListener('load', fetchCarruselAdmin);

async function addImageToCarousel() {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Quieres agregar esta imagen al carrusel!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const imageInput = document.getElementById('imageInput');
            const file = imageInput.files[0];

            if (!file) {
                Swal.fire('Error', 'Por favor, selecciona una imagen para agregar.', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const { data, ok } = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/carrusel/upload', {
                    method: 'POST',
                    body: formData
                });

                if (ok) {
                    const imageUrl = data.url; // Ajusta según la estructura de respuesta del servidor

                    const newCarouselItem = document.createElement('div');
                    newCarouselItem.className = 'carousel-item';
                    const img = document.createElement('img');
                    img.className = 'd-block w-100';
                    img.src = imageUrl;
                    newCarouselItem.appendChild(img);

                    const carouselInner = document.querySelector('.carousel-inner');
                    const activeItem = carouselInner.querySelector('.active');
                    if (activeItem) {
                        activeItem.classList.remove('active');
                    }
                    newCarouselItem.classList.add('active');
                    carouselInner.appendChild(newCarouselItem);

                    Swal.fire('Éxito', 'Imagen agregada al carrusel correctamente.', 'success');
                } else {
                    Swal.fire('Error', 'No se pudo agregar la imagen al carrusel.', 'error');
                }
            } catch (error) {
                console.error('Error al agregar la imagen:', error);
                Swal.fire('Error', 'Hubo un error al agregar la imagen.', 'error');
            }
        }
    });
}

async function deleteImageFromCarousel() {
    // Mostrar el diálogo de confirmación con SweetAlert
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const activeItem = document.querySelector('.carousel-inner .active');
            if (!activeItem) {
                Swal.fire('Error', 'No hay una imagen activa para eliminar.', 'error');
                return;
            }

            const img = activeItem.querySelector('img');
            const imageUrl = img.src;

            console.log('URL de la imagen para eliminar:', imageUrl);

            try {
                const { data, ok } = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/carrusel/delete/img', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ src: imageUrl })
                });

                if (ok) {
                    Swal.fire('Éxito', 'Imagen eliminada correctamente.', 'success');
                    
                    // Elimina el item del carrusel
                    activeItem.remove();
                    const carouselInner = document.querySelector('.carousel-inner');
                    const items = carouselInner.querySelectorAll('.carousel-item');
                    if (items.length > 0) {
                        if (carouselInner.querySelector('.active') === null) {
                            items[0].classList.add('active');
                        }
                    } else {
                        Swal.fire('Error', 'El carrusel está vacío después de eliminar la imagen.', 'error');
                    }

                    // Volver a cargar la lista actualizada del carrusel
                    await fetchCarruselAdmin();

                } else {
                    Swal.fire('Error', 'No se pudo eliminar la imagen del carrusel.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la imagen:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la imagen.', 'error');
            }
        }
    });
}



// Event listeners for buttons
document.getElementById('addImageBtn').addEventListener('click', addImageToCarousel);
document.getElementById('deleteImageBtn').addEventListener('click', deleteImageFromCarousel);


/* Fin Carrusel */