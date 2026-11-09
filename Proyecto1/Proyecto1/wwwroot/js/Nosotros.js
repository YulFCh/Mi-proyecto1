
/* =========================================================
   CONFIGURACIÓN CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD_NAME = "dkxto4ymq";
const CLOUDINARY_UPLOAD_PRESET = "inventario_preset";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const MAX_IMAGENES_NOSOTROS = 15;


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let imagenesNosotrosSeleccionadas = [];

let imagenesEditarNosotros = [];
let archivosEditarNosotros = [];

let nosotrosRegistros = [];
let nosotrosEditandoId = null;


/* =========================================================
   UTILIDADES
========================================================= */

function fractNosotrosEscaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}


function mostrarMensajeNosotros(elementoId, mensaje, tipo = "success") {

    const elemento = document.getElementById(elementoId);

    if (!elemento) return;

    elemento.style.display = "block";

    elemento.innerHTML = `
        <div class="alert alert-${tipo}" role="alert">
            ${fractNosotrosEscaparHTML(mensaje)}
        </div>
    `;
}


function ocultarMensajeNosotros(elementoId) {

    const elemento = document.getElementById(elementoId);

    if (!elemento) return;

    elemento.style.display = "none";
    elemento.innerHTML = "";
}


function obtenerValorNosotros(objeto, propiedadMinuscula, propiedadMayuscula) {

    return objeto?.[propiedadMinuscula] ??
        objeto?.[propiedadMayuscula] ??
        null;
}


/* =========================================================
   SELECCIÓN DE IMÁGENES - REGISTRO
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("imagenesNosotros");

    if (input) {

        input.addEventListener("change", function () {

            const archivos = Array.from(this.files || []);

            const disponibles =
                MAX_IMAGENES_NOSOTROS - imagenesNosotrosSeleccionadas.length;

            if (archivos.length > disponibles) {

                alert(`Solo puedes seleccionar hasta ${MAX_IMAGENES_NOSOTROS} fotografías.`);

            }

            const permitidos = archivos.slice(0, disponibles);

            permitidos.forEach(archivo => {

                if (!archivo.type.startsWith("image/")) return;

                imagenesNosotrosSeleccionadas.push(archivo);

            });

            this.value = "";

            mostrarVistaPreviaImagenesNosotros();

        });

    }


    const inputEditar = document.getElementById("imagenesEditarNosotros");

    if (inputEditar) {

        inputEditar.addEventListener("change", function () {

            const archivos = Array.from(this.files || []);

            const disponibles =
                MAX_IMAGENES_NOSOTROS -
                imagenesEditarNosotros.length -
                archivosEditarNosotros.length;

            if (archivos.length > disponibles) {

                alert(`Solo puedes tener hasta ${MAX_IMAGENES_NOSOTROS} fotografías por apartado.`);

            }

            archivos.slice(0, disponibles).forEach(archivo => {

                if (!archivo.type.startsWith("image/")) return;

                archivosEditarNosotros.push(archivo);

            });

            this.value = "";

            mostrarVistaPreviaImagenesEditarNosotros();

        });

    }


    const formularioAgregar = document.getElementById("formAgregarNosotros");

    if (formularioAgregar) {

        formularioAgregar.addEventListener("submit", guardarNosotros);

    }


    const formularioEditar = document.getElementById("formEditarNosotros");

    if (formularioEditar) {

        formularioEditar.addEventListener("submit", guardarEdicionNosotros);

    }


    $("#modalAgregarNosotros").on("hidden.bs.modal", function () {

        formularioAgregar?.reset();

        imagenesNosotrosSeleccionadas = [];

        mostrarVistaPreviaImagenesNosotros();

        ocultarMensajeNosotros("mensajeNosotros");

    });


    $("#modalEditarNosotros").on("hidden.bs.modal", function () {

        imagenesEditarNosotros = [];
        archivosEditarNosotros = [];
        nosotrosEditandoId = null;

        mostrarVistaPreviaImagenesEditarNosotros();

        ocultarMensajeNosotros("mensajeEditarNosotros");

    });

});


/* =========================================================
   VISTA PREVIA DE IMÁGENES - REGISTRO
========================================================= */

