
// =====================================================
// 1. CONFIGURACIÓN CLOUDINARY
// =====================================================

const FRACT_SERVICIOS_CLOUD_NAME = "dkxto4ymq";
const FRACT_SERVICIOS_UPLOAD_PRESET = "inventario_preset";

const FRACT_SERVICIOS_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${FRACT_SERVICIOS_CLOUD_NAME}/image/upload`;


// =====================================================
// 2. CONFIGURACIÓN DEL MÓDULO
// =====================================================

const FRACT_SERVICIOS_MAX_IMAGENES = 15;

let fractServiciosImagenesSeleccionadas = [];


// =====================================================
// 3. SELECCIONAR IMÁGENES
// =====================================================


// =====================================================
// 3. SELECCIONAR IMÁGENES
// =====================================================


// =====================================================
// 3. SELECCIONAR IMÁGENES
// =====================================================

document.getElementById("imagenesServicio").addEventListener("change", function () {

    const fractServiciosArchivos = Array.from(this.files);

    const fractServiciosFormatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    // Función para sincronizar el input con el arreglo
    const sincronizarImagenes = () => {

        const transferencia = new DataTransfer();

        fractServiciosImagenesSeleccionadas.forEach(archivo => {
            transferencia.items.add(archivo);
        });

        this.files = transferencia.files;
    };

    // Validar cantidad total
    if (
        fractServiciosImagenesSeleccionadas.length +
        fractServiciosArchivos.length >
        FRACT_SERVICIOS_MAX_IMAGENES
    ) {

        alert(`Puedes seleccionar como máximo ${FRACT_SERVICIOS_MAX_IMAGENES} imágenes.`);

        sincronizarImagenes();

        return;
    }

    // Validar formatos
    for (const archivo of fractServiciosArchivos) {

        if (!fractServiciosFormatosPermitidos.includes(archivo.type)) {

            alert(`El archivo ${archivo.name} no tiene un formato permitido.`);

            sincronizarImagenes();

            return;
        }
    }

    // Acumular imágenes
    fractServiciosImagenesSeleccionadas.push(...fractServiciosArchivos);

    // Sincronizar el input con todas las imágenes
    sincronizarImagenes();

    // Mostrar vista previa
    fractServiciosMostrarVistaPrevia();

});




// =====================================================
// 4. MOSTRAR VISTA PREVIA
// =====================================================

function fractServiciosMostrarVistaPrevia() {

    const fractServiciosContenedor = document.getElementById("vistaPreviaImagenesServicio");

    // Liberar URLs anteriores
    fractServiciosContenedor.querySelectorAll("img").forEach(fractServiciosImg => {

        if (fractServiciosImg.dataset.url) {
            URL.revokeObjectURL(fractServiciosImg.dataset.url);
        }

    });

    fractServiciosContenedor.innerHTML = "";

    fractServiciosImagenesSeleccionadas.forEach((fractServiciosArchivo, fractServiciosIndex) => {

        const fractServiciosUrl = URL.createObjectURL(fractServiciosArchivo);

        const fractServiciosElemento = document.createElement("div");

        fractServiciosElemento.style.cssText = `
            display:inline-block;
            position:relative;
            margin:5px;
            width:100px;
            vertical-align:top;
        `;

        const fractServiciosImagen = document.createElement("img");

        fractServiciosImagen.src = fractServiciosUrl;
        fractServiciosImagen.dataset.url = fractServiciosUrl;
        fractServiciosImagen.alt = `Imagen ${fractServiciosIndex + 1}`;

        fractServiciosImagen.style.cssText = `
            width:100px;
            height:100px;
            object-fit:cover;
            border-radius:8px;
        `;

        const fractServiciosBoton = document.createElement("button");

        fractServiciosBoton.type = "button";
        fractServiciosBoton.className = "btn btn-danger btn-sm";
        fractServiciosBoton.innerHTML = "&times;";

        fractServiciosBoton.style.cssText = `
            position:absolute;
            top:3px;
            right:3px;
            padding:2px 6px;
        `;

        fractServiciosBoton.addEventListener("click", () => {

            fractServiciosEliminarImagen(fractServiciosIndex);

        });

        const fractServiciosTexto = document.createElement("small");

        fractServiciosTexto.textContent = `Imagen ${fractServiciosIndex + 1}`;

        fractServiciosTexto.style.cssText = `
            display:block;
            text-align:center;
        `;

        fractServiciosElemento.appendChild(fractServiciosImagen);
        fractServiciosElemento.appendChild(fractServiciosBoton);
        fractServiciosElemento.appendChild(fractServiciosTexto);

        fractServiciosContenedor.appendChild(fractServiciosElemento);

    });
}


// =====================================================
// 5. ELIMINAR IMAGEN SELECCIONADA
// =====================================================

function fractServiciosEliminarImagen(fractServiciosIndex) {

    fractServiciosImagenesSeleccionadas.splice(fractServiciosIndex, 1);

    const fractServiciosInput = document.getElementById("imagenesServicio");

    const fractServiciosTransferencia = new DataTransfer();

    fractServiciosImagenesSeleccionadas.forEach(fractServiciosArchivo => {

        fractServiciosTransferencia.items.add(fractServiciosArchivo);

    });

    fractServiciosInput.files = fractServiciosTransferencia.files;

    fractServiciosMostrarVistaPrevia();
}


// =====================================================
// 6. SUBIR IMAGEN A CLOUDINARY
// =====================================================

async function fractServiciosSubirImagen(fractServiciosArchivo) {

    const fractServiciosFormData = new FormData();

    fractServiciosFormData.append("file", fractServiciosArchivo);

    fractServiciosFormData.append(
        "upload_preset",
        FRACT_SERVICIOS_UPLOAD_PRESET
    );

    const fractServiciosRespuesta = await fetch(
        FRACT_SERVICIOS_UPLOAD_URL,
        {
            method: "POST",
            body: fractServiciosFormData
        }
    );

    if (!fractServiciosRespuesta.ok) {

        throw new Error("Error al subir una imagen a Cloudinary.");

    }

    const fractServiciosDatos = await fractServiciosRespuesta.json();

    if (!fractServiciosDatos.secure_url || !fractServiciosDatos.public_id) {

        throw new Error("Cloudinary no devolvió los datos de la imagen.");

    }

    return {

        urlImagen: fractServiciosDatos.secure_url,

        publicId: fractServiciosDatos.public_id,

        descImagen: null,

        ordenFoto: 0

    };
}


// =====================================================
// 7. REGISTRAR SERVICIO
// =====================================================

async function fractServiciosGuardar() {

    const fractServiciosFormulario = document.getElementById("formAgregarServicio");

    const fractServiciosBoton = document.getElementById("btnGuardarServicio");

    if (!fractServiciosFormulario.checkValidity()) {

        fractServiciosFormulario.reportValidity();

        return;
    }

    const fractServiciosOrden = parseInt(
        document.getElementById("ordenServicio").value
    ) || 0;

    // Los servicios normales requieren al menos una imagen.
    // Los beneficios (OrdenServicio = 0) no requieren fotografías.
    if (
        fractServiciosOrden > 0 &&
        fractServiciosImagenesSeleccionadas.length === 0
    ) {

        alert("Debes seleccionar al menos una imagen para este servicio.");

        return;
    }

    if (fractServiciosImagenesSeleccionadas.length > FRACT_SERVICIOS_MAX_IMAGENES) {

        alert(`Puedes seleccionar como máximo ${FRACT_SERVICIOS_MAX_IMAGENES} imágenes.`);

        return;
    }

    const fractServiciosHtmlOriginal = fractServiciosBoton.innerHTML;

    fractServiciosBoton.disabled = true;

    fractServiciosBoton.innerHTML = "Guardando servicio...";

    try {

        // ---------------------------------------------
        // SUBIR IMÁGENES
        // ---------------------------------------------

        const fractServiciosImagenes = [];

        for (
            let fractServiciosI = 0;
            fractServiciosI < fractServiciosImagenesSeleccionadas.length;
            fractServiciosI++
        ) {

            const fractServiciosImagen = await fractServiciosSubirImagen(
                fractServiciosImagenesSeleccionadas[fractServiciosI]
            );

            fractServiciosImagen.ordenFoto = fractServiciosI + 1;

            fractServiciosImagenes.push(fractServiciosImagen);

        }


        // ---------------------------------------------
        // CONSTRUIR OBJETO
        // ---------------------------------------------

        const fractServiciosObjeto = {

            titulo: document.getElementById("tituloServicio").value.trim(),

            resumen: document.getElementById("resumenServicio").value.trim() || null,

            descripcion: document.getElementById("descripcionServicio").value.trim() || null,

            icono: document.getElementById("iconoServicio").value.trim() || null,

            ordenServicio: fractServiciosOrden,

            estado: document.getElementById("estadoServicio").value === "true",

            usuario: fractServiciosUsuarioActual,

            imagenes: fractServiciosImagenes

        };


        // ---------------------------------------------
        // ENVIAR AL CONTROLADOR FRONT
        // ---------------------------------------------

        const fractServiciosRespuesta = await fetch("/Servicios/Registrar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(fractServiciosObjeto)

        });

        const fractServiciosContenido = await fractServiciosRespuesta.text();

        let fractServiciosResultado = null;

        try {

            fractServiciosResultado = fractServiciosContenido
                ? JSON.parse(fractServiciosContenido)
                : null;

        } catch {

            fractServiciosResultado = null;

        }

        if (!fractServiciosRespuesta.ok || fractServiciosResultado?.success === false) {

            throw new Error(
                fractServiciosResultado?.message ||
                fractServiciosContenido ||
                "No se pudo registrar el servicio."
            );

        }


        // ---------------------------------------------
        // REGISTRO EXITOSO
        // ---------------------------------------------

        if (typeof mostrarToast === "function") {

            mostrarToast("Servicio guardado correctamente");

        } else {

            alert("Servicio guardado correctamente.");

        }

        fractServiciosFormulario.reset();

        fractServiciosImagenesSeleccionadas = [];

        fractServiciosMostrarVistaPrevia();

        $('#modalAgregarServicio').modal('hide');

    }
    catch (fractServiciosError) {

        console.error("Error al registrar servicio:", fractServiciosError);

        alert(
            fractServiciosError.message ||
            "Ocurrió un error al registrar el servicio."
        );

    }
    finally {

        fractServiciosBoton.disabled = false;

        fractServiciosBoton.innerHTML = fractServiciosHtmlOriginal;

    }
}


// =====================================================
// 8. EVENTO DEL FORMULARIO
// =====================================================

document.getElementById("formAgregarServicio").addEventListener("submit", function (fractServiciosEvento) {

    fractServiciosEvento.preventDefault();

    fractServiciosGuardar();

});


// =====================================================
// 9. LIMPIAR AL CERRAR EL MODAL
// =====================================================

$('#modalAgregarServicio').on('hidden.bs.modal', function () {

    document.getElementById("formAgregarServicio").reset();

    fractServiciosImagenesSeleccionadas = [];

    fractServiciosMostrarVistaPrevia();

});



// ==========================================
// LISTAR SERVICIOS REGISTRADOS
// ==========================================

async function cargarListaServicios() {

    const fractServiciosContenedor = document.getElementById("tablaServicios");
    const fractServiciosLista = document.getElementById("listaAdministrarServicios");

    fractServiciosContenedor.innerHTML = `
        <div class="text-center p-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Cargando servicios...</p>
        </div>
    `;

    fractServiciosLista.style.display = "block";

    try {

        const fractServiciosRespuesta = await fetch("/Servicios/Listar");

        if (!fractServiciosRespuesta.ok) {
            throw new Error("No se pudieron obtener los servicios.");
        }

        const fractServiciosDatos = await fractServiciosRespuesta.json();

        // Guardamos los registros para utilizarlos posteriormente
        window.fractServiciosRegistros = fractServiciosDatos;

        fractServiciosContenedor.innerHTML = "";

        if (!Array.isArray(fractServiciosDatos) || fractServiciosDatos.length === 0) {

            fractServiciosContenedor.innerHTML = `
                <div class="alert alert-info">
                    No hay servicios registrados.
                </div>
            `;

            return;
        }

        // CONTENEDOR DE TABLA
        const fractServiciosTabla = document.createElement("div");
        fractServiciosTabla.className = "table-responsive";

        const fractServiciosTable = document.createElement("table");
        fractServiciosTable.className = "table table-bordered table-hover";

        fractServiciosTable.innerHTML = `
            <thead class="thead-light">
                <tr>
                    <th>ID</th>
                    <th>Fotografías</th>
                    <th>Título</th>
                    <th>Resumen</th>
                    <th>Descripción</th>
                    <th>Icono</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Fecha de registro</th>
                    <th>Registrado por</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const fractServiciosTbody = fractServiciosTable.querySelector("tbody");

        // RECORRER SERVICIOS
        fractServiciosDatos.forEach(fractServicio => {

            const fractServicioId =
                fractServicio.idServicio ?? fractServicio.IdServicio;

            const fractServicioImagenes =
                fractServicio.imagenes ?? fractServicio.Imagenes ?? [];

            const fractServicioFila = document.createElement("tr");

            // FOTOGRAFÍAS
            const fractServicioCeldaImagenes = document.createElement("td");

            fractServicioCeldaImagenes.style.minWidth = "220px";

            if (fractServicioImagenes.length > 0) {

                const fractServicioGaleria = document.createElement("div");

                fractServicioGaleria.style.cssText = `
                    display:flex;
                    flex-wrap:wrap;
                    gap:8px;
                    align-items:center;
                `;

                fractServicioImagenes.forEach(fractImagen => {

                    const fractUrl =
                        fractImagen.urlImagen ?? fractImagen.UrlImagen;

                    if (!fractUrl) return;

                    const fractMiniatura = document.createElement("img");

                    fractMiniatura.src = fractUrl;
                    fractMiniatura.alt = "Fotografía del servicio";
                    fractMiniatura.loading = "lazy";

                    fractMiniatura.style.cssText = `
                        width:65px;
                        height:65px;
                        object-fit:cover;
                        border-radius:6px;
                        border:1px solid #ddd;
                    `;

                    fractServicioGaleria.appendChild(fractMiniatura);
                });

                fractServicioCeldaImagenes.appendChild(fractServicioGaleria);

            } else {

                fractServicioCeldaImagenes.textContent = "Sin fotografías";

            }

            // FUNCIÓN PARA CREAR CELDAS DE TEXTO
            function fractServiciosCrearCelda(valor) {

                const celda = document.createElement("td");

                celda.textContent =
                    valor === null || valor === undefined || valor === ""
                        ? "-"
                        : valor;

                return celda;
            }

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(fractServicioId)
            );

            fractServicioFila.appendChild(fractServicioCeldaImagenes);

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.titulo ?? fractServicio.Titulo
                )
            );

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.resumen ?? fractServicio.Resumen
                )
            );

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.descripcion ?? fractServicio.Descripcion
                )
            );

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.icono ?? fractServicio.Icono
                )
            );

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.ordenServicio ?? fractServicio.OrdenServicio
                )
            );

            // ESTADO
            const fractServicioEstado =
                fractServicio.estado ?? fractServicio.Estado;

            const fractServicioCeldaEstado = document.createElement("td");
            const fractServicioBadge = document.createElement("span");

            fractServicioBadge.className = fractServicioEstado
                ? "badge badge-success"
                : "badge badge-secondary";

            fractServicioBadge.textContent = fractServicioEstado
                ? "Activo"
                : "Inactivo";

            fractServicioCeldaEstado.appendChild(fractServicioBadge);
            fractServicioFila.appendChild(fractServicioCeldaEstado);

            // FECHA
            const fractServicioFecha =
                fractServicio.fechRegist ?? fractServicio.FechRegist;

            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicioFecha
                        ? new Date(fractServicioFecha).toLocaleString("es-PE")
                        : "-"
                )
            );

            // USUARIO
            fractServicioFila.appendChild(
                fractServiciosCrearCelda(
                    fractServicio.usuaRegist ?? fractServicio.UsuaRegist
                )
            );


            // ACCIONES
            const fractServicioCeldaAcciones = document.createElement("td");

            fractServicioCeldaAcciones.style.cssText = `
                white-space:nowrap;
                display:flex;
                gap:6px;
            `;

            // Botón Editar
            const fractServicioBotonEditar = document.createElement("button");

            fractServicioBotonEditar.type = "button";
            fractServicioBotonEditar.className = "btn btn-sm btn-primary";
            fractServicioBotonEditar.textContent = "Editar";

            fractServicioBotonEditar.addEventListener("click", function () {
                fractServiciosAbrirEdicion(fractServicioId);
            });

            // Botón Eliminar
            const fractServicioBotonEliminar = document.createElement("button");

            fractServicioBotonEliminar.type = "button";
            fractServicioBotonEliminar.className = "btn btn-sm btn-danger";
            fractServicioBotonEliminar.textContent = "Eliminar";

            fractServicioBotonEliminar.addEventListener("click", function () {
                fractServiciosEliminar(fractServicioId);
            });

            fractServicioCeldaAcciones.appendChild(fractServicioBotonEditar);
            fractServicioCeldaAcciones.appendChild(fractServicioBotonEliminar);

            fractServicioFila.appendChild(fractServicioCeldaAcciones);
            fractServiciosTbody.appendChild(fractServicioFila);



        });

        fractServiciosTabla.appendChild(fractServiciosTable);
        fractServiciosContenedor.appendChild(fractServiciosTabla);

    } catch (fractServiciosError) {

        console.error("Error al listar servicios:", fractServiciosError);

        fractServiciosContenedor.innerHTML = `
            <div class="alert alert-danger">
                No se pudieron cargar los servicios.
                ${fractServiciosError.message}
            </div>
        `;
    }
}







