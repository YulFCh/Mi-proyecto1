
let imagenesZoom = [];
let indexZoom = 0;

let imagenesAgregar = [];
let imagenesEditar = [];
let indiceArrastrado = null;

// Variable global para controlar la cantidad en el modal de zoom
let cantidadActualZoom = 1;

function changeImage(element, targetId) {
    document.getElementById(targetId).src = element.src;

    element.parentNode.querySelectorAll('.thumbnail-image')
        .forEach(img => img.classList.remove('active-thumb'));

    element.classList.add('active-thumb');
}

document.addEventListener("DOMContentLoaded", function () {
    const inputFile = document.getElementById("fileImage");
    if (inputFile) {
        inputFile.addEventListener("change", function () {
            const files = this.files;
            for (let file of files) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagenesAgregar.push(e.target.result);
                    renderPreview("previewContainer", imagenesAgregar);
                };
                reader.readAsDataURL(file);
            }
            this.value = "";
        });
    }

    const inputEditar = document.getElementById("editar_fileImage");
    if (inputEditar) {
        inputEditar.addEventListener("change", function () {
            const files = this.files;
            for (let file of files) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagenesEditar.push(e.target.result);
                    renderPreview("editar_previewContainer", imagenesEditar);
                };
                reader.readAsDataURL(file);
            }
            this.value = "";
        });
    }

    // --- LÓGICA DE CÁLCULO AUTOMÁTICO DE DESCUENTOS ---
    const precioAntesInput = document.getElementById("precioAntes");
    const descuentoInput = document.getElementById("descuento");
    const precioActualInput = document.getElementById("precio");

    function calcularPrecioActual() {
        const precioAntes = parseFloat(precioAntesInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;

        if (descuento > 0 && precioAntes > 0) {
            const resultado = precioAntes - (precioAntes * (descuento / 100));
            precioActualInput.value = resultado.toFixed(2);
        } else {
            precioActualInput.value = precioAntes > 0 ? precioAntes.toFixed(2) : "";
        }
    }

    if (precioAntesInput && descuentoInput) {
        precioAntesInput.addEventListener("input", calcularPrecioActual);
        descuentoInput.addEventListener("input", calcularPrecioActual);
    }

    const editarPrecioAntesInput = document.getElementById("editar_precioAntes");
    const editarDescuentoInput = document.getElementById("editar_descuento");
    const editarPrecioActualInput = document.getElementById("editar_precio");

    function calcularPrecioActualEditar() {
        const precioAntes = parseFloat(editarPrecioAntesInput.value) || 0;
        const descuento = parseFloat(editarDescuentoInput.value) || 0;

        if (descuento > 0 && precioAntes > 0) {
            const resultado = precioAntes - (precioAntes * (descuento / 100));
            editarPrecioActualInput.value = resultado.toFixed(2);
        } else {
            editarPrecioActualInput.value = precioAntes > 0 ? precioAntes.toFixed(2) : "";
        }
    }

    if (editarPrecioAntesInput && editarDescuentoInput) {
        editarPrecioAntesInput.addEventListener("input", calcularPrecioActualEditar);
        editarDescuentoInput.addEventListener("input", calcularPrecioActualEditar);
    }

    cargarProductos();

    // --- CAPTURA DE CLICS EN "AGREGAR AL CARRITO" (Tarjetas y Modales) ---
    document.addEventListener("click", function (e) {
        const boton = e.target.closest(".btn-agregar-carrito");
        if (boton) {
            const id = parseInt(boton.getAttribute("data-id"));
            const nombre = boton.getAttribute("data-nombre");
            const precio = parseFloat(boton.getAttribute("data-precio"));
            const imagenes = JSON.parse(boton.getAttribute("data-imagenes") || "[]");

            let cantidad = 1;
            if (boton.id === "zoom-btn-agregar") {
                cantidad = cantidadActualZoom;
                $('#modalZoom').modal('hide');
            } else {
                const display = document.getElementById(`cant-display-${id}`);
                cantidad = display ? parseInt(display.innerText) : 1;
                if (display) display.innerText = "1";
            }

            agregarAlCarritoDirecto(id, nombre, precio, imagenes, cantidad);
        }
    });
});

const traductorColores = {
    negro: "#000000",
    blanco: "#ffffff",
    rojo: "#ff4d4d",
    azul: "#007bff",
    gris: "#888888",
    plomo: "#a6a6a6",
    plateado: "#e0e0e0",
    dorado: "#ffd700",
    verde: "#28a745",
    amarillo: "#ffc107",
    naranja: "#fd7e14",
    morado: "#6f42c1",
    violeta: "#8a2be2",
    rosado: "#ff69b4",
    rosa: "#ff69b4",
    marron: "#8b4513",
    cafe: "#8b4513",
    café: "#8b4513"
};


function obtenerColorCSS(nombre) {

    if (!nombre) {
        return "#cccccc";
    }

    const limpio = nombre
        .toString()
        .trim()
        .toLowerCase();

    return traductorColores[limpio] || limpio;
}

function seleccionarColorProducto(productoId, varianteIndex) {

    const producto = window.productosAgrupados?.find(
        p => p.id === productoId
    );

    if (!producto) {
        console.error("Producto no encontrado:", productoId);
        return;
    }

    const variantes =
        producto.variantes ||
        producto.Variantes ||
        [];

    const variante = variantes[varianteIndex];

    if (!variante) {
        console.error(
            "Variante no encontrada:",
            varianteIndex
        );
        return;
    }

    const card = document.getElementById(
        `producto-${productoId}`
    );

    if (!card) return;


    // ==================================================
    // GUARDAR VARIANTE SELECCIONADA
    // ==================================================

    card.dataset.varianteIndex = varianteIndex;


    // ==================================================
    // IMAGEN PRINCIPAL
    // ==================================================

    const imagenPrincipal =
        card.querySelector(".main-product-image");

    if (imagenPrincipal) {

        imagenPrincipal.src =
            variante.url_Equipo || "";

    }


    // ==================================================
    // MINIATURAS
    // ==================================================

    const thumbnailContainer =
        card.querySelector(".thumbnail-container");

    if (thumbnailContainer) {

        const imagenes = [
            variante.url_Equipo,
            variante.url1,
            variante.url2,
            variante.url3
        ].filter(Boolean);

        thumbnailContainer.innerHTML =
            imagenes.map((url, index) => `
                <img
                    src="${url}"
                    class="thumbnail-image ${index === 0
                    ? "active-thumb"
                    : ""
                }"
                    onclick="seleccionarMiniaturaProducto(
                        this,
                        '${url}',
                        ${productoId}
                    )"
                />
            `).join("");
    }


    // ==================================================
    // COLOR SELECCIONADO
    // ==================================================

    const nombreColor =
        card.querySelector(
            ".color-nombre-seleccionado"
        );

    if (nombreColor) {

        nombreColor.innerText =
            variante.color || "";

    }

    // ==================================================
    // DESCRIPCIÓN CORTA
    // ==================================================

    const descripcion =
        card.querySelector(".producto-descripcion");

    if (descripcion) {
        descripcion.innerText =
            variante.descripcion || "";
    }


    // ==================================================
    // DESCRIPCIÓN DETALLADA
    // ==================================================

    const descripcionDetallada =
        card.querySelector(".producto-descripcion-detallada");

    if (descripcionDetallada) {
        descripcionDetallada.innerText =
            variante.descripcion1 || "";
    }


    // ==================================================
    // GARANTÍA
    // ==================================================

    const garantia =
        card.querySelector(".producto-garantia");

    if (garantia) {
        garantia.innerText =
            variante.garantia || "";
    }


    // ==================================================
    // PRECIO ACTUAL
    // ==================================================

    const precio =
        card.querySelector(".producto-precio");

    if (precio) {

        precio.innerText =
            `S/. ${parseFloat(
                variante.precio || 0
            ).toFixed(2)}`;

    }


    // ==================================================
    // DESCUENTO
    // ==================================================

    const descuento =
        card.querySelector(".producto-descuento");

    if (descuento) {

        const descuentoValor =
            parseFloat(
                variante.descuento || 0
            );

        if (descuentoValor > 0) {

            descuento.innerText =
                `-${descuentoValor}%`;

            descuento.style.display =
                "inline-flex";

        } else {

            descuento.innerText = "";

            descuento.style.display =
                "none";
        }
    }


    // ==================================================
    // PRECIO ANTES
    // ==================================================

    const precioAntes =
        card.querySelector(
            ".producto-precio-antes"
        );

    if (precioAntes) {

        const precioAntesValor =
            parseFloat(
                variante.precio_Antes || 0
            );

        const descuentoValor =
            parseFloat(
                variante.descuento || 0
            );

        if (
            precioAntesValor > 0 &&
            descuentoValor > 0
        ) {

            precioAntes.innerText =
                `S/. ${precioAntesValor.toFixed(2)}`;

            precioAntes.style.display =
                "inline";

        } else {

            precioAntes.innerText = "";

            precioAntes.style.display =
                "none";
        }
    }


    // ==================================================
    // CÓDIGO
    // ==================================================

    const codigo =
        card.querySelector(
            ".producto-codigo"
        );

    if (codigo) {

        codigo.innerText =
            variante.codigo_Producto ||
            "N/A";

    }


    // ==================================================
    // MARCAR COLOR ACTIVO
    // ==================================================

    card.querySelectorAll(
        ".color-selector"
    ).forEach(btn => {

        const indice =
            parseInt(
                btn.dataset.variante
            );

        if (indice === varianteIndex) {

            btn.classList.add(
                "color-activo"
            );

            btn.style.border =
                "2px solid #fff";

            btn.style.boxShadow =
                "0 0 0 2px #8a2be2";

        } else {

            btn.classList.remove(
                "color-activo"
            );

            btn.style.border =
                "2px solid #ccc";

            btn.style.boxShadow =
                "none";
        }

    });


    // ==================================================
    // ACTUALIZAR BOTÓN CARRITO
    // ==================================================

    const botonCarrito =
        card.querySelector(
            ".btn-agregar-carrito"
        );

    if (botonCarrito) {

        const imagenes = [
            variante.url_Equipo,
            variante.url1,
            variante.url2,
            variante.url3
        ].filter(Boolean);


        botonCarrito.setAttribute(
            "data-id",
            variante.id
        );


        botonCarrito.setAttribute(
            "data-nombre",
            `${producto.marca || "SIN MARCA"} ${producto.modelo || ""} - ${variante.color || ""}`
        );


        botonCarrito.setAttribute(
            "data-precio",
            variante.precio
        );


        botonCarrito.setAttribute(
            "data-imagenes",
            JSON.stringify(imagenes)
        );
    }
}