function mostrarVistaPreviaImagenesNosotros() {

    const contenedor =
        document.getElementById("vistaPreviaImagenesNosotros");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    imagenesNosotrosSeleccionadas.forEach((archivo, indice) => {

        const url = URL.createObjectURL(archivo);

        const tarjeta = document.createElement("div");

        tarjeta.style.cssText = `
            position:relative;
            border:1px solid #ddd;
            border-radius:8px;
            overflow:hidden;
            background:#fff;
        `;

        tarjeta.innerHTML = `
            <img src="${url}"
                 style="width:100%; height:110px; object-fit:cover;">

            <button type="button"
                    onclick="eliminarImagenNosotros(${indice})"
                    style="
                        position:absolute;
                        top:5px;
                        right:5px;
                        width:25px;
                        height:25px;
                        border:none;
                        border-radius:50%;
                        background:#dc3545;
                        color:white;
                        cursor:pointer;
                        font-weight:bold;
                    ">
                &times;
            </button>

            <div style="
                padding:5px;
                font-size:11px;
                text-align:center;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            ">
                ${fractNosotrosEscaparHTML(archivo.name)}
            </div>
        `;

        contenedor.appendChild(tarjeta);

    });

}


/* =========================================================
   ELIMINAR IMAGEN - REGISTRO
========================================================= */

function eliminarImagenNosotros(indice) {

    imagenesNosotrosSeleccionadas.splice(indice, 1);

    mostrarVistaPreviaImagenesNosotros();

}


/* =========================================================
   SUBIR IMAGEN A CLOUDINARY
========================================================= */

async function subirImagenNosotros(archivo) {

    const formulario = new FormData();

    formulario.append("file", archivo);

    formulario.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const respuesta = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formulario
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        throw new Error(
            resultado.error?.message || "No se pudo subir una fotografía."
        );

    }

    return {
        urlImagen: resultado.secure_url,
        publicId: resultado.public_id,
        descImagen: null
    };

}


/* =========================================================
   REGISTRAR NOSOTROS
========================================================= */