/////////////////////////EDITAR

// Variables para edición
let fractServiciosServicioEditando = null;

let fractServiciosImagenesEdicion = [];

let fractServiciosArchivosNuevos = [];




// =====================================================
// 10. ABRIR MODAL DE EDICIÓN
// =====================================================

function fractServiciosAbrirEdicion(id) {

    const fractServicio = (window.fractServiciosRegistros || []).find(item =>
        (item.idServicio ?? item.IdServicio) == id
    );

    if (!fractServicio) {
        alert("No se encontró el servicio seleccionado.");
        return;
    }

    fractServiciosServicioEditando = id;

    // Cargar datos del servicio
    document.getElementById("tituloEditarServicioInput").value =
        fractServicio.titulo ?? fractServicio.Titulo ?? "";

    document.getElementById("resumenEditarServicio").value =
        fractServicio.resumen ?? fractServicio.Resumen ?? "";

    document.getElementById("descripcionEditarServicio").value =
        fractServicio.descripcion ?? fractServicio.Descripcion ?? "";

    document.getElementById("iconoEditarServicio").value =
        fractServicio.icono ?? fractServicio.Icono ?? "";

    document.getElementById("ordenEditarServicio").value =
        fractServicio.ordenServicio ?? fractServicio.OrdenServicio ?? 0;

    document.getElementById("estadoEditarServicio").value =
        String(fractServicio.estado ?? fractServicio.Estado ?? true);

    // Recuperar fotografías existentes
    const imagenes = fractServicio.imagenes ?? fractServicio.Imagenes ?? [];

    fractServiciosImagenesEdicion = imagenes.map(imagen => ({
        tipo: "existente",
        idImagen: imagen.idImagen ?? imagen.IdImagen,
        urlImagen: imagen.urlImagen ?? imagen.UrlImagen,
        publicId: imagen.publicId ?? imagen.PublicId,
        descImagen: imagen.descImagen ?? imagen.DescImagen ?? null
    }));

    // Limpiar fotografías nuevas
    fractServiciosArchivosNuevos = [];

    document.getElementById("imagenesEditarServicio").value = "";

    document.getElementById("mensajeEditarServicio").style.display = "none";

    fractServiciosMostrarImagenesEdicion();

    $('#modalEditarServicio').modal('show');
}


