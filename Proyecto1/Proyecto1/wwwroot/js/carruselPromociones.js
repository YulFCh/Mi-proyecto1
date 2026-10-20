
const API_PROMOCIONES =
    "https://mi-proyecto1-2.onrender.com/api/RegistroPromociones";

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/dkxto4ymq/image/upload";


//////////////INICIO REGISTRAR

const CLOUDINARY_PRESET = "inventario_preset";

const inputArchivos = document.getElementById("archivosPromociones");
const previewPromociones = document.getElementById("previewPromociones");
const formPromociones = document.getElementById("formAgregarPromociones");
const mensajePromociones = document.getElementById("mensajePromociones");
const btnGuardarPromociones = document.getElementById("btnGuardarPromociones");

// =====================================================
// MOSTRAR VISTA PREVIA DE LAS IMÁGENES SELECCIONADAS
// =====================================================
inputArchivos.addEventListener("change", function () {
    previewPromociones.innerHTML = "";

    const archivos = Array.from(this.files || []);

    archivos.forEach((archivo, indice) => {
        if (!archivo.type.startsWith("image/")) {
            return;
        }

        const tarjeta = document.createElement("div");
        tarjeta.style.cssText =
            "border:1px solid #ddd;border-radius:8px;padding:8px;overflow:hidden;";

        const imagen = document.createElement("img");
        imagen.src = URL.createObjectURL(archivo);
        imagen.alt = archivo.name;
        imagen.style.cssText =
            "width:100%;height:90px;object-fit:contain;";

        imagen.onload = () => URL.revokeObjectURL(imagen.src);

        const nombre = document.createElement("div");
        nombre.textContent = archivo.name;
        nombre.style.cssText =
            "font-size:12px;overflow-wrap:anywhere;margin-top:6px;";

        const numero = document.createElement("div");
        numero.textContent = `Imagen ${indice + 1}`;
        numero.style.cssText =
            "font-size:12px;font-weight:bold;margin-top:4px;";

        tarjeta.append(imagen, numero, nombre);
        previewPromociones.appendChild(tarjeta);
    });

    mostrarMensaje(
        archivos.length
            ? `${archivos.length} imagen(es) seleccionada(s).`
            : "",
        "info"
    );
});

// =====================================================
// MOSTRAR MENSAJES EN EL MODAL
// =====================================================
function mostrarMensaje(texto, tipo = "info") {
    mensajePromociones.textContent = texto;
    mensajePromociones.style.display = texto ? "block" : "none";

    const colores = {
        info: "#0c5460",
        success: "#155724",
        error: "#721c24"
    };

    const fondos = {
        info: "#d1ecf1",
        success: "#d4edda",
        error: "#f8d7da"
    };

    mensajePromociones.style.color = colores[tipo] || colores.info;
    mensajePromociones.style.background =
        fondos[tipo] || fondos.info;
    mensajePromociones.style.padding = "10px";
    mensajePromociones.style.borderRadius = "5px";
}

// =====================================================
// SUBIR UNA IMAGEN A CLOUDINARY
// =====================================================
async function subirPromocionCloudinary(archivo) {
    const formData = new FormData();

    formData.append("file", archivo);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    const respuesta = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
    });

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.secure_url) {
        throw new Error(
            datos.error?.message || "No se pudo subir la imagen a Cloudinary."
        );
    }

    return datos.secure_url;
}

