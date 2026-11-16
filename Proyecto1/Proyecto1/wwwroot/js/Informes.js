

const FRACT_INFORMES_CLOUD_NAME = "dkxto4ymq";

const FRACT_INFORMES_UPLOAD_PRESET = "inventario_preset";

const FRACT_INFORMES_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${FRACT_INFORMES_CLOUD_NAME}/image/upload`

function agregarElementoSeccion() {

    const contenedor = document.getElementById("contenedorElementosSeccion");

    if (!contenedor) return;

    const numero = contenedor.querySelectorAll(".elemento-seccion").length + 1;

    const elemento = document.createElement("div");

    const idCheckbox = `permiteClickElemento${Date.now()}${Math.floor(Math.random() * 10000)}`;

    elemento.className = "elemento-seccion card mb-3";

    elemento.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">

            <strong>Elemento ${numero}</strong>

            <button type="button"
                    class="btn btn-danger btn-sm"
                    onclick="eliminarElementoSeccion(this)">

                <i class="feather icon-trash-2"></i>
                Eliminar

            </button>

        </div>

        <div class="card-body">

            <!-- TIPO -->
            <div class="form-group">
                <label>Tipo de elemento</label>

                <select class="form-control tipo-elemento-seccion"
                        required>

                    <option value="Texto">Texto</option>
                    <option value="Enlace">Enlace</option>
                    <option value="Correo">Correo</option>
                    <option value="Telefono">Teléfono</option>
                    <option value="Direccion">Dirección</option>
                    <option value="Imagen">Imagen</option>

                </select>
            </div>

            <!-- ETIQUETA -->
            <div class="form-group">
                <label>Etiqueta</label>

                <input type="text"
                       class="form-control etiqueta-elemento"
                       maxlength="200"
                       placeholder="Ej. Políticas de privacidad">
            </div>

            <!-- CONTENIDO -->
            <div class="form-group campo-contenido-elemento">
                <label>Contenido</label>

                <textarea class="form-control contenido-elemento"
                          rows="2"
                          placeholder="Escribe el contenido del elemento..."></textarea>
            </div>

            <!-- URL -->
            <div class="campo-url-elemento">

                <div class="form-group">
                    <label>URL de destino</label>

                    <input type="text"
                           class="form-control url-elemento"
                           maxlength="1000"
                           placeholder="Ej. https://www.ejemplo.com">
                </div>

                <div class="form-group">

                    <div class="custom-control custom-checkbox">

                        <input type="checkbox"
       class="custom-control-input permite-click-elemento"
       id="${idCheckbox}">

<label class="custom-control-label" for="${idCheckbox}">
    Permitir clic en este elemento
</label>

                    </div>

                </div>

            </div>

            <!-- IMAGEN -->
            
<!-- IMAGEN -->
<div class="form-group campo-imagen-elemento"
     style="display:none;">

    <label>Imagen del elemento</label>

    <input type="file"
           class="form-control-file archivo-imagen-elemento"
           accept="image/jpeg,image/png,image/webp">

    <small class="form-text text-muted">
        Formatos permitidos: JPG, PNG y WEBP.
    </small>

    <!-- VISTA PREVIA -->
    <div class="vista-previa-imagen-elemento"
         style="display:none; margin-top:12px;">

        <div style="position:relative; width:130px;">

            <img class="imagen-elemento-preview"
                 src=""
                 alt="Vista previa"
                 style="width:130px;
                        height:110px;
                        object-fit:cover;
                        border-radius:8px;
                        border:1px solid #ddd;">

            <button type="button"
                    class="btn btn-danger btn-sm btn-eliminar-imagen-elemento"
                    style="position:absolute;
                           top:4px;
                           right:4px;
                           padding:2px 7px;">

                &times;

            </button>

        </div>

    </div>

</div>


            <!-- ICONO -->
            <div class="form-group">
                <label>Icono</label>

                <input type="text"
                       class="form-control icono-elemento"
                       maxlength="100"
                       placeholder="Ej. file-text">
            </div>

            <div class="row">

                <!-- ORDEN -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Orden de visualización</label>

                        <input type="number"
                               class="form-control orden-elemento"
                               min="0"
                               value="${numero}"
                               required>
                    </div>
                </div>

                <!-- ESTADO -->
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Estado</label>

                        <select class="form-control estado-elemento"
                                required>

                            <option value="true" selected>Activo</option>
                            <option value="false">Inactivo</option>

                        </select>
                    </div>
                </div>

            </div>

        </div>
    `;

    contenedor.appendChild(elemento);

    actualizarCamposElemento(elemento);
}