// =====================================================
// 11. MOSTRAR FOTOGRAFÍAS EN EDICIÓN
// =====================================================

function fractServiciosMostrarImagenesEdicion() {

    const contenedor = document.getElementById(
        "vistaPreviaImagenesEditarServicio"
    );

    contenedor.innerHTML = "";

    const imagenes = [
        ...fractServiciosImagenesEdicion,
        ...fractServiciosArchivosNuevos
    ];

    imagenes.forEach((imagen, index) => {

        const elemento = document.createElement("div");

        elemento.style.cssText = `
            position:relative;
            width:100px;
            margin:5px;
        `;

        const img = document.createElement("img");

        if (imagen.tipo === "existente") {
            img.src = imagen.urlImagen;
        } else {
            img.src = imagen.urlTemporal;
        }

        img.alt = `Imagen ${index + 1}`;

        img.style.cssText = `
            width:100px;
            height:100px;
            object-fit:cover;
            border-radius:8px;
        `;

        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "btn btn-danger btn-sm";
        boton.innerHTML = "&times;";

        boton.style.cssText = `
            position:absolute;
            top:3px;
            right:3px;
            padding:2px 6px;
        `;

        boton.addEventListener("click", () => {

            if (imagen.tipo === "existente") {

                fractServiciosImagenesEdicion.splice(
                    fractServiciosImagenesEdicion.indexOf(imagen),
                    1
                );

            } else {

                URL.revokeObjectURL(imagen.urlTemporal);

                fractServiciosArchivosNuevos.splice(
                    fractServiciosArchivosNuevos.indexOf(imagen),
                    1
                );

            }

            fractServiciosMostrarImagenesEdicion();

        });

        const texto = document.createElement("small");

        texto.textContent = `Imagen ${index + 1}`;

        texto.style.cssText = `
            display:block;
            text-align:center;
        `;

        elemento.appendChild(img);
        elemento.appendChild(boton);
        elemento.appendChild(texto);

        contenedor.appendChild(elemento);

    });
}