function seleccionarMiniaturaProducto(
    elemento,
    url,
    productoId
) {
    const card = document.getElementById(
        `producto-${productoId}`
    );

    if (!card) return;

    // ==========================================
    // GUARDAR ÍNDICE DE LA IMAGEN SELECCIONADA
    // ==========================================

    const miniaturas = Array.from(
        card.querySelectorAll(".thumbnail-image")
    );

    const indiceImagen = miniaturas.indexOf(elemento);

    card.dataset.imagenIndex = indiceImagen >= 0
        ? indiceImagen
        : 0;


    // ==========================================
    // CAMBIAR IMAGEN PRINCIPAL
    // ==========================================

    const imagenPrincipal =
        card.querySelector(".main-product-image");

    if (imagenPrincipal) {
        imagenPrincipal.src = url;
    }


    // ==========================================
    // MARCAR MINIATURA ACTIVA
    // ==========================================

    card.querySelectorAll(
        ".thumbnail-image"
    ).forEach(img => {
        img.classList.remove("active-thumb");
    });

    elemento.classList.add("active-thumb");
}

function abrirZoomProductoSeleccionado(productoId) {

    const producto =
        window.productosAgrupados?.find(
            p => p.id === productoId
        );

    if (!producto) {
        console.error(
            "Producto no encontrado:",
            productoId
        );
        return;
    }

    const card =
        document.getElementById(
            `producto-${productoId}`
        );

    if (!card) {
        console.error(
            "No se encontró la tarjeta:",
            productoId
        );
        return;
    }


    // ==========================================
    // VARIANTE SELECCIONADA
    // ==========================================

    const varianteIndex =
        parseInt(
            card.dataset.varianteIndex || "0"
        );

    const variantes =
        producto.variantes ||
        producto.Variantes ||
        [];

    const variante =
        variantes[varianteIndex];

    if (!variante) {
        console.error(
            "Variante no encontrada:",
            varianteIndex
        );
        return;
    }


    // ==========================================
    // IMÁGENES DE LA VARIANTE
    // ==========================================

    const imagenes = [
        variante.url_Equipo,
        variante.url1,
        variante.url2,
        variante.url3
    ].filter(Boolean);


    // ==========================================
    // OBTENER LA IMAGEN QUE SE VE ACTUALMENTE
    // ==========================================

    const imagenPrincipal =
        card.querySelector(
            ".main-product-image"
        );

    let imagenSeleccionada = null;

    if (imagenPrincipal) {
        imagenSeleccionada =
            imagenPrincipal.src;
    }


    // ==========================================
    // BUSCAR QUÉ POSICIÓN TIENE ESA IMAGEN
    // ==========================================

    let indiceImagen = imagenes.findIndex(
        url => url === imagenSeleccionada
    );


    // ==========================================
    // SI NO SE ENCUENTRA, USAMOS DATASET
    // ==========================================

    if (indiceImagen === -1) {

        indiceImagen =
            parseInt(
                card.dataset.imagenIndex || "0"
            );

    }


    // ==========================================
    // SEGURIDAD
    // ==========================================

    if (
        indiceImagen < 0 ||
        indiceImagen >= imagenes.length
    ) {
        indiceImagen = 0;
    }


    // ==========================================
    // CREAR OBJETO PARA EL ZOOM
    // ==========================================

    const itemZoom = {

        ...producto,

        id: variante.id,

        color:
            variante.color,

        precio:
            variante.precio,

        precio_Antes:
            variante.precio_Antes,

        descuento:
            variante.descuento,

        estado:
            variante.estado,

        descripcion:
            variante.descripcion,

        descripcion1:
            variante.descripcion1,

        garantia:
            variante.garantia,

        url_Equipo:
            variante.url_Equipo,

        url1:
            variante.url1,

        url2:
            variante.url2,

        url3:
            variante.url3,

        codigo_Producto:
            variante.codigo_Producto ||
            producto.codigo_Producto,

        variantes:
            variantes,

        varianteSeleccionadaIndex:
            varianteIndex,

        // ======================================
        // ESTA ES LA IMAGEN QUE DEBE ABRIRSE
        // ======================================

        indiceImagenSeleccionada:
            indiceImagen,

        imagenSeleccionada:
            imagenes[indiceImagen]
    };



    abrirZoom(itemZoom);
}