// =====================================================
// REGISTRAR LAS IMÁGENES EN LA API
// =====================================================
formPromociones.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const archivos = Array.from(inputArchivos.files || []);
    const fila = Number(document.getElementById("filaPromocion").value);
    const ordenInicial = Number(
        document.getElementById("ordenPromocion").value
    );
    const enlace = document.getElementById("enlacePromocion").value.trim();
    const activo =
        document.getElementById("activoPromocion").value === "true";

    // Validaciones
    if (archivos.length === 0) {
        mostrarMensaje("Selecciona al menos una imagen.", "error");
        return;
    }

    if (archivos.some(archivo =>
        !["image/jpeg", "image/png", "image/webp"].includes(archivo.type)
    )) {
        mostrarMensaje(
            "Solo se permiten imágenes JPG, PNG o WEBP.",
            "error"
        );
        return;
    }

    if (![1, 2].includes(fila)) {
        mostrarMensaje("Selecciona una fila válida.", "error");
        return;
    }

    if (!Number.isInteger(ordenInicial) || ordenInicial < 1) {
        mostrarMensaje(
            "El orden inicial debe ser un entero mayor que cero.",
            "error"
        );
        return;
    }

    if (ordenInicial + archivos.length - 1 > 2147483647) {
        mostrarMensaje("El orden indicado es demasiado grande.", "error");
        return;
    }

    if (enlace.length > 500) {
        mostrarMensaje("El enlace no puede superar los 500 caracteres.", "error");
        return;
    }

    btnGuardarPromociones.disabled = true;

    let registradas = 0;
    let imagenActual = 0;

    try {
        for (const archivo of archivos) {
            imagenActual++;

            mostrarMensaje(
                `Procesando imagen ${imagenActual} de ${archivos.length}...`,
                "info"
            );

            // 1. Subir el archivo a Cloudinary
            const urlImagen = await subirPromocionCloudinary(archivo);

            // 2. Enviar los datos a la API
            const respuesta = await fetch(API_PROMOCIONES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Url_Imagen_Prom: urlImagen,
                    Fila_Prom: fila,
                    Orden_Prom: ordenInicial + registradas,
                    Enlace_Prom: enlace || null,
                    Activo_Prom: activo
                })
            });

            if (!respuesta.ok) {
                const detalle = await respuesta.text();

                throw new Error(
                    `La API rechazó la imagen ${imagenActual}. ` +
                    `Código HTTP: ${respuesta.status}. ${detalle}`
                );
            }

            registradas++;
        }

        mostrarMensaje(
            `Se registraron ${registradas} de ${archivos.length} imágenes correctamente.`,
            "success"
        );

        // Limpiar el formulario solo si se registraron todas
        inputArchivos.value = "";
        previewPromociones.innerHTML = "";
        document.getElementById("ordenPromocion").value = "1";
        document.getElementById("enlacePromocion").value = "";
        document.getElementById("filaPromocion").value = "1";
        document.getElementById("activoPromocion").value = "true";

        // Si el carrusel ya tiene una función de recarga,
        // podremos invocarla aquí después.

    } catch (error) {
        console.error("Error al registrar promociones:", error);

        mostrarMensaje(
            `${error.message} Se registraron ${registradas} de ${archivos.length} imágenes antes del error.`,
            "error"
        );
    } finally {
        btnGuardarPromociones.disabled = false;
    }
});


//////////////FIN INSERTAR





//////////////INICIO MOSTRAR

const API_LISTAR_PROMOCIONES =
    "https://mi-proyecto1-2.onrender.com/api/RegistroPromociones";

// Guardar los temporizadores de cada fila
let temporizadorPromociones1 = null;
let temporizadorPromociones2 = null;

// =====================================================
// LEER PROPIEDADES DEL JSON
// Compatible con nombres camelCase y PascalCase
// =====================================================
function obtenerCampo(objeto, nombre) {
    if (objeto[nombre] !== undefined) {
        return objeto[nombre];
    }

    const alternativo =
        nombre.charAt(0).toLowerCase() + nombre.slice(1);

    return objeto[alternativo];
}

// =====================================================
// CREAR UNA IMAGEN DEL CARRUSEL
// =====================================================
function crearSlidePromocional(imagen) {
    const slide = document.createElement("div");
    slide.className = "promo-slide";

    const url = obtenerCampo(imagen, "Url_Imagen_Prom");
    const enlace = obtenerCampo(imagen, "Enlace_Prom");

    const img = document.createElement("img");
    img.className = "promo-imagen";
    img.src = url;
    img.alt = "Imagen promocional";
    img.loading = "eager";

    img.onerror = function () {
        slide.style.display = "none";
        console.error("No se pudo cargar la imagen promocional:", url);
    };

    if (enlace) {
        try {
            const destino = new URL(enlace, window.location.origin);

            if (["http:", "https:"].includes(destino.protocol)) {
                const link = document.createElement("a");
                link.href = destino.href;
                link.setAttribute("aria-label", "Ver promoción");

                link.appendChild(img);
                slide.appendChild(link);
            } else {
                slide.appendChild(img);
            }
        } catch {
            slide.appendChild(img);
        }
    } else {
        slide.appendChild(img);
    }

    return slide;
}