// ==========================================
// MOSTRAR CAMPOS SEGÚN EL TIPO
// ==========================================


function actualizarCamposElemento(elemento) {

    const tipo = elemento.querySelector(".tipo-elemento-seccion").value;

    const campoContenido = elemento.querySelector(".campo-contenido-elemento");
    const campoUrl = elemento.querySelector(".campo-url-elemento");
    const campoImagen = elemento.querySelector(".campo-imagen-elemento");

    if (tipo === "Imagen") {

        campoContenido.style.display = "none";
        campoUrl.style.display = "block";
        campoImagen.style.display = "block";

    } else {

        campoContenido.style.display = "block";
        campoUrl.style.display = "block";
        campoImagen.style.display = "none";

    }
}



// ==========================================
// CAMBIAR TIPO DE ELEMENTO
// ==========================================

document.addEventListener("change", function (e) {

    if (e.target.classList.contains("tipo-elemento-seccion")) {

        const elemento = e.target.closest(".elemento-seccion");

        if (elemento) {
            actualizarCamposElemento(elemento);
        }

    }

});


// ==========================================
// ELIMINAR ELEMENTO
// ==========================================

function eliminarElementoSeccion(boton) {

    const elemento = boton.closest(".elemento-seccion");

    if (!elemento) return;

    elemento.remove();

    // Actualizar numeración visual
    const elementos = document.querySelectorAll(
        "#contenedorElementosSeccion .elemento-seccion"
    );

    elementos.forEach((item, index) => {

        item.querySelector(".card-header strong").textContent =
            `Elemento ${index + 1}`;

    });

}




// ==========================================
// SELECCIONAR IMAGEN POR ELEMENTO
// ==========================================

document.addEventListener("change", function (e) {

    if (!e.target.classList.contains("archivo-imagen-elemento")) {
        return;
    }

    const input = e.target;
    const elemento = input.closest(".elemento-seccion");

    if (!elemento) return;

    const archivo = input.files[0];

    if (!archivo) return;

    const formatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!formatosPermitidos.includes(archivo.type)) {

        alert("Formato no permitido. Selecciona JPG, PNG o WEBP.");

        input.value = "";

        return;
    }

    // Liberar vista previa anterior
    const imagenPreview = elemento.querySelector(
        ".imagen-elemento-preview"
    );

    if (imagenPreview.dataset.urlTemporal) {

        URL.revokeObjectURL(imagenPreview.dataset.urlTemporal);

    }

    // Crear nueva vista previa
    const urlTemporal = URL.createObjectURL(archivo);

    imagenPreview.src = urlTemporal;

    imagenPreview.dataset.urlTemporal = urlTemporal;

    // Guardar archivo en el elemento correspondiente
    elemento.dataset.archivoImagen = "seleccionado";

    elemento._archivoImagen = archivo;

    // Mostrar vista previa
    elemento.querySelector(
        ".vista-previa-imagen-elemento"
    ).style.display = "block";

});


// ==========================================
// ELIMINAR IMAGEN SELECCIONADA
// ==========================================




// ==========================================
// ELIMINAR IMAGEN SELECCIONADA
// ==========================================

document.addEventListener("click", function (e) {

    if (!e.target.closest(".btn-eliminar-imagen-elemento")) {
        return;
    }

    const boton = e.target.closest(
        ".btn-eliminar-imagen-elemento"
    );

    const elemento = boton.closest(".elemento-seccion");

    if (!elemento) return;

    const imagenPreview = elemento.querySelector(
        ".imagen-elemento-preview"
    );

    // Liberar URL temporal
    if (imagenPreview.dataset.urlTemporal) {

        URL.revokeObjectURL(imagenPreview.dataset.urlTemporal);

    }

    // Limpiar archivo nuevo seleccionado
    elemento._archivoImagen = null;

    delete elemento.dataset.archivoImagen;

    // Limpiar datos de imagen existente
    elemento._urlImagenExistente = null;
    elemento._publicIdExistente = null;

    // Limpiar archivo
    elemento.querySelector(
        ".archivo-imagen-elemento"
    ).value = "";

    // Limpiar vista previa
    imagenPreview.src = "";
    imagenPreview.dataset.urlTemporal = "";

    elemento.querySelector(
        ".vista-previa-imagen-elemento"
    ).style.display = "none";

});