async function cargarProductos() {
    const contenedor = document.getElementById("contenedorProductos");
    if (!contenedor) return;

    try {
        const response = await fetch(
            "https://mi-proyecto1-2.onrender.com/api/registros"
        );

        const data = await response.json();

        window.productosAgrupados = data;

        contenedor.innerHTML = "";

        data.forEach(item => {

            const estadoEquipo = item.estado
                ? item.estado.toLowerCase().trim()
                : "";

            if (estadoEquipo === "inactivo" && !estaLogueado) {
                return;
            }

            // =====================================================
            // OBTENER VARIANTES
            // =====================================================

            const variantes =
                item.variantes ||
                item.Variantes ||
                [];

            if (variantes.length === 0) {
                console.warn(
                    "Producto sin variantes:",
                    item.id
                );
                return;
            }

            // Primera variante seleccionada por defecto
            const varianteInicial = variantes[0];

            // =====================================================
            // COLORES ÚNICOS
            // =====================================================
            // =====================================================
            // COLORES / VARIANTES
            // =====================================================

            const coloresHTML = variantes.map((variante, index) => {

                const colorNombre =
                    variante.color || "Sin color";

                const colorCSS =
                    obtenerColorCSS(colorNombre);

                return `
        <button
            type="button"
            class="color-selector ${index === 0 ? "color-activo" : ""}"
            data-variante="${index}"
            title="${colorNombre}"
            onclick="seleccionarColorProducto(${item.id}, ${index})"
            style="
                width:20px;
                height:20px;
                border-radius:50%;
                padding:0;
                cursor:pointer;
                background-color:${colorCSS};
                border:${index === 0
                        ? "2px solid #fff"
                        : "1px solid #ccc"};
                box-shadow:${index === 0
                        ? "0 0 0 2px #8a2be2"
                        : "none"};
                transition:all .2s;
            "
        ></button>
    `;
            }).join("");
            

            // =====================================================
            // IMÁGENES DE LA VARIANTE INICIAL
            // =====================================================

            const imagenesIniciales = [
                varianteInicial.url_Equipo,
                varianteInicial.url1,
                varianteInicial.url2,
                varianteInicial.url3
            ].filter(Boolean);

            // =====================================================
            // GENERAR MINIATURAS
            // =====================================================

            const miniaturasHTML = imagenesIniciales
                .map((url, index) => `
                    <img
                        src="${url}"
                        class="thumbnail-image ${index === 0 ? "active-thumb" : ""}"
                        onclick="seleccionarMiniaturaProducto(
                            this,
                            '${url}',
                            ${item.id}
                        )"
                    />
                `)
                .join("");


            contenedor.innerHTML += `

                <div
                    class="product-gallery"
                    id="producto-${item.id}"
                    data-variante-index="0"
                >

                    <!-- TIPO -->
                    <div class="tipo-equipo-badge">
                        ${item.tipo_Equipo || ""}
                    </div>


                    <!-- IMAGEN PRINCIPAL -->
                    <div class="main-image-container">

                        <img
                            id="main-${item.id}"
                            src="${varianteInicial.url_Equipo || ""}"
                            class="main-product-image"
                            style="cursor:pointer"
                            onclick="abrirZoomProductoSeleccionado(${item.id})"
                        />

                    </div>


                    <!-- MINIATURAS -->
                    <div class="thumbnail-container">

                        ${miniaturasHTML}

                    </div>

                    <!-- COLORES -->
<div
    class="producto-colores-container"
    style="
        display:flex;
        align-items:center;
        gap:8px;
        margin-top:10px;
        margin-bottom:8px;
        flex-wrap:wrap;
    "
>
    <span
        style="
            font-size:13px;
            color:#666;
            font-weight:600;
        "
    >
    </span>

    <div
        class="producto-colores"
        style="
            display:flex;
            align-items:center;
            gap:7px;
            flex-wrap:wrap;
        "
    >
        ${coloresHTML}
    </div>

    <span
        class="color-nombre-seleccionado"
        style="
            font-size:13px;
            color:#555;
            margin-left:2px;
        "
    >
        ${varianteInicial.color || ""}
    </span>
</div>


                    <!-- INFORMACIÓN -->
                    <div
                        class="product-info-block"
                        style="
                            text-align:left;
                            margin-top:10px;
                            line-height:1.5;
                        "
                    >

                        <div
                            style="
                                background:#fbfbfb;
                                padding:12px;
                                border-radius:8px;
                                border:1px dashed #e5e5e5;
                                margin-bottom:8px;
                            "
                        >

                            <!-- MARCA -->
                            <strong class="producto-marca">
                                ${item.marca || "SIN MARCA"}
                            </strong>

                            ${estadoEquipo === "agotado"
                    ? `
                                    <span
                                        style="
                                            color:#ff4d4d;
                                            font-style:italic;
                                            font-weight:bold;
                                            margin-left:6px;
                                        "
                                    >
                                        (Agotado)
                                    </span>
                                `
                    : ""
                }

                            <br />


                            <!-- MODELO -->
                            <span class="producto-modelo">
    ${item.modelo || ""}
</span>

<span class="producto-descripcion">
    ${varianteInicial.descripcion || ""}
</span>

                            <br />

                            




                            <!-- CÓDIGO -->
                            <small class="text-muted producto-codigo">
                                ${varianteInicial.codigo_Producto || "N/A"}
                            </small>


                           


                            <!-- PRECIOS -->
                            <div
                                style="
                                    display:flex;
                                    align-items:baseline;
                                    justify-content:space-between;
                                    margin-top:8px;
                                    line-height:1.2;
                                    flex-wrap:wrap;
                                    width:100%;
                                "
                            >

                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        gap:8px;
                                    "
                                >

                                    <span
                                        class="producto-precio"
                                        style="
                                            font-size:1.1em;
                                            font-weight:bold;
                                            color:#222;
                                        "
                                    >
                                        S/. ${parseFloat(
                    varianteInicial.precio || 0
                ).toFixed(2)}
                                    </span>


                                    <span
                                        class="producto-descuento"
                                        style="
                                            background-color:#ff4d4d;
                                            color:white;
                                            font-size:.85em;
                                            font-weight:bold;
                                            padding:0 6px;
                                            border-radius:4px;
                                            display:${parseFloat(
                    varianteInicial.descuento || 0
                ) > 0
                    ? "inline-flex"
                    : "none"
                };
                                            align-items:center;
                                            justify-content:center;
                                        "
                                    >
                                        ${parseFloat(
                    varianteInicial.descuento || 0
                ) > 0
                    ? "-" + varianteInicial.descuento + "%"
                    : ""
                }
                                    </span>

                                </div>


                                <span
                                    class="producto-precio-antes"
                                    style="
                                        text-decoration:line-through;
                                        color:#888;
                                        font-size:.9em;
                                        margin-left:auto;
                                        display:${parseFloat(
                    varianteInicial.precio_Antes || 0
                ) > 0 &&
                    parseFloat(
                        varianteInicial.descuento || 0
                    ) > 0
                    ? "inline"
                    : "none"
                };
                                    "
                                >
                                    ${parseFloat(
                    varianteInicial.precio_Antes || 0
                ) > 0 &&
                    parseFloat(
                        varianteInicial.descuento || 0
                    ) > 0
                    ? "S/. " +
                    parseFloat(
                        varianteInicial.precio_Antes
                    ).toFixed(2)
                    : ""
                }
                                </span>

                            </div>

                        </div>


                        <!-- INACTIVO -->
                        ${estaLogueado &&
                    estadoEquipo === "inactivo"
                    ? `
                                <span
                                    style="
                                        color:#ff4d4d;
                                        font-weight:bold;
                                        font-size:.9em;
                                        display:inline-block;
                                        margin-top:2px;
                                    "
                                >
                                    INACTIVO
                                </span>
                            `
                    : ""
                }

                    </div>


                    <!-- ACCIONES -->
                    <div class="product-actions">

                        ${estaLogueado
                    ? `
                                <button
                                    class="btn btn-warning btn-sm w-100"
                                    onclick="editarEquipo(${item.id})"
                                >
                                    Editar
                                </button>
                            `
                    : `
                                <div
                                    class="cantidad-container"
                                    style="
                                        display:flex;
                                        align-items:center;
                                        justify-content:space-between;
                                        margin-bottom:8px;
                                    "
                                >

                                    <span
                                        style="
                                            font-size:13px;
                                            font-weight:600;
                                            color:#555;
                                        "
                                    >
                                        Cantidad:
                                    </span>


                                    <div
                                        style="
                                            display:inline-flex;
                                            align-items:center;
                                            border:1px solid #ced4da;
                                            border-radius:4px;
                                            overflow:hidden;
                                            background:#fff;
                                        "
                                    >

                                        <button
                                            type="button"
                                            class="btn-cantidad"
                                            onclick="cambiarCantidadHTML(${item.id}, -1)"
                                            style="
                                                border:none;
                                                background:#f8f9fa;
                                                width:28px;
                                                height:28px;
                                                cursor:pointer;
                                                font-weight:bold;
                                                color:#333;
                                                padding:0;
                                            "
                                        >
                                            -
                                        </button>


                                        <span
                                            id="cant-display-${item.id}"
                                            style="
                                                min-width:30px;
                                                text-align:center;
                                                font-weight:bold;
                                                font-size:13px;
                                                color:#333;
                                                line-height:28px;
                                            "
                                        >
                                            1
                                        </span>


                                        <button
                                            type="button"
                                            class="btn-cantidad"
                                            onclick="cambiarCantidadHTML(${item.id}, 1)"
                                            style="
                                                border:none;
                                                background:#f8f9fa;
                                                width:28px;
                                                height:28px;
                                                cursor:pointer;
                                                font-weight:bold;
                                                color:#333;
                                                padding:0;
                                            "
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>


                                <button
                                    class="btn btn-primary btn-sm w-100 btn-agregar-carrito"
                                    data-id="${varianteInicial.id}"
                                    data-nombre="${item.marca || "SIN MARCA"} ${item.modelo || ""} - ${varianteInicial.color || ""}"
                                    data-precio="${varianteInicial.precio}"
                                    data-imagenes='${JSON.stringify(imagenesIniciales)}'
                                >
                                    Agregar al carrito
                                </button>
                            `
                }

                    </div>

                </div>
            `;
        });

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

    }
}

async function guardarEquipo() {
    if (imagenesAgregar.length === 0) {
        alert("Selecciona al menos una imagen");
        return;
    }

    let urls = [];
    try {
        for (let img of imagenesAgregar) {
            if (img.startsWith("http")) {
                urls.push(img);
                continue;
            }
            const blob = await fetch(img).then(r => r.blob());
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", "inventario_preset");

            const cloudResponse = await fetch("https://api.cloudinary.com/v1_1/dkxto4ymq/image/upload", {
                method: "POST",
                body: formData
            });
            const cloudData = await cloudResponse.json();
            urls.push(cloudData.secure_url);
        }

        urls = urls.slice(0, 4);

        await fetch("https://mi-proyecto1-2.onrender.com/api/registros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo_Equipo: document.getElementById("tipoEquipo").value,
                color: document.getElementById("color").value,
                marca: document.getElementById("marca").value,
                modelo: document.getElementById("modelo").value,
                codigo_Producto: document.getElementById("codigoProducto").value,
                descripcion: document.getElementById("descripcion").value,
                descripcion1: document.getElementById("descripcion1").value, 
                garantia: document.getElementById("garantia").value,
                precio: parseFloat(document.getElementById("precio").value) || 0,
                precio_Antes: document.getElementById("precioAntes").value !== "" ? parseFloat(document.getElementById("precioAntes").value) : null,
                descuento: document.getElementById("descuento").value !== "" ? parseFloat(document.getElementById("descuento").value) : 0,
                estado: document.getElementById("estado").value,
                url_Equipo: urls[0] || null,
                url1: urls[1] || null,
                url2: urls[2] || null,
                url3: urls[3] || null
            })
        });

        mostrarToast("Equipo guardado correctamente");
        document.getElementById("fileImage").value = "";
        document.getElementById("formNuevoEquipo").reset();
        imagenesAgregar = [];
        document.getElementById("previewContainer").innerHTML = "";
        $('#modalAgregar').modal('hide');
        cargarProductos();
    } catch (error) {
        console.error(error);
        alert("Error al guardar el equipo");
    }
}

let varianteEditandoId = null;
let variantesEquipoEditando = [];


async function editarEquipo(id) {

    try {

        imagenesEditar = [];

        const inputImagenes = document.getElementById("editar_fileImage");
        const preview = document.getElementById("editar_previewContainer");

        if (inputImagenes) inputImagenes.value = "";
        if (preview) preview.innerHTML = "";

        const response = await fetch(
            "https://mi-proyecto1-2.onrender.com/api/registros"
        );

        if (!response.ok) {
            throw new Error("Error al obtener los equipos");
        }

        const data = await response.json();

        const item = data.find(x => x.id === id);

        if (!item) {
            alert("Equipo no encontrado");
            return;
        }

        // ============================================
        // GUARDAR TODAS LAS VARIANTES
        // ============================================

        variantesEquipoEditando =
            item.variantes ||
            item.Variantes ||
            [];

        if (variantesEquipoEditando.length === 0) {
            alert("Este equipo no tiene colores/variantes registrados.");
            return;
        }

        // ============================================
        // DATOS GENERALES DEL EQUIPO
        // ============================================

        document.getElementById("editar_tipoEquipo").value =
            item.tipo_Equipo || "";

        document.getElementById("editar_marca").value =
            item.marca || "";

        document.getElementById("editar_modelo").value =
            item.modelo || "";

        // ============================================
        // SELECT DE COLORES
        // ============================================

        const selectColor =
            document.getElementById("editar_color");

        if (!selectColor) {
            console.error("No existe #editar_color");
            return;
        }

        selectColor.innerHTML =
            '<option value="">Seleccione un color...</option>';

        variantesEquipoEditando.forEach((variante, index) => {

            const option = document.createElement("option");

            // IMPORTANTE:
            // El value es el índice interno de la variante
            option.value = index;

            // Lo que ve el usuario es el nombre del color
            option.textContent =
                variante.color || `Color ${index + 1}`;

            selectColor.appendChild(option);
        });

        // ============================================
        // CAMBIAR COLOR
        // ============================================

        selectColor.onchange = function () {

            const indice = parseInt(this.value);

            if (
                isNaN(indice) ||
                !variantesEquipoEditando[indice]
            ) {
                limpiarDatosVarianteEditar();
                return;
            }

            cargarVarianteEnFormularioEditar(indice);
        };

        // ============================================
        // CARGAR PRIMER COLOR
        // ============================================

        selectColor.value = "0";

        cargarVarianteEnFormularioEditar(0);

        // ============================================
        // BOTÓN ACTUALIZAR
        // ============================================

        const btnActualizar =
            document.getElementById("btnActualizar");

        if (btnActualizar) {
            btnActualizar.onclick = function () {
                actualizarEquipo(varianteEditandoId);
            };
        }

        // ============================================
        // MOSTRAR MODAL
        // ============================================

        $('#modalEditar').modal('show');

    } catch (error) {

        console.error("Error editarEquipo:", error);

        alert("Error al cargar equipo");
    }
}

