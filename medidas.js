//En esta seccion tengo el CRUD de medidas

/* Inicio Medidas */

async function fetchMedidas() {
    try {
        const response = await fetch('https://cardelli-backend.vercel.app/api/cardelli/medidas');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }        
        console.log(response);
        
        const data = await response.json();  // Convertimos la respuesta a JSON
        console.log(data);
        displayMedidas(data);  // Llamamos a la función que muestra las medidas
    } catch (error) {
        console.error('Error fetching medidas:', error);
    }
}

/*MOSTRAR LAS MEDIDAS */

function displayMedidas(data) {
    if (!Array.isArray(data)) {
        console.error('Los datos de las medidas no son un array:', data);
        return;
    }

    const medidasDiv = document.getElementById('medidas');  // Contenedor para las medidas

    if (!medidasDiv) {
        console.error('No se encontró el elemento #medidas en el DOM');
        return;
    }

    // Vaciar el contenedor
    medidasDiv.innerHTML = '';

    // Recorrer las medidas y agregarlas al DOM
    data.forEach(medida => {
        const medidaDiv = document.createElement('div');
        medidaDiv.className = 'medida-item';
        medidaDiv.id = `medida-${medida.id}`;
        medidaDiv.innerHTML = `
            <h3>${medida.nombre}</h3>
            <div class="contenedorBotonesMedida">
                <button class="edit" onclick="editMedida(${medida.id}, '${medida.nombre}')"><i class="bi bi-pencil-square"></i> Editar Medida</button>
                <button class="delete" onclick="deleteMedida(${medida.id})"><i class="bi bi-trash"></i> Eliminar Medida</button>
            </div>
        `;
        medidasDiv.appendChild(medidaDiv);
    });
}

// Agregar medida

/* AGREGAR MEDIDA */
async function addMedida() {
    const { value: medidaNombre } = await Swal.fire({
        title: 'Agregar Medida',
        input: 'text',
        inputLabel: 'Nombre de la medida',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (medidaNombre) {
        try {
            const response = await fetchWithAuth('https://cardelli-backend.vercel.app/api/cardelli/medidas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: medidaNombre })
            });

            if (response.ok) {
                console.log(response);
                
                const data = response.data;  // Accedemos directamente a los datos
                Swal.fire('Éxito', 'Medida creada con éxito.', 'success');
                console.log("Respuesta de la API al agregar medida:", data);
                createMedidaElement(data.id, data.nombre); // Función para crear el elemento visual
            } else {
                Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la medida', 'error');
            }
        } catch (error) {
            console.error('Error al crear la medida:', error);
            Swal.fire('Error', 'Hubo un error al crear la medida', 'error');
        }
    }
}


// Editar medida

async function editMedida(medidaId, medidaNombre) {
    const { value: medidaTitle } = await Swal.fire({
        title: 'Editar Medida',
        input: 'text',
        inputLabel: 'Nuevo nombre de la medida',
        inputValue: medidaNombre,  // Mostrar el nombre actual por defecto
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return '¡Debes escribir algo!';
            }
        }
    });

    if (medidaTitle) {
        try {
            const response = await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/medidas/${medidaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre: medidaTitle })
            });

            if (response.ok) {
                const medidaElement = document.querySelector(`#medida-${medidaId} h3`);
                if (medidaElement) {
                    medidaElement.textContent = medidaTitle;
                    Swal.fire('Éxito', 'Medida modificada con éxito.', 'success');
                } else {
                    console.error(`No se encontró el elemento con id medida-${medidaId}`);
                }
            } else {
                Swal.fire('Error', 'Hubo un error al editar la medida', 'error');
            }
        } catch (error) {
            console.error('Error al editar la medida:', error);
            Swal.fire('Error', 'Hubo un error al editar la medida', 'error');
        }
    }
}

/* ELIMINAR MEDIDA */
async function deleteMedida(medidaId) {
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
                await fetchWithAuth(`https://cardelli-backend.vercel.app/api/cardelli/medidas/${medidaId}`, {
                    method: 'DELETE'
                });

                Swal.fire('Eliminada', 'La medida ha sido eliminada con éxito.', 'success');
                
                // Actualizar la UI y remover la medida eliminada
                const medidaElement = document.getElementById(`medida-${medidaId}`);
                if (medidaElement) {
                    medidaElement.remove();
                }
            } catch (error) {
                console.error('Error al eliminar la medida:', error);
                Swal.fire('Error', 'Hubo un error al eliminar la medida.', 'error');
            }
        }
    });
}

function createMedidaElement(medidaId, medidaNombre) {
    const medidasDiv = document.getElementById('medidas');

    if (!medidasDiv) {
        console.error('No se encontró el contenedor #medidas en el DOM');
        Swal.fire('Error', 'No se encontró el contenedor para las medidas', 'error');
        return;
    }

    const medidaDiv = document.createElement('div');
    medidaDiv.className = 'medida-item';
    medidaDiv.id = `medida-${medidaId}`;
    medidaDiv.innerHTML = `
        <h3>${medidaNombre}</h3>
        <div class="contenedorBotonesMedida">
            <button class="edit" onclick="editMedida(${medidaId}, '${medidaNombre}')"><i class="bi bi-pencil-square"></i> Editar Medida</button>
            <button class="delete" onclick="deleteMedida(${medidaId})"><i class="bi bi-trash"></i> Eliminar Medida</button>
        </div>
    `;

    medidasDiv.appendChild(medidaDiv);
}


window.onload = () => {
    fetchMedidas();
};