async function guardarNosotros(evento) {

    evento.preventDefault();

    const boton = document.getElementById("btnGuardarNosotros");

    const titulo = document.getElementById("tituloNosotros").value.trim();

    if (!titulo) {

        mostrarMensajeNosotros(
            "mensajeNosotros",
            "Debes ingresar el título del apartado.",
            "danger"
        );

        return;

    }

    if (imagenesNosotrosSeleccionadas.length > MAX_IMAGENES_NOSOTROS) {

        mostrarMensajeNosotros(
            "mensajeNosotros",
            "Solo puedes registrar hasta 15 fotografías.",
            "danger"
        );

        return;

    }

    try {

        boton.disabled = true;

        boton.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Guardando...
        `;

        ocultarMensajeNosotros("mensajeNosotros");


        /* SUBIR FOTOGRAFÍAS */

        const imagenes = [];

        for (let i = 0; i < imagenesNosotrosSeleccionadas.length; i++) {

            mostrarMensajeNosotros(
                "mensajeNosotros",
                `Subiendo fotografía ${i + 1} de ${imagenesNosotrosSeleccionadas.length}...`,
                "info"
            );

            const imagen = await subirImagenNosotros(
                imagenesNosotrosSeleccionadas[i]
            );

            imagen.ordenFoto = i + 1;

            imagenes.push(imagen);

        }


        /* PREPARAR DATOS */

        const datos = {

            titulo: titulo,

            resumen: document.getElementById("resumenNosotros").value.trim(),

            descripcion: document.getElementById("descripcionNosotros").value.trim(),

            icono: document.getElementById("iconoNosotros").value.trim(),

            ordenNosotros: parseInt(
                document.getElementById("ordenNosotros").value
            ) || 0,

            estado:
                document.getElementById("estadoNosotros").value === "true",

            usuaRegist: fractNosotrosUsuarioActual,

            imagenes: imagenes.map((imagen, indice) => ({

                urlImagen: imagen.urlImagen,

                publicId: imagen.publicId,

                descImagen: imagen.descImagen,

                ordenFoto: indice + 1

            }))

        };


        /* ENVIAR AL CONTROLADOR FRONT */

        const respuesta = await fetch("/Nosotros/Registrar", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje || "No se pudo registrar el apartado."
            );

        }


        mostrarMensajeNosotros(
            "mensajeNosotros",
            resultado.mensaje || "Apartado registrado correctamente.",
            "success"
        );


        /* LIMPIAR Y CERRAR */

        document.getElementById("formAgregarNosotros").reset();

        imagenesNosotrosSeleccionadas = [];

        mostrarVistaPreviaImagenesNosotros();

        await cargarListaNosotros();

        setTimeout(() => {

            $("#modalAgregarNosotros").modal("hide");

        }, 1200);


    } catch (error) {

        console.error("Error al registrar Nosotros:", error);

        mostrarMensajeNosotros(
            "mensajeNosotros",
            error.message || "Ocurrió un error al registrar.",
            "danger"
        );

    } finally {

        boton.disabled = false;

        boton.innerHTML = `
            <i class="feather icon-save"></i>
            Guardar apartado
        `;

    }

}


/* =========================================================
   LISTAR NOSOTROS
========================================================= */

async function cargarListaNosotros() {

    const contenedor = document.getElementById("listaAdministrarNosotros");

    const tabla = document.getElementById("tablaNosotros");

    if (!contenedor || !tabla) return;

    contenedor.style.display = "block";

    tabla.innerHTML = `
        <div class="text-center p-3">
            Cargando apartados...
        </div>
    `;

    try {

        const respuesta = await fetch("/Nosotros/Listar");

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje || "No se pudieron cargar los apartados."
            );

        }

        nosotrosRegistros = Array.isArray(resultado) ? resultado : [];

        if (nosotrosRegistros.length === 0) {

            tabla.innerHTML = `
                <div class="alert alert-info">
                    Todavía no hay apartados registrados.
                </div>
            `;

            return;

        }


        let html = `
            <div class="table-responsive">

                <table class="table table-bordered table-hover"
                       style="min-width:1500px;">

                    <thead>
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

                    <tbody>
        `;

        nosotrosRegistros.forEach(item => {

            const id = obtenerValorNosotros(
                item, "idNosotros", "IdNosotros"
            );

            const titulo = obtenerValorNosotros(
                item, "titulo", "Titulo"
            );

            const resumen = obtenerValorNosotros(
                item, "resumen", "Resumen"
            );

            const descripcion = obtenerValorNosotros(
                item, "descripcion", "Descripcion"
            );

            const icono = obtenerValorNosotros(
                item, "icono", "Icono"
            );

            const orden = obtenerValorNosotros(
                item, "ordenNosotros", "OrdenNosotros"
            );

            const estado = obtenerValorNosotros(
                item, "estado", "Estado"
            );

            const fechaRegistro = obtenerValorNosotros(
                item, "fechRegist", "FechRegist"
            );

            const usuarioRegistro = obtenerValorNosotros(
                item, "usuaRegist", "UsuaRegist"
            );

            const imagenes = obtenerValorNosotros(
                item, "imagenes", "Imagenes"
            ) || [];


            /* FORMATEAR FECHA */

            let fechaFormateada = "—";

            if (fechaRegistro) {

                const fecha = new Date(fechaRegistro);

                if (!isNaN(fecha.getTime())) {

                    fechaFormateada = fecha.toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                }

            }


            /* MOSTRAR TODAS LAS FOTOGRAFÍAS */

            const fotografiasHTML = imagenes.length > 0

                ? `
                    <div style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:6px;
                        min-width:150px;
                    ">

                        ${imagenes.map(imagen => {

                    const url = obtenerValorNosotros(
                        imagen, "urlImagen", "UrlImagen"
                    );

                    return `
                                <img src="${fractNosotrosEscaparHTML(url)}"
                                     alt="Fotografía del apartado"
                                     title="Ver fotografía"
                                     style="
                                        width:65px;
                                        height:50px;
                                        object-fit:cover;
                                        border-radius:6px;
                                        border:1px solid #ddd;
                                     ">
                            `;

                }).join("")}

                    </div>
                `

                : `<span class="text-muted">Sin fotografías</span>`;


            /* GENERAR FILA */

            html += `
                <tr>

                    <!-- ID -->
                    <td>${id}</td>

                    <!-- FOTOGRAFÍAS -->
                    <td>${fotografiasHTML}</td>

                    <!-- TÍTULO -->
                    <td style="min-width:150px;">
                        ${fractNosotrosEscaparHTML(titulo)}
                    </td>

                    <!-- RESUMEN -->
                    <td style="min-width:180px; max-width:250px; white-space:normal;">
                        ${fractNosotrosEscaparHTML(resumen || "—")}
                    </td>

                    <!-- DESCRIPCIÓN -->
                    <td style="min-width:220px; max-width:300px; white-space:normal;">
                        ${fractNosotrosEscaparHTML(descripcion || "—")}
                    </td>

                    <!-- ICONO -->
                    <td>
                        ${fractNosotrosEscaparHTML(icono || "—")}
                    </td>

                    <!-- ORDEN -->
                    <td>${orden}</td>

                    <!-- ESTADO -->
                    <td>
                        ${estado
                    ? '<span class="badge badge-success">Activo</span>'
                    : '<span class="badge badge-secondary">Inactivo</span>'}
                    </td>

                    <!-- FECHA DE REGISTRO -->
                    <td style="min-width:145px;">
                        ${fractNosotrosEscaparHTML(fechaFormateada)}
                    </td>

                    <!-- REGISTRADO POR -->
                    <td>
                        ${fractNosotrosEscaparHTML(usuarioRegistro || "—")}
                    </td>

                    <!-- ACCIONES -->
                    <td style="white-space:nowrap;">

                        <button type="button"
                                class="btn btn-sm btn-primary"
                                onclick="abrirEdicionNosotros(${id})">

                            <i class="feather icon-edit"></i>
                            Editar

                        </button>

                        <button type="button"
                                class="btn btn-sm btn-danger"
                                onclick="eliminarNosotros(${id})">

                            <i class="feather icon-trash-2"></i>
                            Eliminar

                        </button>

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

        console.error("Error al listar Nosotros:", error);

        tabla.innerHTML = `
            <div class="alert alert-danger">
                ${fractNosotrosEscaparHTML(error.message)}
            </div>
        `;

    }

}


