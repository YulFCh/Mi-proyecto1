
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

    const imagenPrincipal =
        card.querySelector(
            ".main-product-image"
        );

    if (imagenPrincipal) {
        imagenPrincipal.src = url;
    }

    card.querySelectorAll(
        ".thumbnail-image"
    ).forEach(img => {

        img.classList.remove(
            "active-thumb"
        );

    });

    elemento.classList.add(
        "active-thumb"
    );
}

function abrirZoomProductoSeleccionado(productoId) {

    const producto = window.productosAgrupados?.find(
        p => p.id === productoId
    );

    if (!producto) {
        console.error("Producto no encontrado:", productoId);
        return;
    }

    const card = document.getElementById(`producto-${productoId}`);

    let varianteIndex = 0;

    if (card) {
        varianteIndex = parseInt(
            card.dataset.varianteIndex || "0"
        );
    }

    const variantes =
        producto.variantes ||
        producto.Variantes ||
        [];

    const variante = variantes[varianteIndex];

    if (!variante) {
        console.error("Variante no encontrada:", varianteIndex);
        return;
    }

    // Creamos el objeto de la variante seleccionada
    const itemZoom = {
        ...producto,

        id: variante.id,

        color: variante.color,

        precio: variante.precio,

        precio_Antes: variante.precio_Antes,

        descuento: variante.descuento,

        estado: variante.estado,

        descripcion: variante.descripcion,

        descripcion1: variante.descripcion1,

        garantia: variante.garantia,

        url_Equipo: variante.url_Equipo,

        url1: variante.url1,

        url2: variante.url2,

        url3: variante.url3,

        codigo_Producto:
            variante.codigo_Producto ||
            producto.codigo_Producto,

        // IMPORTANTE:
        // enviamos todas las variantes al Zoom
        variantes: variantes,

        varianteSeleccionadaIndex: varianteIndex
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

    console.log(
        "Cargando variante:",
        indice,
        variante
    );

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

    console.log(
        "Variante cargada correctamente:",
        {
            indice: indice,
            id: variante.id,
            color: variante.color,
            codigo: variante.codigo_Producto,
            precio: variante.precio,
            imagenes: imagenesEditar
        }
    );
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

    cantidadActualZoom = 1;
    const displayZoom = document.getElementById("cant-display-zoom");
    if (displayZoom) displayZoom.innerText = cantidadActualZoom;

    document.getElementById("zoom-titulo-producto").innerText = `${item.marca || ''} ${item.modelo || ''}`;
    document.getElementById("zoom-tipo-badge").innerText = item.tipo_Equipo || 'Producto';
    document.getElementById("zoom-marca").innerText = item.marca || 'SIN MARCA';
    document.getElementById("zoom-modelo-desc").innerText = `${item.modelo || ''} ${item.descripcion ? ' - ' + item.descripcion : ''}`;
    document.getElementById("zoom-codigo").innerText = item.codigo_Producto || 'N/A';

    const contenedorGarantia = document.getElementById("zoom-garantia-container");
    const spanGarantia = document.getElementById("zoom-garantia");

    if (item.garantia && item.garantia.toString().trim() !== "") {
        if (spanGarantia) spanGarantia.innerText = item.garantia;
        if (contenedorGarantia) contenedorGarantia.style.display = "flex";
    } else {
        if (contenedorGarantia) contenedorGarantia.style.display = "none";
    }

    const txtCaracteristicas = document.getElementById('zoom-caracteristicas-texto');
    if (txtCaracteristicas) {
        txtCaracteristicas.innerText = item.descripcion1 || "No hay características detalladas adicionales disponibles para este equipo.";
    }


    const contenedorColores =
        document.getElementById("zoom-lista-colores");

    const contenedorPadreColores =
        document.getElementById("zoom-color-container");

    if (contenedorColores && contenedorPadreColores) {

        contenedorColores.innerHTML = "";

        const variantes =
            item.variantes ||
            item.Variantes ||
            [];

        if (variantes.length > 0) {

            contenedorPadreColores.style.display = "block";

            variantes.forEach((variante, index) => {

                const colorNombre =
                    variante.color ||
                    "Sin color";

                const btnColor =
                    document.createElement("button");

                btnColor.type = "button";

                btnColor.style.width = "26px";
                btnColor.style.height = "26px";
                btnColor.style.borderRadius = "50%";
                btnColor.style.padding = "0";
                btnColor.style.cursor = "pointer";

                btnColor.style.backgroundColor =
                    obtenerColorCSS(colorNombre);

                btnColor.title =
                    `${colorNombre} - ${variante.codigo_Producto || ""}`;

                btnColor.dataset.varianteIndex = index;


                const varianteActual =
                    item.varianteSeleccionadaIndex ?? 0;

                if (index === varianteActual) {

                    btnColor.style.border =
                        "2px solid #fff";

                    btnColor.style.boxShadow =
                        "0 0 0 2px #8a2be2";

                    btnColor.classList.add("active");

                } else {

                    btnColor.style.border =
                        "1px solid #ccc";

                    btnColor.style.boxShadow =
                        "none";
                }


                btnColor.onclick = function () {

                    const varianteSeleccionada =
                        variantes[index];

                    if (!varianteSeleccionada) return;

                    item.varianteSeleccionadaIndex = index;

                    item.id =
                        varianteSeleccionada.id;

                    item.color =
                        varianteSeleccionada.color;

                    item.precio =
                        varianteSeleccionada.precio;

                    item.precio_Antes =
                        varianteSeleccionada.precio_Antes;

                    item.descuento =
                        varianteSeleccionada.descuento;

                    item.estado =
                        varianteSeleccionada.estado;

                    item.descripcion =
                        varianteSeleccionada.descripcion;

                    item.descripcion1 =
                        varianteSeleccionada.descripcion1;

              

                    item.garantia =
                        varianteSeleccionada.garantia;

                    item.codigo_Producto =
                        varianteSeleccionada.codigo_Producto;

                    item.url_Equipo =
                        varianteSeleccionada.url_Equipo;

                    item.url1 =
                        varianteSeleccionada.url1;

                    item.url2 =
                        varianteSeleccionada.url2;

                    item.url3 =
                        varianteSeleccionada.url3;


                    const zoomModeloDesc =
                        document.getElementById("zoom-modelo-desc");

                    if (zoomModeloDesc) {

                        zoomModeloDesc.innerText =
                            `${item.modelo || ""}${varianteSeleccionada.descripcion
                                ? " - " + varianteSeleccionada.descripcion
                                : ""
                            }`;
                    }


                    // ==========================================
                    // ACTUALIZAR DESCRIPCIÓN DETALLADA
                    // ==========================================

                    const txtCaracteristicas =
                        document.getElementById("zoom-caracteristicas-texto");

                    if (txtCaracteristicas) {

                        txtCaracteristicas.innerText =
                            varianteSeleccionada.descripcion1 ||
                            "No hay descripción detallada disponible para este equipo.";
                    }


                    const zoomCodigo =
                        document.getElementById("zoom-codigo");

                    if (zoomCodigo) {
                        zoomCodigo.innerText =
                            varianteSeleccionada.codigo_Producto || "N/A";
                    }

                    document.getElementById(
                        "zoom-precio-actual"
                    ).innerText =
                        `S/. ${parseFloat(
                            varianteSeleccionada.precio || 0
                        ).toFixed(2)}`;


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


                    // ==========================================
                    // ACTUALIZAR GARANTÍA
                    // ==========================================

                    const contenedorGarantia =
                        document.getElementById(
                            "zoom-garantia-container"
                        );

                    const spanGarantia =
                        document.getElementById(
                            "zoom-garantia"
                        );

                    if (
                        varianteSeleccionada.garantia &&
                        varianteSeleccionada.garantia
                            .toString()
                            .trim() !== ""
                    ) {

                        if (spanGarantia) {
                            spanGarantia.innerText =
                                varianteSeleccionada.garantia;
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



                    if (
                        varianteSeleccionada.descuento &&
                        parseFloat(
                            varianteSeleccionada.descuento
                        ) > 0
                    ) {

                        descuentoBadge.innerText =
                            `-${varianteSeleccionada.descuento}%`;

                        descuentoBadge.style.display =
                            "inline-flex";


                        if (
                            varianteSeleccionada.precio_Antes
                        ) {

                            precioAntesText.innerText =
                                `S/. ${parseFloat(
                                    varianteSeleccionada.precio_Antes
                                ).toFixed(2)}`;

                            precioAntesCont.style.display =
                                "block";

                        } else {

                            precioAntesCont.style.display =
                                "none";
                        }

                    } else {

                        descuentoBadge.style.display =
                            "none";

                        precioAntesCont.style.display =
                            "none";
                    }

                    imagenesActualesZoom = [
                        varianteSeleccionada.url_Equipo,
                        varianteSeleccionada.url1,
                        varianteSeleccionada.url2,
                        varianteSeleccionada.url3
                    ].filter(Boolean);

                    indiceActualZoom = 0;


                    // Imagen principal
                    const imgPrincipal =
                        document.getElementById(
                            "zoom-imagen-principal"
                        );

                    if (imgPrincipal) {

                        imgPrincipal.src =
                            imagenesActualesZoom[0] || "";
                    }



                    const contenedorMiniaturas =
                        document.getElementById(
                            "zoom-galeria-miniaturas"
                        );

                    if (contenedorMiniaturas) {

                        contenedorMiniaturas.innerHTML = "";

                        imagenesActualesZoom.forEach(
                            (url, imgIndex) => {

                                const thumb =
                                    document.createElement("img");

                                thumb.src = url;

                                thumb.id =
                                    `zoom-thumb-${imgIndex}`;

                                thumb.style.cssText =
                                    `
                                width:45px;
                                height:45px;
                                object-fit:cover;
                                border-radius:4px;
                                border:1px solid #ddd;
                                cursor:pointer;
                                transition:all .2s;
                                `;

                                if (imgIndex === 0) {

                                    thumb.style.borderColor =
                                        "#007bff";

                                    thumb.style.boxShadow =
                                        "0 0 4px rgba(0,123,255,.5)";
                                }

                                thumb.onclick = function () {

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

                    const btnAgregar =
                        document.getElementById(
                            "zoom-btn-agregar"
                        );

                    if (btnAgregar) {

                        const imagenes = [
                            varianteSeleccionada.url_Equipo,
                            varianteSeleccionada.url1,
                            varianteSeleccionada.url2,
                            varianteSeleccionada.url3
                        ].filter(Boolean);

                        btnAgregar.setAttribute(
                            "data-id",
                            varianteSeleccionada.id
                        );

                        btnAgregar.setAttribute(
                            "data-nombre",
                            `${item.marca || "SIN MARCA"} ${item.modelo || ""} - ${varianteSeleccionada.color || ""}`
                        );

                        btnAgregar.setAttribute(
                            "data-precio",
                            varianteSeleccionada.precio
                        );

                        btnAgregar.setAttribute(
                            "data-imagenes",
                            JSON.stringify(imagenes)
                        );
                    }


                    contenedorColores
                        .querySelectorAll("button")
                        .forEach(btn => {

                            btn.style.border =
                                "1px solid #ccc";

                            btn.style.boxShadow =
                                "none";

                            btn.classList.remove("active");
                        });


                    this.style.border =
                        "2px solid #fff";

                    this.style.boxShadow =
                        "0 0 0 2px #8a2be2";

                    this.classList.add("active");
                };


                contenedorColores.appendChild(
                    btnColor
                );
            });

        } else {

            contenedorPadreColores.style.display =
                "none";
        }
    
    }

    document.getElementById("zoom-precio-actual").innerText = `S/. ${parseFloat(item.precio).toFixed(2)}`;

    const descuentoBadge = document.getElementById("zoom-descuento-badge");
    const precioAntesCont = document.getElementById("zoom-precio-antes-container");
    const precioAntesText = document.getElementById("zoom-precio-antes");

    if (item.descuento && item.descuento > 0) {
        descuentoBadge.innerText = `-${item.descuento}%`;
        descuentoBadge.style.display = "inline-flex";

        if (item.precio_Antes) {
            precioAntesText.innerText = `S/. ${parseFloat(item.precio_Antes).toFixed(2)}`;
            precioAntesCont.style.display = "block";
        } else {
            precioAntesCont.style.display = "none";
        }
    } else {
        descuentoBadge.style.display = "none";
        precioAntesCont.style.display = "none";
    }


    imagenesActualesZoom = [item.url_Equipo, item.url1, item.url2, item.url3].filter(Boolean);
    indiceActualZoom = 0;

    const prevBtn = document.getElementById("zoom-prev-btn");
    const nextBtn = document.getElementById("zoom-next-btn");
    if (prevBtn && nextBtn) {
        const mostrarFlechas = imagenesActualesZoom.length > 1 ? "flex" : "none";
        prevBtn.style.display = mostrarFlechas;
        nextBtn.style.display = mostrarFlechas;
    }

    const imgPrincipal = document.getElementById("zoom-imagen-principal");
    if (imgPrincipal) imgPrincipal.src = imagenesActualesZoom[indiceActualZoom];

    const contenedorMiniaturas = document.getElementById("zoom-galeria-miniaturas");
    if (contenedorMiniaturas) {
        contenedorMiniaturas.innerHTML = "";

        imagenesActualesZoom.forEach((url, index) => {
            const thumb = document.createElement("img");
            thumb.src = url;
            thumb.id = `zoom-thumb-${index}`;
            thumb.style.cssText = "width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; cursor: pointer; transition: all 0.2s;";

            if (index === 0) {
                thumb.style.borderColor = "#007bff";
                thumb.style.boxShadow = "0 0 4px rgba(0,123,255,0.5)";
            }

            thumb.onclick = function () {
                seleccionarImagenZoom(index);
            };

            contenedorMiniaturas.appendChild(thumb);
        });

        const btnAgregar = document.getElementById("zoom-btn-agregar");
        if (btnAgregar) {
            btnAgregar.setAttribute("data-id", item.id);
            btnAgregar.setAttribute("data-nombre", `${item.marca || 'SIN MARCA'} ${item.modelo || ''}`);
            btnAgregar.setAttribute("data-precio", item.precio);
            btnAgregar.setAttribute("data-imagenes", JSON.stringify(imagenesActualesZoom));
        }
    }

    $('#modalZoom').modal('show');
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
            : `onclick="abrirZoomDesdeCarrito(${item.id})"; event.stopPropagation();`;

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
    const item = carrito.find(prod => prod.id === id);
    if (item && item.imagenes && item.imagenes.length > 0) {
        // Cerramos temporalmente el modal del carrito (si estuviese abierto)
        $('#modalCarrito').modal('hide');

        // Esperamos brevemente a que el modal del carrito cierre su animación antes de abrir el zoom
        setTimeout(() => {
            zoomImage(item.imagenes, 0);
        }, 300);
    } else {
        mostrarToast("Este producto no contiene imágenes para visualizar.", "#ff4d4d");
    }
}
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

    console.log("¡Pedido Listo para Procesar!", resumenPedido);

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