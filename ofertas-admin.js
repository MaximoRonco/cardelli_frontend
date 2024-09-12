//En esta seccion tengo el CRUD de las ofertas


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
                    <button class="add addOferta subcategory-btn" onclick="addOferta(${subcategoria.id})">
                        <i class="bi bi-plus-circle"></i> Oferta
                    </button>
                </div>
            `;

            const ofertasRowDiv = document.createElement('div');
            ofertasRowDiv.className = 'ofertas-row';

            subcategoria.ofertas.forEach(oferta => {
                const ofertaContainerDiv = document.createElement('div');
                ofertaContainerDiv.classList.add('oferta-container');

                const ofertaDiv = document.createElement('div');
                ofertaDiv.classList.add('oferta-index');
                ofertaDiv.id = `oferta-${oferta.id}`;

                // Mostrar las fotos de la oferta
                const fotosDiv = document.createElement('div');
                fotosDiv.classList.add('oferta-fotos');
                oferta.fotos.forEach(foto => {
                    const img = document.createElement('img');
                    img.src = foto.url;
                    img.alt = `Foto de ${oferta.nombre}`;
                    fotosDiv.appendChild(img);
                });

                // Información de la oferta
                const ofertaInfoDiv = document.createElement('div');
                ofertaInfoDiv.classList.add('oferta-info');
                ofertaInfoDiv.innerHTML = `
                    <strong>${oferta.nombre}</strong> <br> 
                    <p>${oferta.descripcion}</p> 
                    <div class="divPrecio">Precio normal: $${oferta.precioSinOferta}</div>
                    <div class="divPrecio">Precio con oferta: $${oferta.precioConOferta}</div>
                `;

                // Mostrar las medidas de la oferta
                const medidasDiv = document.createElement('div');
                medidasDiv.classList.add('oferta-medidas');
                const medidasTexto = oferta.medidas.map(medida => medida.nombre).join(', ');
                medidasDiv.innerHTML = `<strong>Medidas:</strong> ${medidasTexto}`;

                // Botones de acciones de la oferta
                const ofertaButtonsDiv = document.createElement('div');
                ofertaButtonsDiv.classList.add('oferta-buttons');
                ofertaButtonsDiv.innerHTML = `
                    <div class="cont-btnOferta">
                        <button class="edit modOferta" onclick="editOferta(${oferta.id}, '${oferta.nombre}', ${oferta.precioSinOferta}, '${oferta.descripcion}')"><i class="bi bi-pencil-square"></i> Editar Oferta</button>
                        <button class="delete delOferta" onclick="deleteOferta(${oferta.id})"><i class="bi bi-trash"></i> Eliminar Oferta</button>
                    </div>
                `;

                // Añadir las partes de la oferta al contenedor
                ofertaDiv.appendChild(fotosDiv);
                ofertaDiv.appendChild(ofertaInfoDiv);
                ofertaDiv.appendChild(medidasDiv);

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
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_ofertas`, {
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
                await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_ofertas/${categoryId}`, {
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
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/categorias_ofertas/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: newCategoryName })
            });

            if (response.ok) {
                // Verificar si el objeto headers está disponible
                let data = null;
                if (response.headers && response.headers.get('Content-Type')?.includes('application/json')) {
                    data = await response.json(); // Solo intentar parsear si es JSON
                }

                Swal.fire('Éxito', 'Categoría modificada con éxito.', 'success');

                // Actualizamos el nombre de la categoría en la UI
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
                let errorData = null;
                // Nuevamente, verificamos si los encabezados están disponibles
                if (response.headers && response.headers.get('Content-Type')?.includes('application/json')) {
                    errorData = await response.json();
                }
                Swal.fire('Error', errorData ? errorData.message : 'Hubo un error al modificar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error al modificar la categoría:', error);
            Swal.fire('Error', 'Hubo un error al modificar la categoría.', 'error');
        }
    }
}


/* CREAR ELEMENTO CATEGORIA */
function createCategoryElement(categoryId, categoryTitle) {
    const productos = document.getElementById('promociones');
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
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_ofertas/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: subcategoryTitle, idCategoriaOferta: categoryId }) // Corrected the key name to idCategoria
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
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_ofertas/${subcategoryId}`, {
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
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/subcategorias_ofertas/${subcategoryId}`, {
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
            <button class="add addProduct subcategory-btn" onclick="addOferta(${subcategoryId})"><i class="bi bi-plus-circle"></i>Oferta</button>
        </div>
    `;

    const ofertaRowDiv = document.createElement('div');
    ofertaRowDiv.className = 'ofertas-row';
    subcategoryDiv.appendChild(ofertaRowDiv);

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

// Llamada para obtener las medidas antes de crear el producto
async function createOferta(subcategoryId) {
    const medidas = await fetchMedidas(); // Obtener las medidas primero
    await addOferta(subcategoryId, medidas); // Llamar a addProduct con las medidas
}

async function fetchMedidas() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/medidas');
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



async function addOferta(subcategoryId) {
    const medidas = await fetchMedidas();

    if (!Array.isArray(medidas) || medidas.length === 0) {
        console.error('No se pudieron obtener las medidas.');
        Swal.fire('Error', 'No se pudieron obtener las medidas para crear el producto.', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Agregar Oferta',
        html: `
            <input id="oferta-name" class="swal2-input" placeholder="Nombre de la oferta">
            <input id="oferta-price" type="number" class="swal2-input" placeholder="Precio de la oferta">
            <input id="oferta-price-oferta" type="number" class="swal2-input" placeholder="Precio de la oferta oferta">
            <input id="oferta-description" class="swal2-input" placeholder="Descripción de la oferta">
            <input id="oferta-image" type="file" class="swal2-file" multiple>
            <select id="oferta-measures" class="swal2-select" multiple style="width: 100%; padding: 5px;">
                ${medidas.map(medida => `<option value="${medida.id}">${medida.nombre}</option>`).join('')}
            </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('oferta-name').value;
            const price = document.getElementById('oferta-price').value;
            const price_oferta = document.getElementById('oferta-price-oferta').value;
            const description = document.getElementById('oferta-description').value;
            const imageFiles = document.getElementById('oferta-image').files;
            const selectedMeasures = Array.from(document.getElementById('oferta-measures').selectedOptions).map(option => Number(option.value));

            if (!name || !price || !price_oferta || !description || imageFiles.length === 0 || selectedMeasures.length === 0) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }

            return { name, price, price_oferta, description, imageFiles, selectedMeasures };
        }
    });

    if (formValues) {
        const { name, price, price_oferta, description, imageFiles, selectedMeasures } = formValues;

        // Obtener los nombres de las medidas seleccionadas para mostrarlas
        const selectedMeasureNames = medidas
            .filter(medida => selectedMeasures.includes(medida.id))
            .map(medida => medida.nombre);

        // Crear el formulario con datos e imágenes
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            nombre: name,
            precioConOferta: price,
            precioSinOferta: price_oferta,
            descripcion: description,
            idSubCategoria: subcategoryId,
            medidas: selectedMeasures
        }));

        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('files', imageFiles[i]);
        }

        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/ofertas/upload`, {
                method: 'POST',
                body: formData
            });
            
            const { data, ok } = response;
            console.log('Response from API:', response); // Imprime la respuesta completa
            
            if (ok) {
                console.log('Oferta guardada con éxito en el servidor:', data);
                Swal.fire('Éxito', 'Oferta agregada con éxito.', 'success');
                createOfertaElement(subcategoryId, data.id, name, price, price_oferta, description, imageFiles[0], selectedMeasureNames);
            } else {
                console.error('Error en la respuesta:', data);
                Swal.fire('Error', data.error || 'Hubo un error al agregar la oferta', 'error');
            }
        } catch (error) {
            console.error('Error al agregar la oferta:', error);
            Swal.fire('Error', 'Hubo un error al agregar la oferta', 'error');
        }
    }
}


function createOfertaElement(subcategoryId, ofertaId, name, price, price_oferta, description, imageFile, measureNames) {
    const subcategoryDiv = document.getElementById(`subcategoria-${subcategoryId}`);
    if (subcategoryDiv) {
        const ofertaRowDiv = subcategoryDiv.querySelector('.ofertas-row');

        // Crear el contenedor del producto
        const ofertaContainerDiv = document.createElement('div');
        ofertaContainerDiv.classList.add('oferta-container');

        // Crear el div del producto
        const ofertaDiv = document.createElement('div');
        ofertaDiv.classList.add('oferta-index');
        ofertaDiv.id = `oferta-${ofertaId}`;

        // Mostrar la imagen del producto
        const ofertaImg = document.createElement('img');
        ofertaImg.src = URL.createObjectURL(imageFile);
        ofertaImg.alt = name;

        // Crear el div para la información del producto
        const ofertaInfoDiv = document.createElement('div');
        ofertaInfoDiv.classList.add('oferta-info');
        ofertaInfoDiv.innerHTML = `
            <strong>${name}</strong> <br>
            <p>${description}</p>
            <div class="divPrecio"> $${price} </div>
            <div class="divPrecio"> $${price_oferta} </div>
            <div class="medidasProducto"><strong>Medidas:</strong> ${measureNames.join(', ')}</div>
        `;

        ofertaDiv.appendChild(ofertaImg);
        ofertaDiv.appendChild(ofertaInfoDiv);

        // Crear el div de los botones
        const ofertaButtonsDiv = document.createElement('div');
        ofertaButtonsDiv.classList.add('oferta-buttons');
        ofertaButtonsDiv.innerHTML = `
    <div class="cont-btnOferta">
        <button class="edit modOferta" onclick="editOferta(${ofertaId}, '${name}', ${price}, '${description}')"><i class="bi bi-pencil-square"></i> Editar Oferta</button>
        <button class="delete delOferta" onclick="deleteOferta(${ofertaId})"><i class="bi bi-trash"></i> Eliminar Oferta</button>
    </div>
        `;

        // Añadir el div del producto y los botones al contenedor
        ofertaContainerDiv.appendChild(ofertaDiv);
        ofertaContainerDiv.appendChild(ofertaButtonsDiv);

        // Añadir el contenedor del producto a la fila de productos
        ofertaRowDiv.appendChild(ofertaContainerDiv);
    } else {
        console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
    }
}


async function deleteOferta(productId) {
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
                const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/ofertas/${productId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    Swal.fire('Éxito', 'Oferta eliminado con éxito.', 'success');
                    await fetchPromociones(); // Actualizar la carta después de eliminar
                } else {
                    const errorData = await response.json();
                    Swal.fire('Error', errorData.message || 'Hubo un error al eliminar la oferta', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar la oferta:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la oferta', 'error');
            }
        }
    });
}