/* =========================================================
   ABRIR EDICIÓN
========================================================= */

function abrirEdicionNosotros(id) {

    const item = nosotrosRegistros.find(registro =>

        obtenerValorNosotros(
            registro, "idNosotros", "IdNosotros"
        ) == id

    );

    if (!item) {

        alert("No se encontró el apartado seleccionado.");

        return;

    }

    nosotrosEditandoId = id;

    document.getElementById("tituloEditarNosotrosInput").value =
        obtenerValorNosotros(item, "titulo", "Titulo") || "";

    document.getElementById("resumenEditarNosotros").value =
        obtenerValorNosotros(item, "resumen", "Resumen") || "";

    document.getElementById("descripcionEditarNosotros").value =
        obtenerValorNosotros(item, "descripcion", "Descripcion") || "";

    document.getElementById("iconoEditarNosotros").value =
        obtenerValorNosotros(item, "icono", "Icono") || "";

    document.getElementById("ordenEditarNosotros").value =
        obtenerValorNosotros(item, "ordenNosotros", "OrdenNosotros") ?? 0;

    document.getElementById("estadoEditarNosotros").value =
        String(obtenerValorNosotros(item, "estado", "Estado"));

    imagenesEditarNosotros = (
        obtenerValorNosotros(item, "imagenes", "Imagenes") || []
    ).map(imagen => ({

        idImagen: obtenerValorNosotros(imagen, "idImagen", "IdImagen"),

        idNosotros: obtenerValorNosotros(imagen, "idNosotros", "IdNosotros"),

        urlImagen: obtenerValorNosotros(imagen, "urlImagen", "UrlImagen"),

        publicId: obtenerValorNosotros(imagen, "publicId", "PublicId"),

        descImagen: obtenerValorNosotros(imagen, "descImagen", "DescImagen"),

        ordenFoto: obtenerValorNosotros(imagen, "ordenFoto", "OrdenFoto")

    }));

    archivosEditarNosotros = [];

    document.getElementById("imagenesEditarNosotros").value = "";

    mostrarVistaPreviaImagenesEditarNosotros();

    ocultarMensajeNosotros("mensajeEditarNosotros");

    $("#modalEditarNosotros").modal("show");

}