// ==========================================
// RECOPILAR DATOS DE LA SECCIÓN
// ==========================================


function recopilarDatosSeccion() {

    const titulo = document.getElementById("tituloSeccion").value.trim();

    const descripcion = document.getElementById("descripcionSeccion").value.trim();

    const icono = document.getElementById("iconoSeccion").value.trim();

    const orden = parseInt(
        document.getElementById("ordenSeccion").value
    ) || 0;

    const estado = document.getElementById("estadoSeccion").value === "true";

    // Validar título
    if (!titulo) {
        alert("Debes ingresar el título de la sección.");
        return null;
    }

    const elementosDOM = document.querySelectorAll(
        "#contenedorElementosSeccion .elemento-seccion"
    );

    const elementos = [];

    elementosDOM.forEach((elemento, index) => {

        const tipoElemento = elemento.querySelector(
            ".tipo-elemento-seccion"
        ).value;

        const etiqueta = elemento.querySelector(
            ".etiqueta-elemento"
        ).value.trim();

        const contenido = elemento.querySelector(
            ".contenido-elemento"
        )?.value.trim() || "";

        const urlDestino = elemento.querySelector(
            ".url-elemento"
        )?.value.trim() || "";

        const permiteClick = elemento.querySelector(
            ".permite-click-elemento"
        )?.checked || false;

        const icono = elemento.querySelector(
            ".icono-elemento"
        ).value.trim();

        const ordenElemento = parseInt(
            elemento.querySelector(".orden-elemento").value
        ) || 0;

        const estadoElemento = elemento.querySelector(
            ".estado-elemento"
        ).value === "true";

        // Identificador del elemento existente
        const idElemento = parseInt(
            elemento.dataset.idElemento
        ) || 0;

        // Archivo nuevo seleccionado
        const archivoImagen = elemento._archivoImagen || null;

        // Conservar imagen existente si no se ha seleccionado otra
        const urlImagenExistente =
            elemento._urlImagenExistente || null;

        const publicIdExistente =
            elemento._publicIdExistente || null;

        elementos.push({

            idElemento: idElemento,
            tipoElemento: tipoElemento,
            etiqueta: etiqueta,

            contenido: tipoElemento === "Imagen" ? null : contenido,
            urlDestino: urlDestino || null,
            permiteClick: permiteClick,

            urlImagen: tipoElemento === "Imagen"
                ? urlImagenExistente
                : null,

            publicId: tipoElemento === "Imagen"
                ? publicIdExistente
                : null,

            icono: icono || null,
            ordenElemento: ordenElemento,
            estado: estadoElemento,

            // Archivo temporal para subir posteriormente
            archivoImagen: archivoImagen

        });

    });

    return {

        titulo: titulo,
        icono: icono || null,
        descripcion: descripcion || null,
        ordenSeccion: orden,
        estado: estado,
        usuario: "",
        elementos: elementos

    };

}





// ==========================================
// SUBIR IMAGEN A CLOUDINARY
// ==========================================

async function fractInformesSubirImagen(archivo) {

    if (!archivo) {
        throw new Error("No se recibió ningún archivo de imagen.");
    }

    const formData = new FormData();

    formData.append("file", archivo);

    formData.append(
        "upload_preset",
        FRACT_INFORMES_UPLOAD_PRESET
    );

    const respuesta = await fetch(
        FRACT_INFORMES_UPLOAD_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!respuesta.ok) {
        throw new Error("Error al subir una imagen a Cloudinary.");
    }

    const datos = await respuesta.json();

    if (!datos.secure_url || !datos.public_id) {
        throw new Error("Cloudinary no devolvió los datos de la imagen.");
    }

    return {
        urlImagen: datos.secure_url,
        publicId: datos.public_id
    };

}




// ==========================================
// SUBIR IMÁGENES DE LOS ELEMENTOS
// ==========================================

