//En esta seccion tengo el crud de los neumaticos

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

                // Crear el carrusel de imágenes
                const carouselDiv = document.createElement('div');
                carouselDiv.classList.add('carousel');

                const carouselImagesDiv = document.createElement('div');
                carouselImagesDiv.classList.add('carousel-images');
                producto.fotos.forEach(foto => {
                    const img = document.createElement('img');
                    img.src = foto.url;
                    img.alt = producto.nombre;
                    img.classList.add('carousel-image');
                    carouselImagesDiv.appendChild(img);
                });

                const prevButton = document.createElement('button');
                prevButton.classList.add('carousel-control', 'prev');
                prevButton.innerHTML = '&lt;';
                prevButton.onclick = () => moveCarousel(-1, carouselImagesDiv);

                const nextButton = document.createElement('button');
                nextButton.classList.add('carousel-control', 'next');
                nextButton.innerHTML = '&gt;';
                nextButton.onclick = () => moveCarousel(1, carouselImagesDiv);

                carouselDiv.appendChild(prevButton);
                carouselDiv.appendChild(carouselImagesDiv);
                carouselDiv.appendChild(nextButton);

                // Información del producto
                const productoInfoDiv = document.createElement('div');
                productoInfoDiv.classList.add('product-info');
                productoInfoDiv.innerHTML = `
                    <strong>${producto.nombre}</strong> <br> 
                    <p class="producto_descripcion">${producto.descripcion}</p> 
                    <div class="divPrecio">$${producto.precio}</div>
                `;

                // Medidas del producto (lista desplegable)
                const medidasSelect = document.createElement('select');
                medidasSelect.classList.add('medidas-info');
                // Hacer que el select sea visible y funcional
                producto.medidas.forEach(medida => {
                    const option = document.createElement('option');
                    option.value = medida.id;
                    option.textContent = medida.nombre;
                    medidasSelect.appendChild(option);
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

                productoDiv.appendChild(carouselDiv);
                productoDiv.appendChild(productoInfoDiv);
                productoDiv.appendChild(medidasSelect);
                productContainerDiv.appendChild(productoDiv);
                productContainerDiv.appendChild(productoButtonsDiv);
                productsRowDiv.appendChild(productContainerDiv);
            });

            subcategoriaDiv.appendChild(productsRowDiv);
            categoriaDiv.appendChild(subcategoriaDiv);
        });

        productosDiv.appendChild(categoriaDiv);
    });

    // Agregar el evento de clic para desplegar la lista de medidas
    document.querySelectorAll('.medidas-info').forEach(select => {
        select.addEventListener('click', function () {
            this.removeAttribute('disabled');
            this.focus();
        });
    });
}



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

/* Inicio subcategorias */

async function addSubcategory(categoryId) {
    const { value: subcategoryTitle } = await Swal.fire({
        title: 'Agregar Subcategoría',
        input: 'text',
        inputLabel: 'Nombre de la subcategoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (subcategoryTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: subcategoryTitle, idCategoriaProducto: categoryId }) // Corrected the key name to idCategoria
            });

            if (response.ok) {
                const data = response.data;
                
                console.log("Respuesta de la API al agregar subcategoría:", data);
                Swal.fire('Éxito', 'Subcategoria creada correctamente.', 'success');
                createSubcategoryElement(categoryId, data.id, data.nombre);
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la subcategoría', 'error');
            }
        } catch (error) {
            console.error('Error al crear la subcategoría:', error);
            Swal.fire('Error', 'Hubo un error al crear la subcategoría', 'error');
        }
    }
}

async function editSubcategory(categoryId, subcategoryId) {
    const { value: subcategoryTitle } = await Swal.fire({
        title: 'Editar Subcategoría',
        input: 'text',
        inputLabel: 'Nuevo nombre de la subcategoría',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (subcategoryTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/${subcategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: subcategoryTitle })
            });

            if (response.ok) {
                const subcategoryElement = document.querySelector(`#subcategoria-${subcategoryId} h3`);
                if (subcategoryElement) {
                    subcategoryElement.textContent = subcategoryTitle;
                    Swal.fire('Éxito', 'Subcategoría modificada con éxito.', 'success');
                } else {
                    console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
                }
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al editar la subcategoría', 'error');
            }
        } catch (error) {
            console.error('Error al editar la subcategoría:', error);
            Swal.fire('Error', 'Hubo un error al editar la subcategoría', 'error');
        }
    }
}

