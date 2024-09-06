/* sweet alert */
function sweet(icon, text) {
    Swal.fire({
        icon: icon,
        text: text
    });
}




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
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/usuarios/login', {
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


/*Productos */
/*GET DE PRODUCTOS*/
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
            <div class="contenedorBotonesCat">
                <button class="edit" onclick="editCategory(${categoria.id}, '${categoria.nombre}')"><i class="bi bi-pencil-square"></i> Categoria</button>
                <button class="delete" onclick="deleteCategory(${categoria.id})"><i class="bi bi-trash"></i> Categoria</button>
                <button class="add" onclick="addSubcategory(${categoria.id})"><i class="bi bi-plus-circle"></i> Subcategoría</button>
            </div>
        `;

        categoria.subcategorias.forEach(subcategoria => {
            const subcategoriaDiv = document.createElement('div');
            subcategoriaDiv.className = 'subcategory';
            subcategoriaDiv.id = `subcategoria-${subcategoria.id}`;
            subcategoriaDiv.innerHTML = `
                <h3>${subcategoria.nombre}</h3>
                <div class="contenedorBotonesSub">
                    <button class="edit modSub subcategory-btn" onclick="editSubcategory(${categoria.id}, ${subcategoria.id}, '${subcategoria.nombre}')">
                        <i class="bi bi-pencil-square"></i> Subcategoría
                    </button>
                    <button class="delete delSub subcategory-btn" onclick="deleteSubcategory(${categoria.id}, ${subcategoria.id})">
                        <i class="bi bi-trash"></i> Subcategoría
                    </button>
                    <button class="add addProduct subcategory-btn" onclick="addProduct(${subcategoria.id})">
                        <i class="bi bi-plus-circle"></i> Producto
                    </button>
                </div>
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

                // Botones de acciones del producto
                const productoButtonsDiv = document.createElement('div');
                productoButtonsDiv.classList.add('product-buttons');
                productoButtonsDiv.innerHTML = `
                    <div class="cont-btnProd">
                        <button class="edit modProducto" onclick="editProduct(${producto.id}, '${producto.nombre}', ${producto.precio}, '${producto.descripcion}', '${producto.fotos[0]?.url || ''}')"><i class="bi bi-pencil-square"></i> Editar Producto</button>
                        <button class="delete delProducto" onclick="deleteProduct(${producto.id})"><i class="bi bi-trash"></i> Eliminar Producto</button>
                    </div>
                `;

                productoDiv.appendChild(productoImg);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(medidasDiv);
                productContainerDiv.appendChild(productoDiv);
                productContainerDiv.appendChild(productoButtonsDiv);
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
};


/*CATEGORIAS */
/*AGREGAR CATEGORIA */
async function addCategory() {
    const { value: categoryName } = await Swal.fire({
        title: 'Agregar Categoría',
        input: 'text',
        inputLabel: 'Nombre de la categoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (categoryName) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: categoryName })
            });

            if (response.ok) {
                const data = response.data;
                sweet("success", "Categoría creada con éxito.");
                console.log("Respuesta de la API al agregar categoría:", data);
                createCategoryElement(data.id, data.nombre);
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la categoría', 'error');
            }
        } catch (error) {
            console.error('Error al crear la categoría:', error);
            Swal.fire('Error', 'Hubo un error al crear la categoría', 'error');
        }
    }
}

/* ELIMINAR CATEGORIA */
async function deleteCategory(categoryId) {
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
            try {
                await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos/${categoryId}`, {
                    method: 'DELETE'
                });

                sweet("success", "Categoría eliminada con éxito.");
                // Aquí podrías agregar el código para actualizar la UI y remover la categoría eliminada
                const categoryElement = document.getElementById(`category-${categoryId}`);
                if (categoryElement) {
                    categoryElement.remove();
                }
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                sweet("error", "Hubo un error al eliminar la categoría.");
            }
        }
    });
}

/*EDITAR CATEGORIA */
async function editCategory(categoryId, currentCategoryName) {
    // Usar SweetAlert2 para pedir el nuevo nombre de la categoría
    const { value: newCategoryName } = await Swal.fire({
        title: 'Modificar Categoría',
        input: 'text',
        inputLabel: 'Nuevo nombre de la categoría',
        inputValue: currentCategoryName,
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (newCategoryName) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_productos/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: newCategoryName })
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Categoría modificada con éxito.', 'success');

                // Aquí podrías agregar el código para actualizar la UI con el nuevo nombre de la categoría
                const categoryElement = document.querySelector(`#category-${categoryId} h2`);
                if (categoryElement) {
                    categoryElement.textContent = newCategoryName;
                } else {
                    console.error(`No se encontró el elemento con id category-${categoryId}`);
                }

                // También actualizamos el data-category-name del botón de editar
                const editButton = document.querySelector(`#edit-category-${categoryId}`);
                if (editButton) {
                    editButton.dataset.categoryName = newCategoryName;
                }
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.message || 'Hubo un error al modificar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error al modificar la categoría:', error);
            Swal.fire('Error', 'Hubo un error al modificar la categoría.', 'error');
        }
    }
}


/* CREAR ELEMENTO CATEGORIA */
function createCategoryElement(categoryId, categoryTitle) {
    const productos = document.getElementById('productos');
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');
    categoryDiv.id = `category-${categoryId}`;

    categoryDiv.innerHTML = `
        <h2>${categoryTitle}</h2>
        <div class="contenedorBotonesCat">
        <button class="edit" onclick="editCategory('${categoryId}')"><i class="bi bi-pencil-square"></i> Editar Categoría</button>
        <button class="delete" onclick="deleteCategory('${categoryId}')"><i class="bi bi-trash"></i> Eliminar Categoría</button>
        <button class="add" onclick="addSubcategory('${categoryId}')"><i class="bi bi-plus-circle"></i>Agregar Subcategoría</button>
        <div id="subcategories-${categoryId}" class="subcategories"></div>
        </div>
    `;

    productos.appendChild(categoryDiv);
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