// =====================================================
// 12. SELECCIONAR NUEVAS FOTOGRAFÍAS
// =====================================================

document.getElementById("imagenesEditarServicio").addEventListener(
    "change",
    function () {

        const archivos = Array.from(this.files);

        const formatosPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const totalActual =
            fractServiciosImagenesEdicion.length +
            fractServiciosArchivosNuevos.length;

        if (totalActual + archivos.length > FRACT_SERVICIOS_MAX_IMAGENES) {

            alert(
                `Puedes tener como máximo ${FRACT_SERVICIOS_MAX_IMAGENES} fotografías en total.`
            );

            this.value = "";
            return;
        }

        for (const archivo of archivos) {

            if (!formatosPermitidos.includes(archivo.type)) {

                alert(`El archivo ${archivo.name} no tiene un formato permitido.`);

                this.value = "";
                return;
            }

        }

        archivos.forEach(archivo => {

            fractServiciosArchivosNuevos.push({
                tipo: "nuevo",
                archivo: archivo,
                urlTemporal: URL.createObjectURL(archivo)
            });

        });

        // Permite volver a seleccionar el mismo archivo
        this.value = "";

        fractServiciosMostrarImagenesEdicion();

    }
);


// =====================================================
// 13. GUARDAR EDICIÓN DEL SERVICIO
// =====================================================