/* =========================================================
   VISTA PREVIA DE IMÁGENES - EDICIÓN
========================================================= */

function mostrarVistaPreviaImagenesEditarNosotros() {

    const contenedor =
        document.getElementById("vistaPreviaImagenesEditarNosotros");

    if (!contenedor) return;

    contenedor.innerHTML = "";


    /* IMÁGENES EXISTENTES */

    imagenesEditarNosotros.forEach((imagen, indice) => {

        const tarjeta = document.createElement("div");

        tarjeta.style.cssText = `
            position:relative;
            width:120px;
            border:1px solid #ddd;
            border-radius:8px;
            overflow:hidden;
            background:white;
        `;

        const img = document.createElement("img");

        img.src = imagen.urlImagen;

        img.style.cssText = `
            width:100%;
            height:110px;
            object-fit:cover;
        `;

        const boton = document.createElement("button");

        boton.type = "button";

        boton.innerHTML = "&times;";

        boton.style.cssText = `
            position:absolute;
            top:5px;
            right:5px;
            width:25px;
            height:25px;
            border:none;
            border-radius:50%;
            background:#dc3545;
            color:white;
            cursor:pointer;
            font-weight:bold;
        `;

        boton.onclick = () => eliminarImagenEditarNosotros(indice);

        tarjeta.appendChild(img);

        tarjeta.appendChild(boton);

        contenedor.appendChild(tarjeta);

    });


    /* IMÁGENES NUEVAS */

    archivosEditarNosotros.forEach((archivo, indice) => {

        const url = URL.createObjectURL(archivo);

        const tarjeta = document.createElement("div");

        tarjeta.style.cssText = `
            position:relative;
            width:120px;
            border:1px solid #ddd;
            border-radius:8px;
            overflow:hidden;
            background:white;
        `;

        tarjeta.innerHTML = `
            <img src="${url}"
                 style="width:100%; height:110px; object-fit:cover;">

            <button type="button"
                    onclick="eliminarArchivoEditarNosotros(${indice})"
                    style="
                        position:absolute;
                        top:5px;
                        right:5px;
                        width:25px;
                        height:25px;
                        border:none;
                        border-radius:50%;
                        background:#dc3545;
                        color:white;
                        cursor:pointer;
                        font-weight:bold;
                    ">
                &times;
            </button>
        `;

        contenedor.appendChild(tarjeta);

    });

}


/* =========================================================
   ELIMINAR IMAGEN EXISTENTE - EDICIÓN
========================================================= */

function eliminarImagenEditarNosotros(indice) {

    imagenesEditarNosotros.splice(indice, 1);

    mostrarVistaPreviaImagenesEditarNosotros();

}


/* =========================================================
   ELIMINAR IMAGEN NUEVA - EDICIÓN
========================================================= */

function eliminarArchivoEditarNosotros(indice) {

    archivosEditarNosotros.splice(indice, 1);

    mostrarVistaPreviaImagenesEditarNosotros();

}


/* =========================================================
   EDITAR NOSOTROS
========================================================= */