function cargarVarianteEnFormularioEditar(indice) {

    const variante =
        variantesEquipoEditando[indice];

    if (!variante) {
        console.error(
            "Variante no encontrada:",
            indice
        );
        return;
    }


    // ============================================
    // GUARDAR ID REAL DE LA VARIANTE
    // ============================================

    varianteEditandoId = variante.id;

    // ============================================
    // COLOR
    // ============================================

    const selectColor =
        document.getElementById("editar_color");

    if (selectColor) {
        selectColor.value = indice;
    }

    // ============================================
    // CÓDIGO
    // ============================================

    const codigo =
        document.getElementById("editar_codigoProducto");

    if (codigo) {
        codigo.value =
            variante.codigo_Producto || "";
    }

    // ============================================
    // DESCRIPCIÓN CORTA
    // ============================================

    const descripcion =
        document.getElementById("editar_descripcion");

    if (descripcion) {
        descripcion.value =
            variante.descripcion || "";
    }

    // ============================================
    // DESCRIPCIÓN DETALLADA
    // ============================================

    const descripcion1 =
        document.getElementById("editar_descripcion1");

    if (descripcion1) {
        descripcion1.value =
            variante.descripcion1 || "";
    }

    // ============================================
    // GARANTÍA
    // ============================================

    const garantia =
        document.getElementById("editar_garantia");

    if (garantia) {
        garantia.value =
            variante.garantia || "";
    }

    // ============================================
    // PRECIO
    // ============================================

    const precio =
        document.getElementById("editar_precio");

    if (precio) {
        precio.value =
            variante.precio ?? "";
    }

    // ============================================
    // PRECIO ANTES
    // ============================================

    const precioAntes =
        document.getElementById("editar_precioAntes");

    if (precioAntes) {
        precioAntes.value =
            variante.precio_Antes ?? "";
    }

    // ============================================
    // DESCUENTO
    // ============================================

    const descuento =
        document.getElementById("editar_descuento");

    if (descuento) {
        descuento.value =
            variante.descuento ?? "";
    }

    // ============================================
    // ESTADO
    // ============================================

    const estado =
        document.getElementById("editar_estado");

    if (estado) {
        estado.value =
            variante.estado || "";
    }

    // ============================================
    // IMÁGENES DE ESTA VARIANTE
    // ============================================

    imagenesEditar = [
        variante.url_Equipo,
        variante.url1,
        variante.url2,
        variante.url3
    ].filter(Boolean);

    renderPreview(
        "editar_previewContainer",
        imagenesEditar
    );

    // ============================================
    // RECALCULAR PRECIO
    // ============================================

    calcularPrecioEditar();

}

function calcularPrecioEditar() {

    const precioAntesInput =
        document.getElementById("editar_precioAntes");

    const descuentoInput =
        document.getElementById("editar_descuento");

    const precioInput =
        document.getElementById("editar_precio");

    if (
        !precioAntesInput ||
        !descuentoInput ||
        !precioInput
    ) {
        return;
    }

    const precioAntes =
        parseFloat(precioAntesInput.value) || 0;

    const descuento =
        parseFloat(descuentoInput.value) || 0;

    if (
        precioAntes > 0 &&
        descuento > 0
    ) {

        const precioCalculado =
            precioAntes -
            (
                precioAntes *
                descuento /
                100
            );

        precioInput.value =
            precioCalculado.toFixed(2);

    } else {

        precioInput.value =
            precioAntes > 0
                ? precioAntes.toFixed(2)
                : "";
    }
}

function limpiarDatosVarianteEditar() {

    varianteEditandoId = null;

    document.getElementById(
        "editar_codigoProducto"
    ).value = "";

    document.getElementById(
        "editar_descripcion"
    ).value = "";

    document.getElementById(
        "editar_descripcion1"
    ).value = "";

    document.getElementById(
        "editar_garantia"
    ).value = "";

    document.getElementById(
        "editar_precio"
    ).value = "";

    document.getElementById(
        "editar_precioAntes"
    ).value = "";

    document.getElementById(
        "editar_descuento"
    ).value = "";

    document.getElementById(
        "editar_estado"
    ).value = "";

    imagenesEditar = [];

    renderPreview(
        "editar_previewContainer",
        imagenesEditar
    );
}