// =====================================================
// INICIAR UNA FILA DEL CARRUSEL
// =====================================================
function iniciarFilaPromocional(
    imagenes,
    idPista,
    intervalo,
    tipoFila
) {
    const pista = document.getElementById(idPista);

    if (!pista) return;

    if (tipoFila === 1 && temporizadorPromociones1) {
        clearInterval(temporizadorPromociones1);
        temporizadorPromociones1 = null;
    }

    if (tipoFila === 2 && temporizadorPromociones2) {
        clearInterval(temporizadorPromociones2);
        temporizadorPromociones2 = null;
    }

    pista.innerHTML = "";
    pista.style.transition = "none";
    pista.style.transform = "translateX(0)";

    if (imagenes.length === 0) {
        const vacio = document.createElement("div");
        vacio.className = "promo-vacio";
        vacio.textContent = "No hay promociones disponibles.";
        pista.appendChild(vacio);
        return;
    }

    imagenes.forEach(imagen => {
        pista.appendChild(crearSlidePromocional(imagen));
    });

    let indice = 0;

    if (imagenes.length < 2) return;

    const avanzar = () => {
        const primeraImagen = pista.querySelector(".promo-slide");

        if (!primeraImagen) return;

        // Ancho real de una imagen, incluido su contenedor
        const ancho = primeraImagen.getBoundingClientRect().width;

        if (!ancho) return;

        indice = (indice + 1) % imagenes.length;

        pista.style.transition = "transform 0.7s ease-in-out";
        pista.style.transform =
            `translateX(-${indice * ancho}px)`;
    };

    const temporizador = setInterval(avanzar, intervalo);

    if (tipoFila === 1) {
        temporizadorPromociones1 = temporizador;
    } else {
        temporizadorPromociones2 = temporizador;
    }
}

// =====================================================
// CONSULTAR API Y CARGAR LOS DOS CARRUSELES
// =====================================================
async function cargarCarruselPromociones() {
    const pista1 = document.getElementById("pistaPromociones1");
    const pista2 = document.getElementById("pistaPromociones2");

    try {
        const respuesta = await fetch(API_LISTAR_PROMOCIONES);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error("La API no devolvió una lista de imágenes.");
        }

        const activas = datos.filter(imagen => {
            const activo = obtenerCampo(imagen, "Activo_Prom");
            const url = obtenerCampo(imagen, "Url_Imagen_Prom");

            return (activo === true || activo === 1 || activo === "true")
                && typeof url === "string"
                && url.trim() !== "";
        });

        // Ordenar por posición y después por ID
        activas.sort((a, b) => {
            const filaA = Number(obtenerCampo(a, "Fila_Prom"));
            const filaB = Number(obtenerCampo(b, "Fila_Prom"));

            if (filaA !== filaB) return filaA - filaB;

            const ordenA = Number(obtenerCampo(a, "Orden_Prom"));
            const ordenB = Number(obtenerCampo(b, "Orden_Prom"));

            if (ordenA !== ordenB) return ordenA - ordenB;

            return Number(obtenerCampo(a, "Id_Prom")) -
                Number(obtenerCampo(b, "Id_Prom"));
        });

        const fila1 = activas.filter(
            imagen => Number(obtenerCampo(imagen, "Fila_Prom")) === 1
        );

        const fila2 = activas.filter(
            imagen => Number(obtenerCampo(imagen, "Fila_Prom")) === 2
        );

        // Fila 1: cada 5 segundos
        iniciarFilaPromocional(
            fila1,
            "pistaPromociones1",
            5000,
            1
        );

        // Fila 2: cada 20 segundos
        iniciarFilaPromocional(
            fila2,
            "pistaPromociones2",
            20000,
            2
        );

        console.log("Promociones cargadas:", {
            fila1: fila1.length,
            fila2: fila2.length
        });

    } catch (error) {
        console.error("Error al cargar las promociones:", error);

        [pista1, pista2].forEach(pista => {
            if (pista) {
                pista.innerHTML =
                    '<div class="promo-vacio">No se pudieron cargar las promociones.</div>';
            }
        });
    }
}

// Cargar al abrir la página
document.addEventListener(
    "DOMContentLoaded",
    cargarCarruselPromociones
);


//////////////FIN MOSTRAR




//////////////INICIO EDITAR