async function deleteSubcategory(categoryId, subcategoryId) {
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
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_productos/${subcategoryId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Mostrar mensaje de éxito
                    Swal.fire('Eliminado', 'Subcategoría eliminada con éxito.', 'success');
                    
                    // Eliminar el elemento de la interfaz de usuario
                    const subcategoryElement = document.getElementById(`subcategoria-${subcategoryId}`);
                    if (subcategoryElement) {
                        subcategoryElement.remove();
                    } else {
                        console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
                    }
                } else {
                    // Mostrar mensaje de error
                    Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al eliminar la subcategoría', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la subcategoría:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la subcategoría', 'error');
            }
        }
    });
}



function createSubcategoryElement(categoryId, subcategoryId, subcategoryName) {
    const categoryElement = document.getElementById(`category-${categoryId}`);

    if (!categoryElement) {
        console.error(`No se encontró el contenedor de subcategorías para la categoría con ID ${categoryId}`);
        Swal.fire('Error', `No se encontró el contenedor de subcategorías para la categoría con ID ${categoryId}`, 'error');
        return;
    }

    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory';
    subcategoryDiv.id = `subcategoria-${subcategoryId}`;
    subcategoryDiv.innerHTML = `
    
        <h3>${subcategoryName}</h3>
        <div class="contenedorBotonesSub">
            <button class="edit modSub subcategory-btn" onclick="editSubcategory(${categoryId}, ${subcategoryId}, '${subcategoryName}')"> <i class="bi bi-pencil-square"></i>Subcategoría</button>
            <button class="delete delSub subcategory-btn" onclick="deleteSubcategory(${categoryId}, ${subcategoryId})"><i class="bi bi-trash"></i>Subcategoría</button>
            <button class="add addProduct subcategory-btn" onclick="addProduct(${subcategoryId})"><i class="bi bi-plus-circle"></i>Producto</button>
        </div>
    `;

    const productsRowDiv = document.createElement('div');
    productsRowDiv.className = 'products-row';
    subcategoryDiv.appendChild(productsRowDiv);

    categoryElement.appendChild(subcategoryDiv);

    // Crear enlace para la nueva subcategoría en la barra de búsqueda
    const barraBusquedaDiv = document.getElementById('barra-busqueda');
    if (barraBusquedaDiv) {
        const subcategoriaLink = document.createElement('div');
        subcategoriaLink.className = 'subcategory-link';
        subcategoriaLink.innerHTML = subcategoryName;
        subcategoriaLink.onclick = () => {
            document.getElementById(`subcategoria-${subcategoryId}`).scrollIntoView({ behavior: 'smooth' });
        };
        barraBusquedaDiv.appendChild(subcategoriaLink);
    }
}


/* Inicio crear productos */

// Llamada para obtener las medidas antes de crear el producto
async function createProduct(subcategoryId) {
    const medidas = await fetchMedidas(); // Obtener las medidas primero
    await addProduct(subcategoryId, medidas); // Llamar a addProduct con las medidas
}

async function fetchMedidas() {
    try {
        const response = await fetch('http://cardelli-backend.vercel.app/api/cardelli/medidas');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();  // Convertimos la respuesta a JSON
        return data || [];  // Asegúrate de devolver un array, incluso si no hay datos
    } catch (error) {
        console.error('Error fetching medidas:', error);
        return [];  // En caso de error, devuelve un array vacío
    }
}