async function actualizarEquipo(id) {

    const varianteActual =
        variantesEquipoEditando.find(
            v => v.id === id
        );

    if (!varianteActual) {
        alert("No se encontró la variante que se está editando.");
        return;
    }

    try {
        let urls = [];
        for (let img of imagenesEditar) {
            if (!img.startsWith("http")) {
                const blob = await fetch(img).then(r => r.blob());
                const formData = new FormData();
                formData.append("file", blob);
                formData.append("upload_preset", "inventario_preset");

                const cloudResponse = await fetch("https://api.cloudinary.com/v1_1/dkxto4ymq/image/upload", {
                    method: "POST",
                    body: formData
                });
                const cloudData = await cloudResponse.json();
                if (!cloudData.secure_url) continue;
                urls.push(cloudData.secure_url);
            } else {
                urls.push(img);
            }
        }

        const cleanUrls = ["", "", "", ""];
        for (let i = 0; i < 4; i++) {
            cleanUrls[i] = urls[i] ?? "";
        }

        const body = {
            tipo_Equipo: document.getElementById("editar_tipoEquipo").value,
            color: varianteActual.color || "",
            marca: document.getElementById("editar_marca").value,
            modelo: document.getElementById("editar_modelo").value,
            codigo_Producto: document.getElementById("editar_codigoProducto").value,
            descripcion: document.getElementById("editar_descripcion").value,
            descripcion1: document.getElementById("editar_descripcion1").value,
            garantia: document.getElementById("editar_garantia").value,
            precio: parseFloat(document.getElementById("editar_precio").value) || 0,
            precio_Antes: document.getElementById("editar_precioAntes").value !== "" ? parseFloat(document.getElementById("editar_precioAntes").value) : null,
            descuento: document.getElementById("editar_descuento").value !== "" ? parseFloat(document.getElementById("editar_descuento").value) : 0,
            estado: document.getElementById("editar_estado").value,
            url_Equipo: cleanUrls[0],
            url1: cleanUrls[1],
            url2: cleanUrls[2],
            url3: cleanUrls[3]
        };

        const response = await fetch(`https://mi-proyecto1-2.onrender.com/api/EditarEquipos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            alert("Error al actualizar");
            return;
        }

        mostrarToast("Equipo actualizado correctamente");
        $('#modalEditar').modal('hide');
        cargarProductos();
    } catch (error) {
        console.error("Error actualizarEquipo:", error);
        alert("Error inesperado");
    }
}

document.getElementById("modalAgregar").addEventListener("show.bs.modal", function () {
    const btn = document.querySelector("#modalAgregar .btn-primary");
    if (btn && btn.innerText === "Guardar Equipo") {
        imagenesAgregar = [];
        document.getElementById("previewContainer").innerHTML = "";
    }
});


let imagenesActualesZoom = [];
let indiceActualZoom = 0;

function abrirZoom(item) {

    if (!item) return;

    // =====================================================
    // CANTIDAD
    // =====================================================

    cantidadActualZoom = 1;

    const displayZoom =
        document.getElementById("cant-display-zoom");

    if (displayZoom) {
        displayZoom.innerText = cantidadActualZoom;
    }


    // =====================================================
    // INFORMACIÓN DEL PRODUCTO
    // =====================================================

    const titulo =
        document.getElementById("zoom-titulo-producto");

    if (titulo) {
        titulo.innerText =
            `${item.marca || ""} ${item.modelo || ""}`;
    }

    const tipoBadge =
        document.getElementById("zoom-tipo-badge");

    if (tipoBadge) {
        tipoBadge.innerText =
            item.tipo_Equipo || "Producto";
    }

    const marca =
        document.getElementById("zoom-marca");

    if (marca) {
        marca.innerText =
            item.marca || "SIN MARCA";
    }

    const modeloDesc =
        document.getElementById("zoom-modelo-desc");

    if (modeloDesc) {
        modeloDesc.innerText =
            `${item.modelo || ""}${item.descripcion
                ? " - " + item.descripcion
                : ""
            }`;
    }

    const codigo =
        document.getElementById("zoom-codigo");

    if (codigo) {
        codigo.innerText =
            item.codigo_Producto || "N/A";
    }


    // =====================================================
    // GARANTÍA
    // =====================================================

    const contenedorGarantia =
        document.getElementById(
            "zoom-garantia-container"
        );

    const spanGarantia =
        document.getElementById(
            "zoom-garantia"
        );

    if (
        item.garantia &&
        item.garantia.toString().trim() !== ""
    ) {

        if (spanGarantia) {
            spanGarantia.innerText =
                item.garantia;
        }

        if (contenedorGarantia) {
            contenedorGarantia.style.display =
                "flex";
        }

    } else {

        if (contenedorGarantia) {
            contenedorGarantia.style.display =
                "none";
        }
    }


    // =====================================================
    // CARACTERÍSTICAS
    // =====================================================

    const txtCaracteristicas =
        document.getElementById(
            "zoom-caracteristicas-texto"
        );

    if (txtCaracteristicas) {

        txtCaracteristicas.innerText =
            item.descripcion1 ||
            "No hay características detalladas adicionales disponibles para este equipo.";
    }


    // =====================================================
    // PRECIOS
    // =====================================================

    const precioActual =
        document.getElementById(
            "zoom-precio-actual"
        );

    if (precioActual) {

        precioActual.innerText =
            `S/. ${parseFloat(
                item.precio || 0
            ).toFixed(2)}`;
    }


    const descuentoBadge =
        document.getElementById(
            "zoom-descuento-badge"
        );

    const precioAntesCont =
        document.getElementById(
            "zoom-precio-antes-container"
        );

    const precioAntesText =
        document.getElementById(
            "zoom-precio-antes"
        );


    const descuento =
        parseFloat(item.descuento || 0);

    if (descuento > 0) {

        if (descuentoBadge) {

            descuentoBadge.innerText =
                `-${descuento}%`;

            descuentoBadge.style.display =
                "inline-flex";
        }

        if (
            precioAntesText &&
            precioAntesCont &&
            item.precio_Antes
        ) {

            precioAntesText.innerText =
                `S/. ${parseFloat(
                    item.precio_Antes
                ).toFixed(2)}`;

            precioAntesCont.style.display =
                "block";

        } else if (precioAntesCont) {

            precioAntesCont.style.display =
                "none";
        }

    } else {

        if (descuentoBadge) {
            descuentoBadge.style.display =
                "none";
        }

        if (precioAntesCont) {
            precioAntesCont.style.display =
                "none";
        }
    }


    // =====================================================
    // OBTENER IMÁGENES
    // =====================================================

    imagenesActualesZoom = [
        item.url_Equipo,
        item.url1,
        item.url2,
        item.url3
    ].filter(Boolean);


    if (imagenesActualesZoom.length === 0) {
        console.warn(
            "El producto no tiene imágenes."
        );
        return;
    }


    // =====================================================
    // ⭐ DETERMINAR LA IMAGEN QUE SELECCIONÓ EL USUARIO
    // =====================================================

    let indiceInicial = 0;


    // Primero intentamos usar la URL exacta
    if (
        item.imagenSeleccionada &&
        imagenesActualesZoom.includes(
            item.imagenSeleccionada
        )
    ) {

        indiceInicial =
            imagenesActualesZoom.indexOf(
                item.imagenSeleccionada
            );

    }

    // Si no existe URL, usamos el índice
    else if (
        item.indiceImagenSeleccionada !== undefined &&
        item.indiceImagenSeleccionada !== null
    ) {

        indiceInicial =
            parseInt(
                item.indiceImagenSeleccionada
            ) || 0;
    }


    // =====================================================
    // SEGURIDAD
    // =====================================================

    if (
        indiceInicial < 0 ||
        indiceInicial >= imagenesActualesZoom.length
    ) {
        indiceInicial = 0;
    }


    // =====================================================
    // ⭐ GUARDAR ÍNDICE CORRECTO
    // =====================================================

    indiceActualZoom = indiceInicial;





    // =====================================================
    // MOSTRAR IMAGEN PRINCIPAL DEL MODAL
    // =====================================================

    const imgPrincipal =
        document.getElementById(
            "zoom-imagen-principal"
        );

    if (imgPrincipal) {

        imgPrincipal.src =
            imagenesActualesZoom[
            indiceActualZoom
            ];

        imgPrincipal.style.cursor = "zoom-in";

        imgPrincipal.onclick = function () {

            abrirImagenGrandeZoom(
                imagenesActualesZoom[indiceActualZoom],
                imagenesActualesZoom,
                indiceActualZoom
            );

        };
    }


    // =====================================================
    // FLECHAS
    // =====================================================

    const prevBtn =
        document.getElementById(
            "zoom-prev-btn"
        );

    const nextBtn =
        document.getElementById(
            "zoom-next-btn"
        );

    if (prevBtn && nextBtn) {

        const mostrarFlechas =
            imagenesActualesZoom.length > 1
                ? "flex"
                : "none";

        prevBtn.style.display =
            mostrarFlechas;

        nextBtn.style.display =
            mostrarFlechas;
    }


    // =====================================================
    // MINIATURAS DEL ZOOM
    // =====================================================

    const contenedorMiniaturas =
        document.getElementById(
            "zoom-galeria-miniaturas"
        );

    if (contenedorMiniaturas) {

        contenedorMiniaturas.innerHTML = "";

        imagenesActualesZoom.forEach(
            (url, index) => {

                const thumb =
                    document.createElement("img");

                thumb.src = url;

                thumb.id =
                    `zoom-thumb-${index}`;

                thumb.style.cssText = `
                    width:45px;
                    height:45px;
                    object-fit:cover;
                    border-radius:4px;
                    border:1px solid #ddd;
                    cursor:pointer;
                    transition:all .2s;
                `;


                // ⭐ MARCAR LA IMAGEN CORRECTA
                if (
                    index === indiceActualZoom
                ) {

                    thumb.style.borderColor =
                        "#007bff";

                    thumb.style.boxShadow =
                        "0 0 4px rgba(0,123,255,.5)";
                }


                thumb.onclick =
                    function () {

                        seleccionarImagenZoom(
                            index
                        );
                    };


                contenedorMiniaturas.appendChild(
                    thumb
                );
            }
        );
    }


    // =====================================================
    // BOTÓN AGREGAR AL CARRITO
    // =====================================================

    const btnAgregar =
        document.getElementById(
            "zoom-btn-agregar"
        );

    if (btnAgregar) {

        btnAgregar.setAttribute(
            "data-id",
            item.id
        );

        btnAgregar.setAttribute(
            "data-nombre",
            `${item.marca || "SIN MARCA"} ${item.modelo || ""} - ${item.color || ""}`
        );

        btnAgregar.setAttribute(
            "data-precio",
            item.precio || 0
        );

        btnAgregar.setAttribute(
            "data-imagenes",
            JSON.stringify(
                imagenesActualesZoom
            )
        );
    }


    // =====================================================
    // COLORES / VARIANTES
    // =====================================================

    const contenedorColores =
        document.getElementById(
            "zoom-lista-colores"
        );

    const contenedorPadreColores =
        document.getElementById(
            "zoom-color-container"
        );


    if (
        contenedorColores &&
        contenedorPadreColores
    ) {

        contenedorColores.innerHTML = "";

        const variantes =
            item.variantes ||
            item.Variantes ||
            [];


        if (variantes.length > 0) {

            contenedorPadreColores.style.display =
                "block";


            variantes.forEach(
                (variante, index) => {

                    const colorNombre =
                        variante.color ||
                        "Sin color";


                    const btnColor =
                        document.createElement(
                            "button"
                        );

                    btnColor.type =
                        "button";

                    btnColor.style.width =
                        "26px";

                    btnColor.style.height =
                        "26px";

                    btnColor.style.borderRadius =
                        "50%";

                    btnColor.style.padding =
                        "0";

                    btnColor.style.cursor =
                        "pointer";

                    btnColor.style.backgroundColor =
                        obtenerColorCSS(
                            colorNombre
                        );

                    btnColor.title =
                        `${colorNombre} - ${variante.codigo_Producto || ""}`;


                    const varianteActual =
                        item.varianteSeleccionadaIndex ??
                        0;


                    if (
                        index === varianteActual
                    ) {

                        btnColor.style.border =
                            "2px solid #fff";

                        btnColor.style.boxShadow =
                            "0 0 0 2px #8a2be2";

                    } else {

                        btnColor.style.border =
                            "1px solid #ccc";

                        btnColor.style.boxShadow =
                            "none";
                    }


                    btnColor.onclick =
                        function () {

                            const nuevaVariante =
                                variantes[index];

                            if (!nuevaVariante)
                                return;


                            // Actualizar información
                            item.varianteSeleccionadaIndex =
                                index;

                            item.id =
                                nuevaVariante.id;

                            item.color =
                                nuevaVariante.color;

                            item.precio =
                                nuevaVariante.precio;

                            item.precio_Antes =
                                nuevaVariante.precio_Antes;

                            item.descuento =
                                nuevaVariante.descuento;

                            item.estado =
                                nuevaVariante.estado;

                            item.descripcion =
                                nuevaVariante.descripcion;

                            item.descripcion1 =
                                nuevaVariante.descripcion1;

                            item.garantia =
                                nuevaVariante.garantia;

                            item.codigo_Producto =
                                nuevaVariante.codigo_Producto;

                            item.url_Equipo =
                                nuevaVariante.url_Equipo;

                            item.url1 =
                                nuevaVariante.url1;

                            item.url2 =
                                nuevaVariante.url2;

                            item.url3 =
                                nuevaVariante.url3;


                            // Al cambiar de variante,
                            // empezamos por la primera imagen
                            imagenesActualesZoom = [
                                nuevaVariante.url_Equipo,
                                nuevaVariante.url1,
                                nuevaVariante.url2,
                                nuevaVariante.url3
                            ].filter(Boolean);

                            indiceActualZoom = 0;


                            // Imagen principal
                            if (imgPrincipal) {

                                imgPrincipal.src =
                                    imagenesActualesZoom[0];

                                imgPrincipal.style.cursor =
                                    "zoom-in";

                                imgPrincipal.onclick = function () {

                                    abrirImagenGrandeZoom(
                                        imagenesActualesZoom[
                                        indiceActualZoom
                                        ],
                                        imagenesActualesZoom,
                                        indiceActualZoom
                                    );

                                };
                            }


                            // Actualizar miniaturas
                            if (contenedorMiniaturas) {

                                contenedorMiniaturas.innerHTML =
                                    "";

                                imagenesActualesZoom.forEach(
                                    (url, imgIndex) => {

                                        const thumb =
                                            document.createElement(
                                                "img"
                                            );

                                        thumb.src =
                                            url;

                                        thumb.id =
                                            `zoom-thumb-${imgIndex}`;

                                        thumb.style.cssText = `
                                            width:45px;
                                            height:45px;
                                            object-fit:cover;
                                            border-radius:4px;
                                            border:1px solid #ddd;
                                            cursor:pointer;
                                        `;

                                        if (
                                            imgIndex === 0
                                        ) {

                                            thumb.style.borderColor =
                                                "#007bff";

                                            thumb.style.boxShadow =
                                                "0 0 4px rgba(0,123,255,.5)";
                                        }

                                        thumb.onclick =
                                            function () {

                                                seleccionarImagenZoom(
                                                    imgIndex
                                                );
                                            };

                                        contenedorMiniaturas.appendChild(
                                            thumb
                                        );
                                    }
                                );
                            }


                            // Actualizar datos visuales
                            const zoomModeloDesc =
                                document.getElementById(
                                    "zoom-modelo-desc"
                                );

                            if (zoomModeloDesc) {

                                zoomModeloDesc.innerText =
                                    `${item.modelo || ""}${nuevaVariante.descripcion
                                        ? " - " +
                                        nuevaVariante.descripcion
                                        : ""
                                    }`;
                            }


                            const zoomCodigo =
                                document.getElementById(
                                    "zoom-codigo"
                                );

                            if (zoomCodigo) {

                                zoomCodigo.innerText =
                                    nuevaVariante.codigo_Producto ||
                                    "N/A";
                            }


                            const zoomPrecio =
                                document.getElementById(
                                    "zoom-precio-actual"
                                );

                            if (zoomPrecio) {

                                zoomPrecio.innerText =
                                    `S/. ${parseFloat(
                                        nuevaVariante.precio || 0
                                    ).toFixed(2)}`;
                            }


                            // Actualizar colores activos
                            contenedorColores
                                .querySelectorAll("button")
                                .forEach(btn => {

                                    btn.style.border =
                                        "1px solid #ccc";

                                    btn.style.boxShadow =
                                        "none";
                                });


                            this.style.border =
                                "2px solid #fff";

                            this.style.boxShadow =
                                "0 0 0 2px #8a2be2";
                        };


                    contenedorColores.appendChild(
                        btnColor
                    );
                }
            );

        } else {

            contenedorPadreColores.style.display =
                "none";
        }
    }


    // =====================================================
    // MOSTRAR MODAL
    // =====================================================

    setTimeout(() => {
        $('#modalZoom').modal('show');
    }, 100);
}


function seleccionarImagenZoom(index) {
    if (index < 0 || index >= imagenesActualesZoom.length) return;

    indiceActualZoom = index;
    const url = imagenesActualesZoom[indiceActualZoom];

    const imgPrincipal = document.getElementById("zoom-imagen-principal");
    if (imgPrincipal) imgPrincipal.src = url;

    const contenedorMiniaturas = document.getElementById("zoom-galeria-miniaturas");
    if (contenedorMiniaturas) {
        Array.from(contenedorMiniaturas.children).forEach(child => {
            child.style.borderColor = "#ddd";
            child.style.boxShadow = "none";
        });
    }

    const thumbActiva = document.getElementById(`zoom-thumb-${index}`);
    if (thumbActiva) {
        thumbActiva.style.borderColor = "#007bff";
        thumbActiva.style.boxShadow = "0 0 4px rgba(0,123,255,0.5)";
        thumbActiva.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); 
    }
}

function navegarImagenZoom(direccion) {
    if (imagenesActualesZoom.length <= 1) return;

    let nuevoIndice = indiceActualZoom + direccion;


    if (nuevoIndice >= imagenesActualesZoom.length) {
        nuevoIndice = 0;
    } else if (nuevoIndice < 0) {
        nuevoIndice = imagenesActualesZoom.length - 1;
    }

    seleccionarImagenZoom(nuevoIndice);
}

function cambiarCantidadZoom(delta) {
    cantidadActualZoom += delta;
    if (cantidadActualZoom < 1) cantidadActualZoom = 1;
    const displayZoom = document.getElementById("cant-display-zoom");
    if (displayZoom) displayZoom.innerText = cantidadActualZoom;
}

function mostrarToast(mensaje, color = "#28a745") {
    const toast = document.getElementById("toastMensaje");
    if (toast) {
        toast.innerText = mensaje;
        toast.style.background = color;
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 2000);
    }
}

function renderPreview(containerId, imagenes) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    imagenes.forEach((url, index) => {
        const div = document.createElement("div");
        div.style.position = "relative";
        div.style.display = "inline-block";
        div.style.margin = "5px";
        div.draggable = true;

        div.addEventListener("dragstart", () => { indiceArrastrado = index; });
        div.addEventListener("dragover", (e) => { e.preventDefault(); });
        div.addEventListener("drop", (e) => {
            e.preventDefault();
            if (indiceArrastrado === null || indiceArrastrado === index) return;
            [imagenes[indiceArrastrado], imagenes[index]] = [imagenes[index], imagenes[indiceArrastrado]];
            renderPreview(containerId, imagenes);
            indiceArrastrado = null;
        });

        div.innerHTML = `
            <img src="${url}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; border:1px solid #ddd; cursor:move;" />
            <button type="button" style="position:absolute; top:-8px; right:-8px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:12px; cursor:pointer;">×</button>
        `;

        div.querySelector("button").onclick = () => {
            imagenes.splice(index, 1);
            renderPreview(containerId, imagenes);
        };
        container.appendChild(div);
    });
}


let carrito = JSON.parse(localStorage.getItem("carrito_fractalica")) || [];

function cambiarCantidadHTML(id, delta) {
    const display = document.getElementById(`cant-display-${id}`);
    if (display) {
        let current = parseInt(display.innerText) || 1;
        current += delta;
        if (current < 1) current = 1;
        display.innerText = current;
    }
}

function agregarAlCarritoDirecto(id, nombre, precio, urlsArray, cantidadAAgregar = 1) {
    const imagenesValidas = urlsArray.filter(url => url && url.trim() !== '');
    const existe = carrito.find(prod => prod.id === id);

    if (existe) {
        existe.cantidad += cantidadAAgregar;
        if (!existe.imagenes || existe.imagenes.length === 0) {
            existe.imagenes = imagenesValidas;
        }
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: parseFloat(precio),
            cantidad: cantidadAAgregar,
            imagenes: imagenesValidas
        });
    }

    guardarYActualizarCarrito();
    mostrarToast("¡Producto añadido al carrito!", "#007bff");
}

function agregarAlCarrito(id, nombre, precio) {
    agregarAlCarritoDirecto(id, nombre, precio, [], 1);
}

function guardarYActualizarCarrito() {
    localStorage.setItem("carrito_fractalica", JSON.stringify(carrito));
    actualizarBadgeYDropdown();
}

function actualizarBadgeYDropdown() {
    const badge = document.getElementById("cart-badge");
    const container = document.getElementById("carrito-items");
    const totalSpan = document.getElementById("carrito-total");

    const containerModal = document.getElementById("carrito-items-modal");
    const totalSpanModal = document.getElementById("carrito-total-modal");

    const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    if (badge) {
        if (totalCantidad > 0) {
            badge.innerText = totalCantidad;
            badge.style.display = "block";
        } else {
            badge.style.display = "none";
        }
    }

    if (totalSpan) {
        totalSpan.innerText = `S/. ${totalPrecio.toFixed(2)}`;
    }
    const cantSpan = document.getElementById("carrito-cantidad-total");
    if (cantSpan) {
        cantSpan.innerText = `${totalCantidad} ${totalCantidad === 1 ? 'producto' : 'productos'}`;
    }

    if (totalSpanModal) {
        totalSpanModal.innerText = `S/. ${totalPrecio.toFixed(2)}`;
    }
    const cantSpanModal = document.getElementById("carrito-cantidad-total-modal");
    if (cantSpanModal) {
        cantSpanModal.innerText = `${totalCantidad} ${totalCantidad === 1 ? 'producto' : 'productos'}`;
    }

    const generarHTMLItem = (item, esModal = false) => {

        const imagenUrl = (item.imagenes && item.imagenes.length > 0) ? item.imagenes[0] : 'https://images.placeholders.dev/?width=150&height=150&text=Sin+Imagen&bgColor=%23f0f0f0';

        const clickZoomAction = esModal
            ? `onclick="abrirZoomDesdeCarrito(${item.id})"`
            : `onclick="abrirZoomDesdeCarrito(${item.id}); event.stopPropagation();"`;

        const stopProp = !esModal ? 'event.stopPropagation();' : '';

        const subtotalItem = item.precio * item.cantidad;

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 10px;">
                
                <div style="display: flex; align-items: center; gap: 10px; max-width: 55%; cursor: pointer;" ${clickZoomAction}>
                    <img src="${imagenUrl}" 
                         style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;" 
                         onerror="this.onerror=null; this.src='https://images.placeholders.dev/?width=45&height=45&text=Error';" />
                    <div style="overflow: hidden; line-height: 1.3;">
                        <strong style="display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0056b3;">${item.nombre}</strong>
                        
                        <span style="font-size: 11px; color: #666; display: block;">P/U: S/. ${item.precio.toFixed(2)}</span>
                        <strong style="font-size: 12px; color: #28a745; display: block;">Total: S/. ${subtotalItem.toFixed(2)}</strong>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                    
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <span style="font-size: 10px; color: #777; font-weight: bold; text-transform: uppercase;">Cant.</span>
                        
                        <div style="display: inline-flex; align-items: center; border: 1px solid #ced4da; border-radius: 4px; overflow: hidden; background: #fff; height: 26px;">
                            <button onclick="cambiarCantidadCarrito(${item.id}, -1); ${stopProp}" 
                                    style="border: none; background: #f8f9fa; width: 22px; height: 100%; cursor: pointer; font-weight: bold; font-size: 11px; color: #333; padding: 0;">
                                -
                            </button>
                            <span style="min-width: 24px; text-align: center; font-weight: bold; font-size: 12px; color: #333; line-height: 24px;">
                                ${item.cantidad}
                            </span>
                            <button onclick="cambiarCantidadCarrito(${item.id}, 1); ${stopProp}" 
                                    style="border: none; background: #f8f9fa; width: 22px; height: 100%; cursor: pointer; font-weight: bold; font-size: 11px; color: #333; padding: 0;">
                                +
                            </button>
                        </div>
                    </div>

                    <button onclick="eliminarDelCarrito(${item.id}); ${stopProp}" 
                            style="border: none; background: #ff4d4d; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; font-weight: bold; padding: 0; margin-top: 12px;">
                        &times;
                    </button>
                </div>

            </div>
        `;
    };

    // Actualizar Dropdown HTML
    if (container) {
        if (carrito.length === 0) {
            container.innerHTML = `<p style="color: #888; text-align: center; margin: 15px 0;">El carrito está vacío.</p>`;
        } else {
            container.innerHTML = carrito.map(item => generarHTMLItem(item, false)).join('');
        }
    }

    // Actualizar Modal del Carrito HTML (Ubicado en el Layout)
    if (containerModal) {
        if (carrito.length === 0) {
            containerModal.innerHTML = `<p style="color: #888; text-align: center; margin: 30px 0;">Tu carrito está vacío actualmente.</p>`;
        } else {
            containerModal.innerHTML = carrito.map(item => generarHTMLItem(item, true)).join('');
        }
    }

    if (totalSpan) {
        totalSpan.innerText = `S/. ${totalPrecio.toFixed(2)}`;
    }
    if (totalSpanModal) {
        totalSpanModal.innerText = `S/. ${totalPrecio.toFixed(2)}`;
    }
}

function abrirZoomDesdeCarrito(id) {

    const itemCarrito = carrito.find(prod => prod.id === id);

    if (!itemCarrito) {
        mostrarToast(
            "No se encontró el producto en el carrito.",
            "#ff4d4d"
        );
        return;
    }

    // =====================================================
    // BUSCAR LA VARIANTE COMPLETA EN LOS PRODUCTOS CARGADOS
    // =====================================================

    let productoCompleto = null;
    let varianteEncontrada = null;
    let varianteIndex = 0;

    if (window.productosAgrupados) {

        for (const producto of window.productosAgrupados) {

            const variantes =
                producto.variantes ||
                producto.Variantes ||
                [];

            const index = variantes.findIndex(
                variante => variante.id === id
            );

            if (index !== -1) {

                productoCompleto = producto;
                varianteEncontrada = variantes[index];
                varianteIndex = index;

                break;
            }
        }
    }

    // =====================================================
    // SI ENCONTRAMOS EL PRODUCTO COMPLETO
    // =====================================================

    if (productoCompleto && varianteEncontrada) {

        const itemZoom = {

            ...productoCompleto,

            // Datos de la variante seleccionada
            id: varianteEncontrada.id,

            color: varianteEncontrada.color,

            precio: varianteEncontrada.precio,

            precio_Antes:
                varianteEncontrada.precio_Antes,

            descuento:
                varianteEncontrada.descuento,

            estado:
                varianteEncontrada.estado,

            descripcion:
                varianteEncontrada.descripcion,

            descripcion1:
                varianteEncontrada.descripcion1,

            garantia:
                varianteEncontrada.garantia,

            codigo_Producto:
                varianteEncontrada.codigo_Producto ||
                productoCompleto.codigo_Producto,

            url_Equipo:
                varianteEncontrada.url_Equipo,

            url1:
                varianteEncontrada.url1,

            url2:
                varianteEncontrada.url2,

            url3:
                varianteEncontrada.url3,

            // IMPORTANTE
            variantes:
                productoCompleto.variantes ||
                productoCompleto.Variantes ||
                [],

            varianteSeleccionadaIndex:
                varianteIndex
        };


        // =================================================
        // CERRAR CARRITO
        // =================================================

        $('#modalCarrito').modal('hide');


        // =================================================
        // ABRIR EL ZOOM COMPLETO
        // =================================================

        setTimeout(() => {

            abrirZoom(itemZoom);

        }, 300);

        return;
    }


    // =====================================================
    // FALLBACK
    // =====================================================
    // Si por alguna razón productosAgrupados todavía
    // no contiene el producto, mostramos al menos
    // la información básica del carrito.

    if (itemCarrito.imagenes &&
        itemCarrito.imagenes.length > 0) {

        $('#modalCarrito').modal('hide');

        setTimeout(() => {

            const itemFallback = {

                id: itemCarrito.id,

                nombre: itemCarrito.nombre,

                marca: itemCarrito.nombre,

                modelo: "",

                precio: itemCarrito.precio,

                url_Equipo:
                    itemCarrito.imagenes[0],

                url1:
                    itemCarrito.imagenes[1],

                url2:
                    itemCarrito.imagenes[2],

                url3:
                    itemCarrito.imagenes[3],

                variantes: []

            };

            abrirZoom(itemFallback);

        }, 300);

    } else {

        mostrarToast(
            "Este producto no contiene imágenes para visualizar.",
            "#ff4d4d"
        );
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Eliminar un elemento del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarYActualizarCarrito();
}

// Mostrar/Ocultar el dropdown del carrito
function toggleCarritoMenu() {
    const dropdown = document.getElementById("carrito-dropdown");
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    }
}

// Cerrar el carrito si se hace clic afuera de él
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("carrito-dropdown");
    const cartButton = event.target.closest("button");

    if (dropdown && dropdown.style.display === "block") {
        // Si no se hizo clic dentro del dropdown ni en el botón del carrito
        if (!dropdown.contains(event.target) && (!cartButton || !cartButton.onclick.toString().includes("toggleCarritoMenu"))) {
            dropdown.style.display = "none";
        }
    }
});