async function subirImagenesElementosSeccion(datosSeccion) {

    for (const elemento of datosSeccion.elementos) {

        // Solo procesar elementos de tipo Imagen
        if (elemento.tipoElemento !== "Imagen") {

            // Si cambió de Imagen a otro tipo, limpiar los datos anteriores
            elemento.urlImagen = null;
            elemento.publicId = null;

            delete elemento.archivoImagen;

            continue;
        }

        // Si se seleccionó una imagen nueva, subirla
        if (elemento.archivoImagen) {

            const imagenCloudinary = await fractInformesSubirImagen(
                elemento.archivoImagen
            );

            elemento.urlImagen = imagenCloudinary.urlImagen;
            elemento.publicId = imagenCloudinary.publicId;

        }

        // Si no hay archivo nuevo, conservar la imagen existente
        else if (!elemento.urlImagen) {

            throw new Error(
                `Debes seleccionar una imagen para el elemento "${elemento.etiqueta || elemento.ordenElemento}".`
            );

        }

        // El archivo temporal ya no será necesario
        delete elemento.archivoImagen;

    }

    return datosSeccion;

}





/* =========================================================
   REGISTRAR SECCIÓN
========================================================= */

document.getElementById("formAgregarSeccion")?.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formulario = this;

    const botonGuardar = document.getElementById("btnGuardarSeccion");

    const mensaje = document.getElementById("mensajeSeccion");

    try {

        botonGuardar.disabled = true;

        botonGuardar.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Guardando...
        `;

        mensaje.style.display = "none";

        // Recopilar datos
        const datosSeccion = recopilarDatosSeccion();

        if (!datosSeccion) return;

        // Subir imágenes a Cloudinary
        await subirImagenesElementosSeccion(datosSeccion);

        // Eliminar propiedades temporales de archivo
        datosSeccion.elementos.forEach(elemento => {
            delete elemento.archivoImagen;
        });

        // Enviar al controlador MVC

        const idSeccionEditar = document.getElementById(
            "idSeccionEditar"
        ).value;

        const estaEditando = idSeccionEditar !== "";

        const url = estaEditando
            ? `/Informes/Editar?id=${idSeccionEditar}`
            : "/Informes/Registrar";

        const metodo = estaEditando ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosSeccion)
        });


        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No se pudo registrar la sección."
            );
        }

        // Mostrar éxito
        mensaje.className = "alert alert-success";

        mensaje.textContent =
            resultado.mensaje || "Sección registrada correctamente.";

        mensaje.style.display = "block";

        // Limpiar formulario

        formulario.reset();

        // Limpiar identificador de edición
        document.getElementById("idSeccionEditar").value = "";

        // Limpiar elementos anteriores
        document.getElementById("contenedorElementosSeccion").innerHTML = "";

        // Restaurar título del modal
        document.getElementById("tituloAgregarSeccion").textContent =
            "Agregar sección";

        // Restaurar botón
        document.getElementById("btnGuardarSeccion").innerHTML = `
    <i class="feather icon-save"></i>
    Guardar sección
`;

        setTimeout(async () => {

            $("#modalAgregarSeccion").modal("hide");

            // Actualizar la lista de secciones
            await cargarListaSecciones();

        }, 1200);


    } catch (error) {

        console.error("Error al registrar sección:", error);

        mensaje.className = "alert alert-danger";

        mensaje.textContent = error.message ||
            "Ocurrió un error al registrar la sección.";

        mensaje.style.display = "block";

    }
    finally {

        botonGuardar.disabled = false;

        const sigueEditando = document.getElementById(
            "idSeccionEditar"
        ).value !== "";

        botonGuardar.innerHTML = sigueEditando
            ? `<i class="feather icon-save"></i> Actualizar sección`
            : `<i class="feather icon-save"></i> Guardar sección`;

    }


});





/* =========================================================
   LISTAR SECCIONES
========================================================= */



/* =========================================================
   FUNCIONES AUXILIARES PARA LISTAR INFORMES
========================================================= */

function escaparHTMLInformes(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);

}

function formatearFechaInformes(valor) {

    if (!valor) return "—";

    const fecha = new Date(valor);

    if (isNaN(fecha.getTime())) return "—";

    return fecha.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


/* =========================================================
   LISTAR SECCIONES
========================================================= */

let seccionesWebRegistros = [];

async function cargarListaSecciones() {

    const contenedor = document.getElementById(
        "listaAdministrarSecciones"
    );

    const tabla = document.getElementById("tablaSecciones");

    if (!contenedor || !tabla) return;

    contenedor.style.display = "block";

    tabla.innerHTML = `
        <div class="text-center p-3">
            Cargando secciones...
        </div>
    `;

    try {

        const respuesta = await fetch("/Informes/Listar");

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No se pudieron cargar las secciones."
            );
        }

        seccionesWebRegistros = Array.isArray(resultado)
            ? resultado
            : [];

        if (seccionesWebRegistros.length === 0) {

            tabla.innerHTML = `
                <div class="alert alert-info">
                    Todavía no hay secciones registradas.
                </div>
            `;

            return;
        }

        let html = `
            <div class="table-responsive">

                <table class="table table-bordered table-hover"
                       style="min-width:1800px;">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Icono</th>
                            <th>Descripción</th>
                            <th>Orden</th>
                            <th>Estado</th>
                            <th>Fecha de registro</th>
                            <th>Registrado por</th>
                            <th>Fecha de modificación</th>
                            <th>Modificado por</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
        `;

        seccionesWebRegistros.forEach(item => {

            const id = item.idSeccion ?? item.IdSeccion;

            const titulo = item.titulo ?? item.Titulo ?? "";

            const icono = item.icono ?? item.Icono ?? "";

            const descripcion =
                item.descripcion ?? item.Descripcion ?? "";

            const orden =
                item.ordenSeccion ?? item.OrdenSeccion ?? 0;

            const estado = item.estado ?? item.Estado;

            const fechaRegistro =
                item.fechRegist ?? item.FechRegist;

            const usuarioRegistro =
                item.usuaRegist ?? item.UsuaRegist ?? "";

            const fechaModificacion =
                item.fechModif ?? item.FechModif;

            const usuarioModificacion =
                item.usuarModif ?? item.UsuarModif ?? "";

            const elementos =
                item.elementos ?? item.Elementos ?? [];

            html += `
                <tr>

                    <td>${id}</td>

                    <td>${escaparHTMLInformes(titulo)}</td>

                    <td>${escaparHTMLInformes(icono || "—")}</td>

                    <td>${escaparHTMLInformes(descripcion || "—")}</td>

                    <td>${orden}</td>

                    <td>
                        <span class="badge ${estado ? "badge-success" : "badge-secondary"
                }">
                            ${estado ? "Activo" : "Inactivo"}
                        </span>
                    </td>

                    <td>${formatearFechaInformes(fechaRegistro)}</td>

                    <td>${escaparHTMLInformes(usuarioRegistro)}</td>

                    <td>${formatearFechaInformes(fechaModificacion)}</td>

                    <td>${escaparHTMLInformes(usuarioModificacion || "—")}</td>

                    <td style="white-space:nowrap;">

                        <button
                            type="button"
                            class="btn btn-info btn-sm"
                            onclick="mostrarElementosSeccion(${id})">
                            <i class="feather icon-list"></i>
                            Elementos (${elementos.length})
                        </button>

                        <button
                            type="button"
                            class="btn btn-warning btn-sm"
                            onclick="editarSeccion(${id})">
                            <i class="feather icon-edit"></i>
                            Editar
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="eliminarSeccion(${id})">
                            <i class="feather icon-trash-2"></i>
                            Eliminar
                        </button>

                    </td>

                </tr>

                <tr id="filaElementosSeccion_${id}" style="display:none;">

                    <td colspan="10">

                        <div id="detalleElementosSeccion_${id}"></div>

                    </td>

                </tr>
            `;

        });

        html += `
                    </tbody>

                </table>

            </div>
        `;

        tabla.innerHTML = html;

    } catch (error) {

        console.error("Error cargando secciones:", error);

        tabla.innerHTML = `
            <div class="alert alert-danger">
                ${escaparHTMLInformes(error.message)}
            </div>
        `;

    }

}




/* =========================================================
   ELIMINAR SECCIÓN COMPLETA
========================================================= */

async function eliminarSeccion(id) {

    const seccion = seccionesWebRegistros.find(item =>
        Number(item.idSeccion ?? item.IdSeccion) === Number(id)
    );

    if (!seccion) {
        alert("No se encontró la sección seleccionada.");
        return;
    }

    const titulo = seccion.titulo ?? seccion.Titulo ?? "";

    const confirmar = confirm(
        `¿Estás seguro de eliminar la sección "${titulo}"?\n\n` +
        "También se eliminarán todos sus elementos y las imágenes asociadas.\n\n" +
        "Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {

        const respuesta = await fetch(
            `/Informes/Eliminar?id=${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No se pudo eliminar la sección."
            );
        }

        alert(
            resultado.mensaje || "Sección eliminada correctamente."
        );

        // Actualizar la lista automáticamente
        await cargarListaSecciones();

    } catch (error) {

        console.error("Error eliminando sección:", error);

        alert(error.message || "Ocurrió un error al eliminar la sección.");

    }

}