async function addProduct(subcategoryId) {
    const medidas = await fetchMedidas();

    if (!Array.isArray(medidas) || medidas.length === 0) {
        console.error('No se pudieron obtener las medidas.');
        Swal.fire('Error', 'No se pudieron obtener las medidas para crear el producto.', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Agregar Producto',
        html: `
            <input id="product-name" class="swal2-input" placeholder="Nombre del producto">
            <input id="product-price" type="number" class="swal2-input" placeholder="Precio del producto">
            <input id="product-description" class="swal2-input" placeholder="Descripción del producto">
            <input id="product-image" type="file" class="swal2-file" multiple>
            <select id="product-measures" class="swal2-select" multiple style="width: 100%; padding: 5px;">
                ${medidas.map(medida => `<option value="${medida.id}">${medida.nombre}</option>`).join('')}
            </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('product-name').value;
            const price = document.getElementById('product-price').value;
            const description = document.getElementById('product-description').value;
            const imageFiles = document.getElementById('product-image').files;
            const selectedMeasures = Array.from(document.getElementById('product-measures').selectedOptions).map(option => Number(option.value));

            if (!name || !price || !description || imageFiles.length === 0 || selectedMeasures.length === 0) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }
            return { name, price, description, imageFiles, selectedMeasures };
        }
    });

    if (formValues) {
        const { name, price, description, imageFiles, selectedMeasures } = formValues;

        // Obtener los nombres de las medidas seleccionadas para mostrarlas
        const selectedMeasureNames = medidas
            .filter(medida => selectedMeasures.includes(medida.id))
            .map(medida => medida.nombre);

        // Crear un nuevo div para mostrar el producto en el DOM
        createProductElement(subcategoryId, name, price, description, imageFiles[0], selectedMeasureNames);

        const formData = new FormData();
        formData.append('data', JSON.stringify({ 
            nombre: name, 
            precio: price, 
            descripcion: description, 
            idSubCategoria: subcategoryId,
            medidas: selectedMeasures 
        }));

        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('files', imageFiles[i]);
        }

        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/upload`, {
                method: 'POST',
                body: formData
            });
            
            const { data, ok } = response;

            if (ok) {
                Swal.fire('Éxito', 'Producto agregado con éxito.', 'success');
            } else {
                console.error('Error en la respuesta:', data);
                Swal.fire('Error', data.error || 'Hubo un error al agregar el producto', 'error');
            }
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            Swal.fire('Error', 'Hubo un error al agregar el producto', 'error');
        }
    }
}

function createProductElement(subcategoryId, name, price, description, imageFile, measureNames) {
    const subcategoryDiv = document.getElementById(`subcategoria-${subcategoryId}`);
    if (subcategoryDiv) {
        const productsRowDiv = subcategoryDiv.querySelector('.products-row');

        // Crear el contenedor del producto
        const productContainerDiv = document.createElement('div');
        productContainerDiv.classList.add('product-container');

        // Crear el div del producto
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-index');

        // Mostrar la imagen del producto
        const productImg = document.createElement('img');
        productImg.src = URL.createObjectURL(imageFile);
        productImg.alt = name;

        // Crear el div para la información del producto
        const productInfoDiv = document.createElement('div');
        productInfoDiv.classList.add('product-info');
        productInfoDiv.innerHTML = `
            <strong>${name}</strong> <br>
            <p>${description}</p>
            <div class="divPrecio"> $${price} </div>
            <div class="medidasProducto"><strong>Medidas:</strong> ${measureNames.join(', ')}</div>
        `;

        productDiv.appendChild(productImg);
        productDiv.appendChild(productInfoDiv);

        // Crear el div de los botones
        const productButtonsDiv = document.createElement('div');
        productButtonsDiv.classList.add('product-buttons');
        productButtonsDiv.innerHTML = `
            <div class="cont-btnProd">
                <button class="edit modProducto"><i class="bi bi-pencil-square"></i>Editar Producto</button>
                <button class="delete delProducto"><i class="bi bi-trash"></i>Eliminar Producto</button>
            </div>
        `;

        // Añadir el div del producto y los botones al contenedor
        productContainerDiv.appendChild(productDiv);
        productContainerDiv.appendChild(productButtonsDiv);

        // Añadir el contenedor del producto a la fila de productos
        productsRowDiv.appendChild(productContainerDiv);
    } else {
        console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
    }
}