// Inicializar el renderizado al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarBadgeYDropdown();
});

// Función para abrir el modal del carrito (Bootstrap 4 / jQuery)
function abrirModalCarrito() {
    $('#modalCarrito').modal('show');
}


///////////////////////////////////////////



// Modificar la cantidad directamente de un producto ya agregado al carrito
function cambiarCantidadCarrito(id, delta) {
    const item = carrito.find(prod => prod.id === id);
    if (item) {
        item.cantidad += delta;

        // Si la cantidad baja de 1, puedes decidir si dejarla en 1 o eliminar el producto.
        // En este caso lo dejamos en mínimo 1 (el usuario usa la "X" para eliminar).
        if (item.cantidad < 1) {
            item.cantidad = 1;
        }

        guardarYActualizarCarrito();
    }
}


// Abre el modal de Checkout, traspasando el monto final y cerrando el carrito
function abrirCheckout() {
    if (carrito.length === 0) {
        mostrarToast("Tu carrito está vacío.", "#ff4d4d");
        return;
    }

    // Calcular monto final actual
    const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    document.getElementById("chkMontoFinal").innerText = `S/. ${totalPrecio.toFixed(2)}`;

    // Cerrar modal del carrito y abrir el checkout usando jQuery (Bootstrap 4)
    $('#modalCarrito').modal('hide');

    // Un pequeño delay para evitar conflictos de animación de modals
    setTimeout(() => {
        $('#modalCheckout').modal('show');
    }, 300);
}