/* =========================================================
   MOSTRAR ELEMENTOS DE UNA SECCIÓN
========================================================= */

function mostrarElementosSeccion(id) {

    const fila = document.getElementById(
        `filaElementosSeccion_${id}`
    );

    const detalle = document.getElementById(
        `detalleElementosSeccion_${id}`
    );

    if (!fila || !detalle) return;

    if (fila.style.display !== "none") {

        fila.style.display = "none";

        return;
    }

    const seccion = seccionesWebRegistros.find(item =>
        Number(item.idSeccion ?? item.IdSeccion) === Number(id)
    );

    if (!seccion) return;

    const elementos =
        seccion.elementos ?? seccion.Elementos ?? [];

    if (elementos.length === 0) {

        detalle.innerHTML = `
            <div class="alert alert-info">
                Esta sección todavía no tiene elementos.
            </div>
        `;

        fila.style.display = "table-row";

        return;
    }

    let html = `
        <h6 class="mb-3">
            Elementos de la sección:
            ${escaparHTMLInformes(
        seccion.titulo ?? seccion.Titulo
    )}
        </h6>

        <div class="table-responsive">

            <table class="table table-sm table-bordered table-hover"
                   style="min-width:2300px;">

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Etiqueta</th>
                        <th>Contenido</th>
                        <th>URL destino</th>
                        <th>Permite clic</th>
                        <th>Imagen</th>
                        <th>PublicId</th>
                        <th>Icono</th>
                        <th>Orden</th>
                        <th>Estado</th>
                        <th>Fecha de registro</th>
                        <th>Registrado por</th>
                        <th>Fecha de modificación</th>
                        <th>Modificado por</th>
                    </tr>
                </thead>

                <tbody>
    `;

    elementos.forEach(elemento => {

        const idElemento =
            elemento.idElemento ?? elemento.IdElemento;

        const tipo =
            elemento.tipoElemento ?? elemento.TipoElemento ?? "";

        const etiqueta =
            elemento.etiqueta ?? elemento.Etiqueta ?? "";

        const contenido =
            elemento.contenido ?? elemento.Contenido ?? "";

        const urlDestino =
            elemento.urlDestino ?? elemento.UrlDestino ?? "";

        const permiteClick =
            elemento.permiteClick ?? elemento.PermiteClick;

        const urlImagen =
            elemento.urlImagen ?? elemento.UrlImagen ?? "";

        const publicId =
            elemento.publicId ?? elemento.PublicId ?? "";

        const icono =
            elemento.icono ?? elemento.Icono ?? "";

        const orden =
            elemento.ordenElemento ?? elemento.OrdenElemento ?? 0;

        const estado =
            elemento.estado ?? elemento.Estado;

        const fechaRegistro =
            elemento.fechRegist ?? elemento.FechRegist;

        const usuarioRegistro =
            elemento.usuaRegist ?? elemento.UsuaRegist ?? "";

        const fechaModificacion =
            elemento.fechModif ?? elemento.FechModif;

        const usuarioModificacion =
            elemento.usuarModif ?? elemento.UsuarModif ?? "";

        const imagenHTML = urlImagen
            ? `
                <a href="${escaparHTMLInformes(urlImagen)}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <img
                        src="${escaparHTMLInformes(urlImagen)}"
                        alt="Imagen del elemento"
                        style="width:65px;height:65px;object-fit:cover;border-radius:5px;">
                </a>
              `
            : "—";

        html += `
            <tr>

                <td>${idElemento}</td>

                <td>${escaparHTMLInformes(tipo)}</td>

                <td>${escaparHTMLInformes(etiqueta || "—")}</td>

                <td style="min-width:200px;white-space:pre-wrap;">
                    ${escaparHTMLInformes(contenido || "—")}
                </td>

                <td style="min-width:180px;word-break:break-all;">
                    ${escaparHTMLInformes(urlDestino || "—")}
                </td>

                <td>${permiteClick ? "Sí" : "No"}</td>

                <td>${imagenHTML}</td>

                <td>${escaparHTMLInformes(publicId || "—")}</td>

                <td>${escaparHTMLInformes(icono || "—")}</td>

                <td>${orden}</td>

                <td>
                    <span class="badge ${estado ? "badge-success" : "badge-secondary"
            }">
                        ${estado ? "Activo" : "Inactivo"}
                    </span>
                </td>

                <td>${formatearFechaInformes(fechaRegistro)}</td>

                <td>${escaparHTMLInformes(usuarioRegistro)}</td>

                <td>${formatearFechaInformes(fechaModificacion)}</td>

                <td>${escaparHTMLInformes(usuarioModificacion || "—")}</td>

            </tr>
        `;

    });

    html += `
                </tbody>

            </table>

        </div>
    `;

    detalle.innerHTML = html;

    fila.style.display = "table-row";

}





