
const API_PROMOCIONES = "/Inicio/ListarPromociones";
const API_OBTENER_PROMOCION = "/Inicio/ObtenerPromocion";
const API_ACTUALIZAR_PROMOCION = "/Inicio/ActualizarPromocion";
const API_ELIMINAR_PROMOCION = "/Inicio/EliminarPromocion";
const API_REGISTRAR_PROMOCION = "/Inicio/RegistrarPromocion";

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

    if (!respuesta.ok || !datos.secure_url || !datos.public_id) {
        throw new Error(
            datos.error?.message ||
            "No se pudo subir la imagen a Cloudinary."
        );
    }

    return {
        url: datos.secure_url,
        publicId: datos.public_id
    };
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

    // Cerrar modal después de registrar correctamente
    $("#modalAgregarPromociones").modal("hide");

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
            const imagenCloudinary = await subirPromocionCloudinary(archivo);

            // 2. Enviar los datos a la API
            const respuesta = await fetch(API_REGISTRAR_PROMOCION, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Url_Imagen_Prom: imagenCloudinary.url,
                    PublicId_Prom: imagenCloudinary.publicId,
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


const API_LISTAR_PROMOCIONES = "/Inicio/ListarPromociones";

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
// ==========================================
// ESPERAR A QUE TERMINEN DE CARGAR LAS IMÁGENES
// ==========================================

function esperarCargaImagenesPromocionales(pista) {

    const imagenes = Array.from(pista.querySelectorAll("img"));

    return Promise.all(
        imagenes.map(img => {

            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
            });

        })
    );
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

    // Contenedor de la fila promocional
    const filaContenedor = pista.closest(
        tipoFila === 1 ? ".promo-fila-1" : ".promo-fila-2"
    );

    // Reiniciar estado de carga
    if (filaContenedor) {
        filaContenedor.classList.remove("carrusel-listo");
    }

    // Ocultar controles al iniciar o recargar
    if (tipoFila === 1) {
        const btnVerTodo = filaContenedor?.querySelector(".btn-ver-todo");

        if (btnVerTodo) {
            btnVerTodo.style.display = "none";
        }
    }

    if (tipoFila === 2) {
        const flechas = filaContenedor?.querySelectorAll(".promo-flecha");

        flechas?.forEach(flecha => {
            flecha.hidden = true;
            flecha.style.display = "none";
        });
    }

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

    // Elementos exclusivos del carrusel 2
    const visor = tipoFila === 2
        ? pista.closest(".promo-fila-2-visor")
        : null;

    const btnAnterior = visor
        ? visor.querySelector(".promo-flecha-anterior")
        : null;

    const btnSiguiente = visor
        ? visor.querySelector(".promo-flecha-siguiente")
        : null;

    const indicadores = tipoFila === 2
        ? document.getElementById("indicadoresPromociones2")
        : null;

    if (indicadores) {
        indicadores.innerHTML = "";
        indicadores.style.display = "none";
    }

    if (imagenes.length === 0) {
        const vacio = document.createElement("div");
        vacio.className = "promo-vacio";
        vacio.textContent = "No hay promociones disponibles.";
        pista.appendChild(vacio);

        if (btnAnterior) btnAnterior.hidden = true;
        if (btnSiguiente) btnSiguiente.hidden = true;

        return;
    }

    imagenes.forEach(imagen => {
        pista.appendChild(crearSlidePromocional(imagen));
    });

    let indice = 0;

    if (imagenes.length < 2) {
        if (btnAnterior) btnAnterior.hidden = true;
        if (btnSiguiente) btnSiguiente.hidden = true;

        // Esperar a que cargue la imagen antes de mostrar Ver todo
        esperarCargaImagenesPromocionales(pista).then(() => {

            if (filaContenedor) {
                filaContenedor.classList.add("carrusel-listo");
            }

        });

        return;
    }

    // Las flechas permanecen ocultas hasta que las imágenes carguen
    if (btnAnterior) btnAnterior.hidden = true;
    if (btnSiguiente) btnSiguiente.hidden = true;

    // Crear indicadores
    const botonesIndicadores = [];

    if (indicadores) {
        indicadores.style.display = "flex";

        imagenes.forEach((imagen, posicion) => {
            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "promo-indicador";
            boton.setAttribute(
                "aria-label",
                `Mostrar imagen ${posicion + 1}`
            );

            boton.addEventListener("click", () => {
                indice = posicion;
                mostrarImagen();
                reiniciarTemporizador();
            });

            indicadores.appendChild(boton);
            botonesIndicadores.push(boton);
        });
    }

    // Actualizar indicador activo
    const actualizarIndicadores = () => {
        botonesIndicadores.forEach((boton, posicion) => {
            const activo = posicion === indice;

            boton.classList.toggle("activo", activo);
            boton.setAttribute("aria-current", activo ? "true" : "false");
        });
    };

    // Mostrar imagen correspondiente
    const mostrarImagen = () => {
        const primeraImagen = pista.querySelector(".promo-slide");

        if (!primeraImagen) return;

        const ancho = primeraImagen.getBoundingClientRect().width;

        if (!ancho) return;

        pista.style.transition = "transform 0.7s ease-in-out";
        pista.style.transform =
            `translateX(-${indice * ancho}px)`;

        actualizarIndicadores();
    };

    // Avanzar
    const avanzar = () => {
        indice = (indice + 1) % imagenes.length;
        mostrarImagen();
    };

    // Retroceder
    const retroceder = () => {
        indice = (indice - 1 + imagenes.length) % imagenes.length;
        mostrarImagen();
    };

    // Reiniciar temporizador automático
    let temporizador = null;

    const reiniciarTemporizador = () => {
        if (temporizador) {
            clearInterval(temporizador);
        }

        temporizador = setInterval(avanzar, intervalo);
    };

    // Eventos de las flechas
    if (btnAnterior) {
        btnAnterior.onclick = () => {
            retroceder();
            reiniciarTemporizador();
        };
    }

    if (btnSiguiente) {
        btnSiguiente.onclick = () => {
            avanzar();
            reiniciarTemporizador();
        };
    }

    // ==========================================
    // ESPERAR CARGA COMPLETA ANTES DE MOSTRAR CONTROLES
    // ==========================================

    esperarCargaImagenesPromocionales(pista).then(() => {

        // Mostrar el carrusel ya cargado
        mostrarImagen();

        actualizarIndicadores();

        // Marcar fila como lista
        if (filaContenedor) {
            filaContenedor.classList.add("carrusel-listo");
        }

        // Mostrar flechas solo cuando hay varias imágenes
        if (btnAnterior) {
            btnAnterior.hidden = false;
            btnAnterior.style.display = "flex";
        }

        if (btnSiguiente) {
            btnSiguiente.hidden = false;
            btnSiguiente.style.display = "flex";
        }

        // Iniciar desplazamiento automático
        reiniciarTemporizador();

        if (tipoFila === 1) {
            temporizadorPromociones1 = temporizador;
        } else {
            temporizadorPromociones2 = temporizador;
        }

    });
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