// Acción al enviar el formulario del checkout
function procesarCompra(event) {
    event.preventDefault(); // Evita que recargue la página

    // Capturar datos del cliente
    const datosCliente = {
        nombres: document.getElementById("chkNombres").value,
        apellidos: document.getElementById("chkApellidos").value,
        dni: document.getElementById("chkDni").value,
        celular: document.getElementById("chkCelular").value,
        correo: document.getElementById("chkCorreo").value,
        region: document.getElementById("chkRegion").value,
        provincia: document.getElementById("chkProvincia").value,
        distrito: document.getElementById("chkDistrito").value,
        direccion: document.getElementById("chkDireccion").value
    };

    // Resumen de productos comprados
    const resumenPedido = {
        cliente: datosCliente,
        productos: carrito,
        total_pagado: carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    };


    // TODO: Aquí puedes hacer un fetch() a tu API de Render para guardar el pedido en tu base de datos si cuentas con un endpoint.

    // Simulación de éxito
    mostrarToast("¡Compra registrada con éxito!", "#28a745");

    // Limpiamos el carrito del sistema
    carrito = [];
    guardarYActualizarCarrito();

    // Resetear formulario y cerrar modal
    document.getElementById("formCheckout").reset();
    $('#modalCheckout').modal('hide');
}



// Estructura de datos para Región -> Provincia -> Distrito (puedes ampliarla)
const ubigeoPeru = {
    "Lima": {
        "Lima": [
            "Miraflores", "San Isidro", "Santiago de Surco", "La Molina",
            "San Borja", "Lince", "Jesús María", "Magdalena del Mar",
            "San Miguel", "Barranco", "Chorrillos", "Ate", "Santa Anita",
            "La Victoria", "Breña", "Lima (Cercado)", "Los Olivos",
            "San Martín de Porres", "Comas", "Villa María del Triunfo", "Villa El Salvador"
        ],
        "Cañete": ["San Vicente de Cañete", "Imperial", "Mala", "Asia", "Chilca"],
        "Huaral": ["Huaral", "Chancay"]
    },
    "Ayacucho": {
        "Huamanga": ["Ayacucho", "San Juan Bautista", "Carmen Alto", "Magdalena"],
        "VilcasHuamán": ["VilcasHuamán", "Vischongo"]
    }
};