const formEditarPromocion =
    document.getElementById("formEditarPromocion");

// =====================================================
// LISTAR TODAS LAS PROMOCIONES
// =====================================================
async function cargarListaPromociones() {
    const contenedor = document.getElementById(
        "listaAdministrarPromociones"
    );

    const tabla = document.getElementById("tablaPromociones");

    contenedor.style.display = "block";
    tabla.textContent = "Cargando promociones...";

    try {
        const respuesta = await fetch(API_PROMOCIONES);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        tabla.innerHTML = "";

        if (!Array.isArray(datos) || datos.length === 0) {
            tabla.textContent = "No hay promociones registradas.";
            return;
        }

        datos.sort((a, b) => {
            const filaA = Number(obtenerCampo(a, "Fila_Prom"));
            const filaB = Number(obtenerCampo(b, "Fila_Prom"));

            if (filaA !== filaB) return filaA - filaB;

            return Number(obtenerCampo(a, "Orden_Prom")) -
                Number(obtenerCampo(b, "Orden_Prom"));
        });

        const tablaHTML = document.createElement("div");
        tablaHTML.style.overflowX = "auto";

        const tablaElemento = document.createElement("table");
        tablaElemento.className =
            "table table-bordered table-striped";

        tablaElemento.innerHTML = `
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Fila</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
        `;

        const tbody = document.createElement("tbody");

        datos.forEach(imagen => {
            const id = Number(obtenerCampo(imagen, "Id_Prom"));
            const url = obtenerCampo(imagen, "Url_Imagen_Prom");
            const fila = Number(obtenerCampo(imagen, "Fila_Prom"));
            const orden = Number(obtenerCampo(imagen, "Orden_Prom"));
            const activo = obtenerCampo(imagen, "Activo_Prom") === true ||
                obtenerCampo(imagen, "Activo_Prom") === 1 ||
                obtenerCampo(imagen, "Activo_Prom") === "true";

            const tr = document.createElement("tr");

            const tdImagen = document.createElement("td");
            const img = document.createElement("img");

            img.src = url;
            img.alt = "Promoción " + id;
            img.style.cssText =
                "width:130px;height:65px;object-fit:contain;";

            tdImagen.appendChild(img);

            const tdFila = document.createElement("td");
            tdFila.textContent = fila === 1 ? "Fila 1" : "Fila 2";

            const tdOrden = document.createElement("td");
            tdOrden.textContent = orden;

            const tdEstado = document.createElement("td");
            tdEstado.textContent = activo ? "Activo" : "Inactivo";

            const tdAccion = document.createElement("td");
            const botonEditar = document.createElement("button");

            botonEditar.type = "button";
            botonEditar.className = "btn btn-sm btn-primary";
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", () => {
                abrirEditarPromocion(id);
            });

            tdAccion.appendChild(botonEditar);

            tr.append(
                tdImagen,
                tdFila,
                tdOrden,
                tdEstado,
                tdAccion
            );

            tbody.appendChild(tr);
        });

        tablaElemento.appendChild(tbody);
        tablaHTML.appendChild(tablaElemento);
        tabla.appendChild(tablaHTML);

    } catch (error) {
        console.error("Error al listar promociones:", error);
        tabla.textContent =
            "No se pudieron cargar las promociones. Intenta nuevamente.";
    }
}