async function editProduct(productId, currentName, currentPrice, currentDescription, currentMeasures = []) {
    const medidas = await fetchMedidas();

    if (!Array.isArray(medidas) || medidas.length === 0) {
        console.error('No se pudieron obtener las medidas.');
        Swal.fire('Error', 'No se pudieron obtener las medidas para editar el producto.', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Editar Producto',
        html: `
            <input id="edit-product-name" class="swal2-input" placeholder="Nombre del producto" value="${currentName}">
            <input id="edit-product-price" type="number" class="swal2-input" placeholder="Precio del producto" value="${currentPrice}">
            <input id="edit-product-description" class="swal2-input" placeholder="Descripción del producto" value="${currentDescription}">
            <input id="edit-product-image" type="file" class="swal2-file" multiple>
            <select id="edit-product-measures" class="swal2-select" multiple style="width: 100%; padding: 5px;">
                ${medidas.map(medida => `<option value="${medida.id}" ${currentMeasures.includes(medida.id) ? 'selected' : ''}>${medida.nombre}</option>`).join('')}
            </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('edit-product-name').value;
            const price = document.getElementById('edit-product-price').value;
            const description = document.getElementById('edit-product-description').value;
            const imageFiles = document.getElementById('edit-product-image').files;
            const selectedMeasures = Array.from(document.getElementById('edit-product-measures').selectedOptions).map(option => Number(option.value));

            if (!name || !price || !description || selectedMeasures.length === 0) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }

            return { name, price, description, imageFiles, selectedMeasures };
        }
    });

    if (formValues) {
        const { name, price, description, imageFiles, selectedMeasures } = formValues;

        // Crear un formulario para enviar los datos
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            nombre: name,
            precio: price,
            descripcion: description,
            nuevasMedidas: selectedMeasures
        }));

        // Añadir imágenes si se subieron nuevas
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('files', imageFiles[i]);
        }

        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/${productId}`, {
                method: 'PUT',
                body: formData
            });

            const { data, ok } = response;
            console.log('Response from API:', response); // Imprime la respuesta completa

            if (ok) {
                console.log('Producto actualizado con éxito en el servidor:', data);
                Swal.fire('Éxito', 'Producto editado con éxito.', 'success');
                // Actualiza el elemento del producto en la UI
                updateProductElement(productId, name, price, description, selectedMeasures, imageFiles[0]);
            } else {
                console.error('Error en la respuesta:', data);
                Swal.fire('Error', data.error || 'Hubo un error al editar el producto', 'error');
            }
        } catch (error) {
            console.error('Error al editar el producto:', error);
            Swal.fire('Error', 'Hubo un error al editar el producto', 'error');
        }
    }
}

function updateProductElement(productId, name, price, description, measureNames, imageFile) {
    const productDiv = document.getElementById(`producto-${productId}`);

    if (productDiv) {
        const productImg = productDiv.querySelector('img');
        if (imageFile) {
            productImg.src = URL.createObjectURL(imageFile);
        }

        const productInfoDiv = productDiv.querySelector('.product-info');
        productInfoDiv.innerHTML = `
            <strong>${name}</strong> <br>
            <p>${description}</p>
            <div class="divPrecio"> $${price} </div>
            <div class="medidasProducto"><strong>Medidas:</strong> ${measureNames.join(', ')}</div>
        `;
    } else {
        console.error(`No se encontró el elemento con id product-${productId}`);
    }
}

async function deleteProduct(productId) {
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
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/productos/${productId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    Swal.fire('Éxito', 'Producto eliminado con éxito.', 'success');
                    await fetchProductos(); // Actualizar la carta después de eliminar
                } else {
                    const errorData = await response.json();
                    Swal.fire('Error', errorData.message || 'Hubo un error al eliminar el producto', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
                Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error');
            }
        }
    });
}


let currentSlide = 0;

function moveCarousel(direction, carouselImagesDiv) {
    // Obtener las imágenes del carrusel
    const images = carouselImagesDiv.querySelectorAll('img');
    const totalImages = images.length;
    const currentIndex = Array.from(images).findIndex(img => img.style.display === 'block');
    
    if (currentIndex === -1) {
        images[0].style.display = 'block'; // Mostrar la primera imagen si ninguna está visible
    } else {
        // Ocultar la imagen actual
        images[currentIndex].style.display = 'none';

        // Calcular el nuevo índice basado en la dirección
        let newIndex = (currentIndex + direction + totalImages) % totalImages;
        
        // Mostrar la nueva imagen
        images[newIndex].style.display = 'block';
    }
}

// Asegúrate de que al cargar la página, solo la primera imagen sea visible
document.querySelectorAll('.carousel-images').forEach(carouselImagesDiv => {
    const images = carouselImagesDiv.querySelectorAll('img');
    if (images.length > 0) {
        images[0].style.display = 'block'; // Mostrar la primera imagen
        for (let i = 1; i < images.length; i++) {
            images[i].style.display = 'none'; // Ocultar las demás imágenes
        }
    }
});




window.onload = () => {
    fetchProductos();
};