// Inicializar selectores cuando el documento esté listo
document.addEventListener("DOMContentLoaded", function () {
    const selectRegion = document.getElementById("chkRegion");
    const selectProvincia = document.getElementById("chkProvincia");
    const selectDistrito = document.getElementById("chkDistrito");

    if (!selectRegion || !selectProvincia || !selectDistrito) return;

    // 1. Cargar Regiones
    for (const region in ubigeoPeru) {
        let opt = document.createElement("option");
        opt.value = region;
        opt.textContent = region;
        selectRegion.appendChild(opt);
    }

    // 2. Evento al cambiar Región
    selectRegion.addEventListener("change", function () {
        const regionSel = this.value;

        // Limpiar y deshabilitar provincia y distrito
        selectProvincia.innerHTML = '<option value="">Seleccione...</option>';
        selectProvincia.disabled = true;
        selectDistrito.innerHTML = '<option value="">Seleccione...</option>';
        selectDistrito.disabled = true;

        if (regionSel && ubigeoPeru[regionSel]) {
            // Cargar provincias correspondientes
            for (const provincia in ubigeoPeru[regionSel]) {
                let opt = document.createElement("option");
                opt.value = provincia;
                opt.textContent = provincia;
                selectProvincia.appendChild(opt);
            }
            selectProvincia.disabled = false;
        }
    });

    // 3. Evento al cambiar Provincia
    selectProvincia.addEventListener("change", function () {
        const regionSel = selectRegion.value;
        const provinciaSel = this.value;

        // Limpiar y deshabilitar distrito
        selectDistrito.innerHTML = '<option value="">Seleccione...</option>';
        selectDistrito.disabled = true;

        if (regionSel && provinciaSel && ubigeoPeru[regionSel][provinciaSel]) {
            // Cargar distritos correspondientes
            const distritos = ubigeoPeru[regionSel][provinciaSel];
            distritos.forEach(distrito => {
                let opt = document.createElement("option");
                opt.value = distrito;
                opt.textContent = distrito;
                selectDistrito.appendChild(opt);
            });
            selectDistrito.disabled = false;
        }
    });
});

// =====================================================
// NAVEGACIÓN DEL ZOOM CON TECLADO
// =====================================================


// =====================================================
// VISOR GRANDE DE IMÁGENES
// =====================================================

let imagenesVisorGrande = [];
let indiceVisorGrande = 0;


// =====================================================
// ABRIR VISOR
// =====================================================

function abrirImagenGrandeZoom(
    url,
    imagenes = [],
    indice = 0
) {

    const visor =
        document.getElementById(
            "visorImagenGrande"
        );

    const imagen =
        document.getElementById(
            "imagenGrandeZoom"
        );

    if (!visor || !imagen) return;


    // ==========================================
    // GUARDAR TODAS LAS IMÁGENES
    // ==========================================

    imagenesVisorGrande =
        Array.isArray(imagenes) &&
            imagenes.length > 0
            ? imagenes
            : [url];


    // ==========================================
    // DETERMINAR ÍNDICE
    // ==========================================

    indiceVisorGrande =
        parseInt(indice) || 0;


    if (
        indiceVisorGrande < 0 ||
        indiceVisorGrande >=
        imagenesVisorGrande.length
    ) {

        indiceVisorGrande = 0;

    }


    // ==========================================
    // MOSTRAR IMAGEN
    // ==========================================

    imagen.src =
        imagenesVisorGrande[
        indiceVisorGrande
        ];


    // ==========================================
    // MOSTRAR VISOR
    // ==========================================

    visor.classList.add("activo");


    // ==========================================
    // BLOQUEAR SCROLL
    // ==========================================

    document.body.style.overflow =
        "hidden";


    // ==========================================
    // ACTUALIZAR FLECHAS
    // ==========================================

    actualizarFlechasVisorGrande();

}


// =====================================================
// CERRAR VISOR
// =====================================================

function cerrarImagenGrandeZoom() {

    const visor =
        document.getElementById(
            "visorImagenGrande"
        );

    const imagen =
        document.getElementById(
            "imagenGrandeZoom"
        );

    if (!visor) return;


    visor.classList.remove(
        "activo"
    );


    if (imagen) {

        imagen.src = "";

    }


    imagenesVisorGrande = [];

    indiceVisorGrande = 0;


    // Restaurar scroll

    document.body.style.overflow = "";

}


// =====================================================
// MOSTRAR IMAGEN ANTERIOR
// =====================================================

function imagenAnteriorVisorGrande() {

    if (
        imagenesVisorGrande.length <= 1
    ) {
        return;
    }


    indiceVisorGrande--;


    if (
        indiceVisorGrande < 0
    ) {

        indiceVisorGrande =
            imagenesVisorGrande.length - 1;

    }


    actualizarImagenVisorGrande();

}


// =====================================================
// MOSTRAR IMAGEN SIGUIENTE
// =====================================================

function imagenSiguienteVisorGrande() {

    if (
        imagenesVisorGrande.length <= 1
    ) {
        return;
    }


    indiceVisorGrande++;


    if (
        indiceVisorGrande >=
        imagenesVisorGrande.length
    ) {

        indiceVisorGrande = 0;

    }


    actualizarImagenVisorGrande();

}


// =====================================================
// ACTUALIZAR IMAGEN
// =====================================================

function actualizarImagenVisorGrande() {

    const imagen =
        document.getElementById(
            "imagenGrandeZoom"
        );

    if (!imagen) return;

    if (
        !imagenesVisorGrande[
        indiceVisorGrande
        ]
    ) {
        return;
    }


    imagen.src =
        imagenesVisorGrande[
        indiceVisorGrande
        ];


    actualizarFlechasVisorGrande();

}


// =====================================================
// MOSTRAR / OCULTAR FLECHAS
// =====================================================

function actualizarFlechasVisorGrande() {

    const anterior =
        document.getElementById(
            "visorImagenAnterior"
        );

    const siguiente =
        document.getElementById(
            "visorImagenSiguiente"
        );


    const mostrar =
        imagenesVisorGrande.length > 1;


    if (anterior) {

        anterior.style.display =
            mostrar
                ? "flex"
                : "none";

    }


    if (siguiente) {

        siguiente.style.display =
            mostrar
                ? "flex"
                : "none";

    }

}


// =====================================================
// EVENTOS DEL VISOR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const cerrar =
            document.getElementById(
                "cerrarImagenGrande"
            );

        const anterior =
            document.getElementById(
                "visorImagenAnterior"
            );

        const siguiente =
            document.getElementById(
                "visorImagenSiguiente"
            );

        const visor =
            document.getElementById(
                "visorImagenGrande"
            );


        // X

        if (cerrar) {

            cerrar.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();

                    cerrarImagenGrandeZoom();

                }
            );

        }


        // Flecha izquierda

        if (anterior) {

            anterior.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();

                    imagenAnteriorVisorGrande();

                }
            );

        }


        // Flecha derecha

        if (siguiente) {

            siguiente.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();

                    imagenSiguienteVisorGrande();

                }
            );

        }


        // Clic en fondo

        if (visor) {

            visor.addEventListener(
                "click",
                function (e) {

                    if (
                        e.target === visor
                    ) {

                        cerrarImagenGrandeZoom();

                    }

                }
            );

        }

    }
);


// =====================================================
// TECLADO
// =====================================================




// ==========================================
// CERRAR AL HACER CLICK
// ==========================================

document.addEventListener("click", function (e) {

    const visor =
        document.getElementById("visorImagenGrande");

    if (!visor) return;

    if (
        visor.classList.contains("activo") &&
        (
            e.target === visor ||
            e.target.id === "imagenGrandeZoom"
        )
    ) {
        cerrarImagenGrandeZoom();
    }

});


// ==========================================
// CERRAR CON ESC
// ==========================================




// =====================================================
// NAVEGACIÓN DE IMÁGENES CON TECLADO
// =====================================================

document.addEventListener("keydown", function (event) {

    // =================================================
    // ESC
    // =================================================

    if (event.key === "Escape") {

        const visorGrande =
            document.getElementById("visorImagenGrande");

        if (
            visorGrande &&
            visorGrande.classList.contains("activo")
        ) {

            event.preventDefault();

            cerrarImagenGrandeZoom();

            return;
        }

        return;
    }


    // =================================================
    // SOLO FLECHAS
    // =================================================

    if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
    ) {
        return;
    }


    // =================================================
    // PRIMERO: VISOR GRANDE
    // =================================================

    const visorGrande =
        document.getElementById("visorImagenGrande");


    if (
        visorGrande &&
        visorGrande.classList.contains("activo")
    ) {

        event.preventDefault();
        event.stopPropagation();


        if (event.key === "ArrowLeft") {

            imagenAnteriorVisorGrande();

        } else if (event.key === "ArrowRight") {

            imagenSiguienteVisorGrande();

        }


        return;
    }


    // =================================================
    // SEGUNDO: MODAL ZOOM
    // =================================================

    const modalZoom =
        document.getElementById("modalZoom");


    if (
        modalZoom &&
        modalZoom.classList.contains("show")
    ) {

        event.preventDefault();
        event.stopPropagation();


        if (event.key === "ArrowLeft") {

            navegarImagenZoom(-1);

        } else if (event.key === "ArrowRight") {

            navegarImagenZoom(1);

        }


        return;
    }

});