async function fractServiciosGuardarEdicion() {

    const formulario = document.getElementById("formEditarServicio");

    const boton = document.getElementById("btnGuardarEdicionServicio");

    const mensaje = document.getElementById("mensajeEditarServicio");

    if (!formulario.checkValidity()) {

        formulario.reportValidity();
        return;

    }

    if (!fractServiciosServicioEditando) {

        alert("No se ha seleccionado ningún servicio para editar.");
        return;

    }

    const ordenServicio = parseInt(
        document.getElementById("ordenEditarServicio").value
    ) || 0;

    const totalImagenes =
        fractServiciosImagenesEdicion.length +
        fractServiciosArchivosNuevos.length;

    // Los servicios normales requieren al menos una fotografía.
    // Los beneficios (OrdenServicio = 0) pueden editarse sin fotografías.
    if (ordenServicio > 0 && totalImagenes === 0) {

        alert("El servicio debe tener al menos una fotografía.");
        return;

    }

    if (totalImagenes > FRACT_SERVICIOS_MAX_IMAGENES) {

        alert(`Puedes tener como máximo ${FRACT_SERVICIOS_MAX_IMAGENES} fotografías.`);
        return;

    }

    const htmlOriginal = boton.innerHTML;

    boton.disabled = true;
    boton.innerHTML = "Guardando cambios...";

    mensaje.style.display = "none";

    try {

        // ---------------------------------------------
        // CONSERVAR FOTOGRAFÍAS EXISTENTES
        // ---------------------------------------------

        const imagenes = fractServiciosImagenesEdicion.map(imagen => ({
            urlImagen: imagen.urlImagen,
            publicId: imagen.publicId,
            descImagen: imagen.descImagen,
            ordenFoto: 0
        }));


        // ---------------------------------------------
        // SUBIR FOTOGRAFÍAS NUEVAS
        // ---------------------------------------------

        for (const imagen of fractServiciosArchivosNuevos) {

            const resultado = await fractServiciosSubirImagen(
                imagen.archivo
            );

            imagenes.push(resultado);

        }


        // ---------------------------------------------
        // ASIGNAR ORDEN A LAS FOTOGRAFÍAS
        // ---------------------------------------------

        imagenes.forEach((imagen, index) => {

            imagen.ordenFoto = index + 1;

        });


        // ---------------------------------------------
        // CONSTRUIR OBJETO
        // ---------------------------------------------

        const objeto = {

            titulo: document.getElementById("tituloEditarServicioInput").value.trim(),

            resumen: document.getElementById("resumenEditarServicio").value.trim() || null,

            descripcion: document.getElementById("descripcionEditarServicio").value.trim() || null,

            icono: document.getElementById("iconoEditarServicio").value.trim() || null,

            ordenServicio: ordenServicio,

            estado: document.getElementById("estadoEditarServicio").value === "true",

            usuario: fractServiciosUsuarioActual,

            imagenes: imagenes

        };


        // ---------------------------------------------
        // ENVIAR AL CONTROLADOR FRONT
        // ---------------------------------------------

        const respuesta = await fetch(
            `/Servicios/Editar?id=${fractServiciosServicioEditando}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(objeto)
            }
        );

        const contenido = await respuesta.text();

        let resultado = null;

        try {

            resultado = contenido ? JSON.parse(contenido) : null;

        } catch {

            resultado = null;

        }

        if (!respuesta.ok || resultado?.success === false) {

            throw new Error(
                resultado?.message ||
                contenido ||
                "No se pudo actualizar el servicio."
            );

        }


        // ---------------------------------------------
        // ACTUALIZACIÓN EXITOSA
        // ---------------------------------------------

        if (typeof mostrarToast === "function") {

            mostrarToast("Servicio actualizado correctamente.");

        } else {

            alert("Servicio actualizado correctamente.");

        }

        $('#modalEditarServicio').modal('hide');

        await cargarListaServicios();

    }
    catch (error) {

        console.error("Error al editar servicio:", error);

        mensaje.textContent =
            error.message || "Ocurrió un error al actualizar el servicio.";

        mensaje.className = "alert alert-danger";
        mensaje.style.display = "block";

    }
    finally {

        boton.disabled = false;
        boton.innerHTML = htmlOriginal;

    }

}


// =====================================================
// 14. EVENTO DEL FORMULARIO DE EDICIÓN
// =====================================================

document.getElementById("formEditarServicio").addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();

        fractServiciosGuardarEdicion();

    }
);


// =====================================================
// 15. LIMPIAR AL CERRAR EL MODAL DE EDICIÓN
// =====================================================

$('#modalEditarServicio').on('hidden.bs.modal', function () {

    fractServiciosArchivosNuevos.forEach(imagen => {

        URL.revokeObjectURL(imagen.urlTemporal);

    });

    fractServiciosServicioEditando = null;

    fractServiciosImagenesEdicion = [];

    fractServiciosArchivosNuevos = [];

    document.getElementById("formEditarServicio").reset();

    document.getElementById(
        "vistaPreviaImagenesEditarServicio"
    ).innerHTML = "";

    const mensaje = document.getElementById("mensajeEditarServicio");

    mensaje.style.display = "none";
    mensaje.textContent = "";

});





// ==========================================
// ELIMINAR SERVICIO
// ==========================================

async function fractServiciosEliminar(id) {

    const confirmar = confirm(
        "¿Estás seguro de eliminar este servicio?\n\n" +
        "También se eliminarán sus fotografías de Cloudinary."
    );

    if (!confirmar) return;

    try {

        const respuesta = await fetch(`/Servicios/Eliminar?id=${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(
                resultado.message || "No se pudo eliminar el servicio."
            );
        }

        alert(resultado.message || "Servicio eliminado correctamente.");

        // Actualizar la tabla
        await cargarListaServicios();

    } catch (error) {

        console.error("Error al eliminar servicio:", error);

        alert(error.message || "Ocurrió un error al eliminar el servicio.");
    }
}