async function guardarEdicionNosotros(evento) {

    evento.preventDefault();

    const boton = document.getElementById("btnGuardarEdicionNosotros");

    if (!nosotrosEditandoId) return;

    const totalImagenes =
        imagenesEditarNosotros.length + archivosEditarNosotros.length;

    if (totalImagenes > MAX_IMAGENES_NOSOTROS) {

        mostrarMensajeNosotros(
            "mensajeEditarNosotros",
            "Solo puedes tener hasta 15 fotografías.",
            "danger"
        );

        return;

    }

    try {

        boton.disabled = true;

        boton.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Guardando...
        `;

        ocultarMensajeNosotros("mensajeEditarNosotros");


        /* CONSERVAR IMÁGENES EXISTENTES */

        const imagenes = imagenesEditarNosotros.map(imagen => ({

            idImagen: imagen.idImagen,

            idNosotros: nosotrosEditandoId,

            urlImagen: imagen.urlImagen,

            publicId: imagen.publicId,

            descImagen: imagen.descImagen,

            ordenFoto: 0

        }));


        /* SUBIR IMÁGENES NUEVAS */

        for (let i = 0; i < archivosEditarNosotros.length; i++) {

            mostrarMensajeNosotros(
                "mensajeEditarNosotros",
                `Subiendo fotografía ${i + 1} de ${archivosEditarNosotros.length}...`,
                "info"
            );

            const imagen = await subirImagenNosotros(
                archivosEditarNosotros[i]
            );

            imagenes.push({

                idImagen: 0,

                idNosotros: nosotrosEditandoId,

                urlImagen: imagen.urlImagen,

                publicId: imagen.publicId,

                descImagen: null,

                ordenFoto: 0

            });

        }


        /* ASIGNAR ORDEN */

        imagenes.forEach((imagen, indice) => {

            imagen.ordenFoto = indice + 1;

        });


        /* PREPARAR DATOS */

        const datos = {

            titulo: document.getElementById("tituloEditarNosotrosInput").value.trim(),

            resumen: document.getElementById("resumenEditarNosotros").value.trim(),

            descripcion: document.getElementById("descripcionEditarNosotros").value.trim(),

            icono: document.getElementById("iconoEditarNosotros").value.trim(),

            ordenNosotros: parseInt(
                document.getElementById("ordenEditarNosotros").value
            ) || 0,

            estado:
                document.getElementById("estadoEditarNosotros").value === "true",

            usuaRegist: fractNosotrosUsuarioActual,

            usuarModif: fractNosotrosUsuarioActual,

            imagenes: imagenes

        };


        /* ENVIAR AL CONTROLADOR FRONT */

        const respuesta = await fetch(
            `/Nosotros/Editar/${nosotrosEditandoId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje || "No se pudo actualizar el apartado."
            );

        }


        mostrarMensajeNosotros(
            "mensajeEditarNosotros",
            resultado.mensaje || "Apartado actualizado correctamente.",
            "success"
        );


        await cargarListaNosotros();

        setTimeout(() => {

            $("#modalEditarNosotros").modal("hide");

        }, 1200);


    } catch (error) {

        console.error("Error al editar Nosotros:", error);

        mostrarMensajeNosotros(
            "mensajeEditarNosotros",
            error.message || "Ocurrió un error al actualizar.",
            "danger"
        );

    } finally {

        boton.disabled = false;

        boton.innerHTML = `
            <i class="feather icon-save"></i>
            Guardar cambios
        `;

    }

}


/* =========================================================
   ELIMINAR NOSOTROS
========================================================= */

async function eliminarNosotros(id) {

    const confirmar = confirm(
        "¿Estás seguro de eliminar este apartado y sus fotografías?"
    );

    if (!confirmar) return;

    try {

        const respuesta = await fetch(`/Nosotros/Eliminar/${id}`, {

            method: "DELETE"

        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje || "No se pudo eliminar el apartado."
            );

        }

        alert(resultado.mensaje || "Apartado eliminado correctamente.");

        await cargarListaNosotros();

    } catch (error) {

        console.error("Error al eliminar Nosotros:", error);

        alert(error.message || "Ocurrió un error al eliminar el apartado.");

    }

}