// =====================================================
// OBTENER PROMOCIÓN POR ID Y ABRIR EL MODAL
// =====================================================
async function abrirEditarPromocion(id) {
    try {
        const respuesta = await fetch(`${API_PROMOCIONES}/${id}`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const imagen = await respuesta.json();

        document.getElementById("editarIdProm").value =
            obtenerCampo(imagen, "Id_Prom");

        document.getElementById("editarVistaPrevia").src =
            obtenerCampo(imagen, "Url_Imagen_Prom");

        document.getElementById("editarFilaPromocion").value =
            obtenerCampo(imagen, "Fila_Prom");

        document.getElementById("editarOrdenPromocion").value =
            obtenerCampo(imagen, "Orden_Prom");

        document.getElementById("editarEnlacePromocion").value =
            obtenerCampo(imagen, "Enlace_Prom") || "";

        const activo = obtenerCampo(imagen, "Activo_Prom");

        document.getElementById("editarActivoPromocion").value =
            activo === true || activo === 1 || activo === "true"
                ? "true"
                : "false";

        document.getElementById("editarArchivoPromocion").value = "";

        document.getElementById("mensajeEditarPromocion").style.display =
            "none";

        $("#modalEditarPromocion").modal("show");

    } catch (error) {
        console.error("Error al obtener promoción:", error);
        alert("No se pudo cargar la promoción para editar.");
    }
}

// =====================================================
// GUARDAR LOS CAMBIOS MEDIANTE PUT
// =====================================================
formEditarPromocion.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const boton = document.getElementById(
        "btnGuardarEdicionPromocion"
    );

    const mensaje = document.getElementById(
        "mensajeEditarPromocion"
    );

    const id = Number(
        document.getElementById("editarIdProm").value
    );

    const archivo = document.getElementById(
        "editarArchivoPromocion"
    ).files[0];

    const fila = Number(
        document.getElementById("editarFilaPromocion").value
    );

    const orden = Number(
        document.getElementById("editarOrdenPromocion").value
    );

    const enlace = document.getElementById(
        "editarEnlacePromocion"
    ).value.trim();

    const activo = document.getElementById(
        "editarActivoPromocion"
    ).value === "true";

    const mostrarError = texto => {
        mensaje.textContent = texto;
        mensaje.style.display = "block";
        mensaje.style.background = "#f8d7da";
        mensaje.style.color = "#721c24";
    };

    if (!Number.isInteger(id) || id < 1) {
        mostrarError("El identificador de la promoción no es válido.");
        return;
    }

    if (![1, 2].includes(fila)) {
        mostrarError("Selecciona una fila válida.");
        return;
    }

    if (!Number.isInteger(orden) || orden < 1) {
        mostrarError("El orden debe ser un entero mayor que cero.");
        return;
    }

    if (enlace.length > 500) {
        mostrarError("El enlace no puede superar los 500 caracteres.");
        return;
    }

    if (archivo && ![
        "image/jpeg",
        "image/png",
        "image/webp"
    ].includes(archivo.type)) {
        mostrarError("Selecciona una imagen JPG, PNG o WEBP.");
        return;
    }

    boton.disabled = true;
    boton.textContent = "Guardando...";

    try {
        // Si se seleccionó una imagen nueva, subirla.
        // Si no, conservar la URL actual.
        let urlImagen = document.getElementById(
            "editarVistaPrevia"
        ).src;

        if (archivo) {
            mensaje.textContent = "Subiendo nueva imagen...";
            mensaje.style.display = "block";

            const formData = new FormData();
            formData.append("file", archivo);
            formData.append("upload_preset", CLOUDINARY_PRESET);

            const respuestaCloudinary = await fetch(
                CLOUDINARY_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

            const datosCloudinary =
                await respuestaCloudinary.json();

            if (!respuestaCloudinary.ok ||
                !datosCloudinary.secure_url) {
                throw new Error(
                    datosCloudinary.error?.message ||
                    "No se pudo subir la nueva imagen."
                );
            }

            urlImagen = datosCloudinary.secure_url;
        }

        const respuesta = await fetch(
            `${API_PROMOCIONES}/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Id_Prom: id,
                    Url_Imagen_Prom: urlImagen,
                    Fila_Prom: fila,
                    Orden_Prom: orden,
                    Enlace_Prom: enlace || null,
                    Activo_Prom: activo
                })
            }
        );

        if (!respuesta.ok) {
            const detalle = await respuesta.text();

            throw new Error(
                `No se pudieron guardar los cambios (HTTP ${respuesta.status}). ${detalle}`
            );
        }

        mensaje.textContent = "Promoción actualizada correctamente.";
        mensaje.style.display = "block";
        mensaje.style.background = "#d4edda";
        mensaje.style.color = "#155724";

        // Actualizar la tabla y el carrusel con los datos nuevos
        await cargarListaPromociones();

        if (typeof cargarCarruselPromociones === "function") {
            await cargarCarruselPromociones();
        }

        setTimeout(() => {
            $("#modalEditarPromocion").modal("hide");
        }, 800);

    } catch (error) {
        console.error("Error al actualizar promoción:", error);
        mostrarError(error.message || "Error al actualizar la promoción.");
    } finally {
        boton.disabled = false;
        boton.textContent = "Guardar cambios";
    }
});


//////////////FIN EDITAR