async function editOferta(ofertaId, currentName, currentPrice, currentDescription, currentPriceOferta, currentMeasures = []) {
    const medidas = await fetchMedidas();

    if (!Array.isArray(medidas) || medidas.length === 0) {
        console.error('No se pudieron obtener las medidas.');
        Swal.fire('Error', 'No se pudieron obtener las medidas para editar el producto.', 'error');
        return;
    }

    const { value: formValues } = await Swal.fire({
        title: 'Editar Oferta',
        html: `
            <input id="edit-oferta-name" class="swal2-input" placeholder="Nombre de la oferta" value="${currentName}">
            <input id="edit-oferta-price" type="number" class="swal2-input" placeholder="Precio de la oferta" value="${currentPrice}">
            <input id="edit-oferta-price-oferta" type="number" class="swal2-input" placeholder="Precio de la oferta oferta" value="${currentPriceOferta}">
            <input id="edit-oferta-description" class="swal2-input" placeholder="Descripción de la oferta" value="${currentDescription}">
            <input id="edit-oferta-image" type="file" class="swal2-file" multiple>
            <select id="edit-oferta-measures" class="swal2-select" multiple style="width: 100%; padding: 5px;">
                ${medidas.map(medida => `<option value="${medida.id}" ${currentMeasures.includes(medida.id) ? 'selected' : ''}>${medida.nombre}</option>`).join('')}
            </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('edit-oferta-name').value;
            const price = document.getElementById('edit-oferta-price').value;
            const price_oferta = document.getElementById('edit-oferta-price-oferta').value;
            const description = document.getElementById('edit-oferta-description').value;
            const imageFiles = document.getElementById('edit-oferta-image').files;
            const selectedMeasures = Array.from(document.getElementById('edit-oferta-measures').selectedOptions).map(option => Number(option.value));

            if (!name || !price || !price_oferta || !description || selectedMeasures.length === 0) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return false;
            }

            return { name, price, price_oferta, description, imageFiles, selectedMeasures };
        }
    });

    if (formValues) {
        const { name, price, price_oferta, description, imageFiles, selectedMeasures } = formValues;

        // Crear el formulario con datos e imágenes
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            nombre: name,
            precioConOferta: price,
            precioSinOferta: price_oferta,
            descripcion: description,
            nuevasMedidas: selectedMeasures
        }));

        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('files', imageFiles[i]);
        }

        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/ofertas/${ofertaId}`, {
                method: 'PUT',
                body: formData
            });

            const { data, ok } = response;
            console.log('Response from API:', response); // Imprime la respuesta completa
            
            if (ok) {
                console.log('Oferta actualizada con éxito en el servidor:', data);
                Swal.fire('Éxito', 'Oferta editada con éxito.', 'success');
                // Actualiza la UI según los cambios realizados
                updateOfertaElement(ofertaId, name, price, price_oferta, description, selectedMeasures, imageFiles[0]);
            } else {
                console.error('Error en la respuesta:', data);
                Swal.fire('Error', data.error || 'Hubo un error al editar la oferta', 'error');
            }
        } catch (error) {
            console.error('Error al editar la oferta:', error);
            Swal.fire('Error', 'Hubo un error al editar la oferta', 'error');
        }
    }
}

function updateOfertaElement(ofertaId, name, price, price_oferta, description, measureNames, imageFile) {
    const ofertaDiv = document.getElementById(`oferta-${ofertaId}`);
    if (ofertaDiv) {
        const ofertaImg = ofertaDiv.querySelector('img');
        const ofertaInfoDiv = ofertaDiv.querySelector('.oferta-info');

        // Actualizar la imagen si hay una nueva
        if (imageFile) {
            ofertaImg.src = URL.createObjectURL(imageFile);
        }

        // Actualizar los datos de la oferta
        ofertaInfoDiv.innerHTML = `
            <strong>${name}</strong> <br>
            <p>${description}</p>
            <div class="divPrecio"> $${price} </div>
            <div class="divPrecio"> $${price_oferta} </div>
            <div class="medidasProducto"><strong>Medidas:</strong> ${measureNames.join(', ')}</div>
        `;
    } else {
        console.error(`No se encontró el elemento con id oferta-${ofertaId}`);
    }
}


window.onload = () => {
    fetchPromociones();
};