/* =========================================================
   CARGAR SECCIÓN PARA EDITAR
========================================================= */

function editarSeccion(id) {

    const seccion = seccionesWebRegistros.find(item =>
        Number(item.idSeccion ?? item.IdSeccion) === Number(id)
    );

    if (!seccion) {
        alert("No se encontró la sección seleccionada.");
        return;
    }

    // Guardar ID de la sección
    document.getElementById("idSeccionEditar").value =
        seccion.idSeccion ?? seccion.IdSeccion;

    // Cargar datos generales
    document.getElementById("tituloSeccion").value =
        seccion.titulo ?? seccion.Titulo ?? "";

    document.getElementById("iconoSeccion").value =
        seccion.icono ?? seccion.Icono ?? "";

    document.getElementById("descripcionSeccion").value =
        seccion.descripcion ?? seccion.Descripcion ?? "";

    document.getElementById("ordenSeccion").value =
        seccion.ordenSeccion ?? seccion.OrdenSeccion ?? 0;

    document.getElementById("estadoSeccion").value =
        String(seccion.estado ?? seccion.Estado);

    // Cambiar título del modal
    document.getElementById("tituloAgregarSeccion").textContent =
        "Editar sección";

    // Cambiar texto del botón
    document.getElementById("btnGuardarSeccion").innerHTML = `
        <i class="feather icon-save"></i>
        Actualizar sección
    `;

    // Limpiar elementos anteriores
    const contenedor = document.getElementById(
        "contenedorElementosSeccion"
    );

    contenedor.innerHTML = "";

    // Cargar elementos existentes
    const elementos = seccion.elementos ?? seccion.Elementos ?? [];

    elementos.forEach(item => {

        // Crear tarjeta usando la función existente
        agregarElementoSeccion();

        const elemento = contenedor.lastElementChild;

        // Guardar identificadores y datos de imagen existentes
        elemento.dataset.idElemento =
            item.idElemento ?? item.IdElemento;

        elemento._urlImagenExistente =
            item.urlImagen ?? item.UrlImagen ?? null;

        elemento._publicIdExistente =
            item.publicId ?? item.PublicId ?? null;

        // Tipo
        const tipo = item.tipoElemento ?? item.TipoElemento ?? "";

        elemento.querySelector(".tipo-elemento-seccion").value = tipo;

        actualizarCamposElemento(elemento);

        // Etiqueta
        elemento.querySelector(".etiqueta-elemento").value =
            item.etiqueta ?? item.Etiqueta ?? "";

        // Contenido
        elemento.querySelector(".contenido-elemento").value =
            item.contenido ?? item.Contenido ?? "";

        // URL
        elemento.querySelector(".url-elemento").value =
            item.urlDestino ?? item.UrlDestino ?? "";

        // Permitir clic
        elemento.querySelector(".permite-click-elemento").checked =
            item.permiteClick ?? item.PermiteClick ?? false;

        // Icono
        elemento.querySelector(".icono-elemento").value =
            item.icono ?? item.Icono ?? "";

        // Orden
        elemento.querySelector(".orden-elemento").value =
            item.ordenElemento ?? item.OrdenElemento ?? 0;

        // Estado
        elemento.querySelector(".estado-elemento").value =
            String(item.estado ?? item.Estado);

        // Mostrar imagen existente
        if (tipo === "Imagen" && elemento._urlImagenExistente) {

            const imagenPreview = elemento.querySelector(
                ".imagen-elemento-preview"
            );

            imagenPreview.src = elemento._urlImagenExistente;

            elemento.querySelector(
                ".vista-previa-imagen-elemento"
            ).style.display = "block";

        }

    });

    // Ocultar mensajes anteriores
    const mensaje = document.getElementById("mensajeSeccion");

    mensaje.style.display = "none";

    // Abrir modal
    $("#modalAgregarSeccion").modal("show");

}