let publicIdPromocionEditando = null;

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
        const respuesta = await fetch("/Inicio/ListarPromociones");

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

            const botonEliminar = document.createElement("button");

            botonEliminar.type = "button";
            botonEliminar.className = "btn btn-sm btn-danger ms-2";
            botonEliminar.textContent = "Eliminar";

            botonEliminar.addEventListener("click", () => {
                eliminarPromocion(id, botonEliminar);
            });

            tdAccion.appendChild(botonEliminar);

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


async function eliminarPromocion(id, boton) {

    if (!confirm("¿Estás seguro de que deseas eliminar esta promoción?")) {
        return;
    }

    try {
        boton.disabled = true;
        boton.textContent = "Eliminando...";

        const respuesta = await fetch(`${API_ELIMINAR_PROMOCION}?id=${id}`, {
            method: "DELETE"
        });



        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo eliminar la promoción."
            );
        }

        alert(resultado.mensaje);

        await cargarListaPromociones();
        await cargarCarruselPromociones();

    } catch (error) {

        console.error("Error al eliminar promoción:", error);

        alert(error.message);

        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}
// =====================================================
// OBTENER PROMOCIÓN POR ID Y ABRIR EL MODAL
// =====================================================
async function abrirEditarPromocion(id) {
    try {
        const respuesta = await fetch(`${API_OBTENER_PROMOCION}?id=${id}`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const imagen = await respuesta.json();

        publicIdPromocionEditando =
            obtenerCampo(imagen, "PublicId_Prom") || null;

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

        let publicIdImagen = publicIdPromocionEditando;

        if (archivo) {
            mensaje.textContent = "Subiendo nueva imagen...";
            mensaje.style.display = "block";

            const imagenCloudinary =
                await subirPromocionCloudinary(archivo);

            urlImagen = imagenCloudinary.url;
            publicIdImagen = imagenCloudinary.publicId;
        }

        const respuesta = await fetch(
            `${API_ACTUALIZAR_PROMOCION}?id=${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    Id_Prom: id,
                    Url_Imagen_Prom: urlImagen,
                    PublicId_Prom: publicIdImagen,
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



///////////////////////////CARUSEL//////////////////////////////////////////////////////////



window.renderizarSubcategoriasCirculares = function () {

    const contenedor = document.getElementById(
        "subcategoriasCirculares"
    );

    const pista = document.getElementById(
        "pistaSubcategoriasCirculares"
    );
    if (!contenedor || !pista) return;

    // Ocultar flechas mientras se cargan las imágenes
    contenedor.classList.remove("cargado");

    const categorias = window.categoriasProductos || [];

    const productos = window.productosAgrupados || [];

    pista.innerHTML = "";

    if (!categorias.length || !productos.length) {
        contenedor.style.display = "none";
        return;
    }

    contenedor.style.display = "";

    const esAdministrador =
        typeof estaLogueado !== "undefined" && estaLogueado;

    // ==========================================
    // RECORRER CATEGORÍAS Y SUBCATEGORÍAS
    // ==========================================

    categorias.forEach(categoria => {

        const nombreCategoria = String(
            categoria.nombre ?? categoria.Nombre ?? ""
        ).trim().toLowerCase();

        // Excluir categorías especiales.
        if (
            nombreCategoria === "servicios" ||
            nombreCategoria === "nosotros"
        ) {
            return;
        }

        const idCategoria =
            categoria.idCategoria ?? categoria.IdCategoria;

        const subcategorias =
            categoria.subcategorias ??
            categoria.Subcategorias ??
            [];

        subcategorias.forEach(subcategoria => {

            const idSubcategoria =
                subcategoria.idSubcategoria ??
                subcategoria.IdSubcategoria;

            // ==========================================
            // BUSCAR PRODUCTOS DE LA SUBCATEGORÍA
            // ==========================================

            const productosSubcategoria = productos.filter(producto => {

                const idProductoSubcategoria =
                    producto.idSubcategoria ??
                    producto.IdSubcategoria;

                if (
                    Number(idProductoSubcategoria) !==
                    Number(idSubcategoria)
                ) {
                    return false;
                }

                const estadoProducto = String(
                    producto.estado ?? producto.Estado ?? ""
                ).trim().toLowerCase();

                if (!esAdministrador && estadoProducto === "inactivo") {
                    return false;
                }

                const nombreEquipo =
                    producto.tipo_Equipo ??
                    producto.tipoEquipo ??
                    producto.Tipo_Equipo ??
                    producto.tipo_equipo;

                if (
                    typeof nombreEquipo !== "string" ||
                    !nombreEquipo.trim()
                ) {
                    return false;
                }

                const variantes =
                    producto.variantes ??
                    producto.Variantes ??
                    [];

                if (!Array.isArray(variantes) || variantes.length === 0) {
                    return false;
                }

                const variantesDisponibles = variantes.filter(variante => {

                    const estadoVariante = String(
                        variante.estado ?? variante.Estado ?? ""
                    ).trim().toLowerCase();

                    return esAdministrador ||
                        estadoVariante !== "inactivo";
                });

                // Debe tener al menos una variante disponible.
                return variantesDisponibles.length > 0;

            });

            // Si no tiene productos disponibles, no mostrar el círculo.
            if (productosSubcategoria.length === 0) {
                return;
            }

            // ==========================================
            // ELEGIR UN PRODUCTO ALEATORIO
            // ==========================================

            const indiceAleatorio = Math.floor(
                Math.random() * productosSubcategoria.length
            );

            const productoElegido =
                productosSubcategoria[indiceAleatorio];

            const variantes =
                productoElegido.variantes ??
                productoElegido.Variantes ??
                [];

            const variantesDisponibles = variantes.filter(variante => {

                const estado = String(
                    variante.estado ?? variante.Estado ?? ""
                ).trim().toLowerCase();

                return esAdministrador || estado !== "inactivo";
            });

            // ==========================================
            // OBTENER IMÁGENES DEL PRODUCTO
            // ==========================================

            let imagenesDisponibles = [];

            variantesDisponibles.forEach(variante => {

                let urls = [];

                if (typeof obtenerUrlsVariante === "function") {

                    urls = obtenerUrlsVariante(variante);

                } else {

                    const imagenes =
                        variante.imagenes ??
                        variante.Imagenes ??
                        [];

                    urls = imagenes.map(imagen =>
                        typeof imagen === "string"
                            ? imagen
                            : imagen.urlImagen ?? imagen.UrlImagen
                    );

                    urls = urls.filter(Boolean);
                }

                // Compatibilidad con las propiedades adaptadas.
                if (urls.length === 0) {
                    urls = [
                        variante.url_Equipo,
                        variante.url1,
                        variante.url2,
                        variante.url3
                    ].filter(Boolean);
                }

                imagenesDisponibles.push(...urls);
            });

            // Eliminar imágenes repetidas.
            imagenesDisponibles = [
                ...new Set(imagenesDisponibles)
            ];

            // Elegir una imagen aleatoria del producto.
            let imagenElegida = imagenesDisponibles.length > 0
                ? imagenesDisponibles[0]
                : null;

            // ==========================================
            // CREAR CÍRCULO
            // ==========================================

            const item = document.createElement("div");
            item.className = "subcategoria-circular-item";


            const circulo = document.createElement("div");
            circulo.className = "subcategoria-circular-imagen";

            function mostrarRespaldo() {

                circulo.innerHTML = "";

                const respaldo = document.createElement("div");
                respaldo.className = "subcategoria-circular-respaldo";

                const icono = document.createElement("i");
                icono.setAttribute("data-lucide", "image-off");

                respaldo.appendChild(icono);
                circulo.appendChild(respaldo);

                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }

            if (imagenElegida) {

                const imagen = document.createElement("img");

                imagen.src = imagenElegida;
                imagen.alt = subcategoria.nombre ??
                    subcategoria.Nombre ??
                    "Subcategoría";

                imagen.loading = "lazy";

                imagen.onerror = mostrarRespaldo;

                circulo.appendChild(imagen);

            } else {

                mostrarRespaldo();
            }

            // Nombre de la subcategoría.
            const nombre = document.createElement("span");

            nombre.className = "subcategoria-circular-nombre";

            nombre.textContent =
                subcategoria.nombre ??
                subcategoria.Nombre ??
                "";

            item.append(circulo, nombre);


            // ==========================================
            // CLICK EN SUBCATEGORÍA CIRCULAR
            // ==========================================

            item.style.cursor = "pointer";

            item.addEventListener("click", () => {

                const nombreEquipo =
                    productoElegido.tipo_Equipo ??
                    productoElegido.tipoEquipo ??
                    productoElegido.Tipo_Equipo ??
                    productoElegido.tipo_equipo;

                seleccionarCategoria(idCategoria);

                seleccionarSubcategoria(
                    idSubcategoria,
                    idCategoria
                );

                seleccionarTipoEquipo(
                    nombreEquipo,
                    idSubcategoria,
                    idCategoria
                );

                actualizarUrlCategorias();

            });


            pista.appendChild(item);

        });

    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    if (typeof window.prepararCarruselInfinitoSubcategorias === "function") {
        window.prepararCarruselInfinitoSubcategorias();
    }

    // ==========================================
    // MOSTRAR FLECHAS CUANDO LAS IMÁGENES CARGUEN
    // ==========================================

    const imagenes = Array.from(
        pista.querySelectorAll(".subcategoria-circular-imagen img")
    );

    if (imagenes.length === 0) {
        contenedor.classList.add("cargado");
    } else {

        Promise.all(
            imagenes.map(imagen => {

                if (imagen.complete) {
                    return Promise.resolve();
                }

                return new Promise(resolve => {
                    imagen.addEventListener("load", resolve, { once: true });
                    imagen.addEventListener("error", resolve, { once: true });
                });
            })
        ).then(() => {
            contenedor.classList.add("cargado");
        });

    }

};



(function () {

    const contenedor = document.getElementById("subcategoriasCirculares");
    if (!contenedor) return;

    const visor = contenedor.querySelector(".subcategorias-circulares-visor");
    const pista = contenedor.querySelector(".subcategorias-circulares-pista");
    const btnAnterior = contenedor.querySelector(".subcategorias-flecha-anterior");
    const btnSiguiente = contenedor.querySelector(".subcategorias-flecha-siguiente");

    if (!visor || !pista || !btnAnterior || !btnSiguiente) return;

    let animando = false;
    let temporizador = null;

    let totalOriginales = 0;
    let pasoUnitario = 0;
    let distanciaCopia = 0;
    let inicioCentro = 0;

    // ==========================================
    // MEDIDAS
    // ==========================================

    function obtenerMedidas() {

        const item = pista.querySelector(".subcategoria-circular-item");

        const anchoItem = item
            ? item.getBoundingClientRect().width
            : 150;

        const estilos = window.getComputedStyle(pista);

        const gap = parseFloat(estilos.columnGap || estilos.gap) || 0;

        return {
            anchoItem,
            gap,
            paso: anchoItem + gap
        };
    }

    // ==========================================
    // ELIMINAR CLONES
    // ==========================================

    function eliminarCopias() {

        pista.querySelectorAll("[data-carrusel-clon='true']")
            .forEach(clon => clon.remove());

    }

    // ==========================================
    // CREAR COPIAS LATERALES
    // ==========================================

    function crearCopias(itemsOriginales) {

        const izquierda = document.createDocumentFragment();
        const derecha = document.createDocumentFragment();

        itemsOriginales.forEach(item => {

            const clonIzquierdo = item.cloneNode(true);
            const clonDerecho = item.cloneNode(true);

            clonIzquierdo.dataset.carruselClon = "true";
            clonDerecho.dataset.carruselClon = "true";

            izquierda.appendChild(clonIzquierdo);
            derecha.appendChild(clonDerecho);

        });

        pista.prepend(izquierda);
        pista.append(derecha);

    }

    // ==========================================
    // ESTADO DE FLECHAS
    // ==========================================

    function actualizarFlechas(hayDesplazamiento) {

        visor.classList.toggle("centrado", !hayDesplazamiento);

        contenedor.classList.toggle(
            "sin-desplazamiento",
            !hayDesplazamiento
        );

        btnAnterior.disabled = !hayDesplazamiento;
        btnSiguiente.disabled = !hayDesplazamiento;

        btnAnterior.style.opacity = hayDesplazamiento ? "1" : "0.35";
        btnSiguiente.style.opacity = hayDesplazamiento ? "1" : "0.35";

    }

    // ==========================================
    // PREPARAR CARRUSEL
    // ==========================================

    function prepararCarrusel() {

        if (animando) return;

        eliminarCopias();

        const itemsOriginales = Array.from(pista.children)
            .filter(item => item.dataset.carruselClon !== "true");

        totalOriginales = itemsOriginales.length;

        if (!totalOriginales) return;

        const { anchoItem, gap, paso } = obtenerMedidas();

        pasoUnitario = paso;
        distanciaCopia = totalOriginales * pasoUnitario;

        const estilos = window.getComputedStyle(contenedor);

        const padIzq =
            parseFloat(estilos.paddingLeft) || 0;

        const padDer =
            parseFloat(estilos.paddingRight) || 0;

        const anchoDisponible =
            contenedor.clientWidth - padIzq - padDer;

        const maxItems = Math.max(
            1,
            Math.floor((anchoDisponible + gap) / pasoUnitario)
        );

        const hayDesplazamiento = totalOriginales > maxItems;

        const itemsVisibles = Math.min(totalOriginales, maxItems);

        const anchoExacto =
            itemsVisibles * anchoItem +
            Math.max(0, itemsVisibles - 1) * gap;

        // ==========================================
        // MODO SIN DESPLAZAMIENTO
        // ==========================================

        if (!hayDesplazamiento) {

            // Sin padding lateral cuando todos caben.
            pista.style.paddingLeft = "0px";
            pista.style.paddingRight = "0px";

            visor.style.width = `${anchoExacto}px`;

            actualizarFlechas(false);

            visor.style.scrollBehavior = "auto";
            visor.style.scrollSnapType = "none";
            visor.scrollLeft = 0;
            visor.style.scrollBehavior = "";
            visor.style.scrollSnapType = "";

            return;
        }

        // ==========================================
        // MODO INFINITO
        // ==========================================

        // Usar el padding definido por CSS.
        pista.style.paddingLeft = "";
        pista.style.paddingRight = "";

        visor.style.width = `${anchoExacto}px`;

        actualizarFlechas(true);

        // Crear una copia a cada lado.
        crearCopias(itemsOriginales);

        const estilosPista = window.getComputedStyle(pista);

        const paddingPistaIzq =
            parseFloat(estilosPista.paddingLeft) || 0;

        // Inicio del grupo original, considerando su margen.
        inicioCentro = paddingPistaIzq + distanciaCopia;

        // Posicionarse en el grupo central.
        visor.style.scrollBehavior = "auto";
        visor.style.scrollSnapType = "none";

        visor.scrollLeft = inicioCentro;

        visor.style.scrollBehavior = "";
        visor.style.scrollSnapType = "";

    }

    // ==========================================
    // RECICLAR POSICIÓN SIN SALTO VISUAL
    // ==========================================

    function recentrarSiHaceFalta() {

        const posicion = visor.scrollLeft;

        visor.style.scrollBehavior = "auto";

        // Entró en el grupo derecho.
        if (posicion >= inicioCentro + distanciaCopia) {

            visor.scrollLeft = posicion - distanciaCopia;

        }

        // Entró en el grupo izquierdo.
        else if (posicion < inicioCentro) {

            visor.scrollLeft = posicion + distanciaCopia;

        }

        visor.style.scrollBehavior = "";

    }

    // ==========================================
    // MOVIMIENTO INFINITO DE UN CÍRCULO
    // ==========================================

    function desplazar(direccion) {

        if (animando || totalOriginales <= 1) return;

        animando = true;

        const destino =
            visor.scrollLeft + pasoUnitario * direccion;

        const snapAnterior = visor.style.scrollSnapType;

        visor.style.scrollSnapType = "none";

        // MISMA ANIMACIÓN EN AMBAS DIRECCIONES
        visor.scrollTo({
            left: destino,
            behavior: "smooth"
        });

        temporizador = setTimeout(() => {

            recentrarSiHaceFalta();

            visor.style.scrollSnapType = snapAnterior || "";

            animando = false;

        }, 500);

    }

    // ==========================================
    // FLECHAS
    // ==========================================

    btnAnterior.addEventListener("click", () => {
        desplazar(-1);
    });

    btnSiguiente.addEventListener("click", () => {
        desplazar(1);
    });

    // ==========================================
    // REDIMENSIONAR
    // ==========================================

    window.addEventListener("resize", () => {

        if (animando) return;

        prepararCarrusel();

    });

    // ==========================================
    // ACTUALIZACIÓN GLOBAL
    // ==========================================

    window.prepararCarruselInfinitoSubcategorias = prepararCarrusel;

    window.actualizarSubcategoriasCirculares = function () {

        requestAnimationFrame(() => {

            if (!animando) {
                prepararCarrusel();
            }

        });

    };

    // ==========================================
    // INICIALIZAR
    // ==========================================

    prepararCarrusel();

})();
