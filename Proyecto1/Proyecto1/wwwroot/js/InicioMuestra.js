
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

async function cargarProductos() {
    const contenedor = document.getElementById("contenedorProductos");
    if (!contenedor) return;

    try {
        const response = await fetch("https://mi-proyecto1-2.onrender.com/api/registros");
        const data = await response.json();

        contenedor.innerHTML = "";

        data.forEach(item => {
            const estadoEquipo = item.estado ? item.estado.toLowerCase().trim() : "";

            if (estadoEquipo === "inactivo" && !estaLogueado) {
                return;
            }

            contenedor.innerHTML += `
            <div class="product-gallery">
                <div class="tipo-equipo-badge">
                    ${item.tipo_Equipo}
                </div>

                <div class="main-image-container">
                    <img id="main-${item.id}"
                         src="${item.url_Equipo}"
                         class="main-product-image"
                         style="cursor:pointer"
                         onclick="abrirZoom(${JSON.stringify(item).replace(/"/g, '&quot;')})" />
                </div>

                <div class="thumbnail-container">
                    ${item.url_Equipo ? `<img src="${item.url_Equipo}" class="thumbnail-image active-thumb" onclick="changeImage(this, 'main-${item.id}')" />` : ""}
                    ${item.url1 ? `<img src="${item.url1}" class="thumbnail-image" onclick="changeImage(this, 'main-${item.id}')"/>` : ""}
                    ${item.url2 ? `<img src="${item.url2}" class="thumbnail-image" onclick="changeImage(this, 'main-${item.id}')" />` : ""}
                    ${item.url3 ? `<img src="${item.url3}" class="thumbnail-image" onclick="changeImage(this, 'main-${item.id}')" />` : ""}
                </div>

                <div class="product-info-block" style="text-align: left; margin-top: 10px; line-height: 1.5;">
                    <strong>${item.marca || 'SIN MARCA'}</strong>
                    ${estadoEquipo === "agotado" ? `<span style="color: #ff4d4d; font-style: italic; font-weight: bold; margin-left: 6px;">(Agotado)</span>` : ""}
                    <br />
                    <span>${item.modelo || ''} - ${item.descripcion || ''}</span><br />
                    <small class="text-muted">Código: ${item.codigo_Producto || 'N/A'}</small><br />
                    
                    <div style="display: flex; align-items: stretch; gap: 8px; margin-top: 4px; line-height: 1.2;">
                        <span style="font-size: 1.1em; font-weight: bold; display: flex; align-items: center;">
                            S/. ${item.precio}
                        </span>
                        ${item.descuento && item.descuento > 0 ? `<span style="background-color: #ff4d4d; color: white; font-size: 0.85em; font-weight: bold; padding: 0px 6px; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center;">-${item.descuento}%</span>` : ""}
                    </div>
                    
                    ${item.precio_Antes && item.descuento > 0 ? `<span style="text-decoration: line-through; color: #888; font-size: 0.9em;">S/. ${item.precio_Antes}</span><br />` : ""}
                    ${estaLogueado && estadoEquipo === "inactivo" ? `<span style="color: #ff4d4d; font-weight: bold; font-size: 0.9em; display: inline-block; margin-top: 2px;">INACTIVO</span>` : ""}
                </div>

                <div class="product-actions">
                    ${estaLogueado ? `
                        <button class="btn btn-warning btn-sm w-100" onclick="editarEquipo(${item.id})">Editar</button>
                    ` : `
                        <div class="cantidad-container" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 13px; font-weight: 600; color: #555;">Cantidad:</span>
                            <div style="display: inline-flex; align-items: center; border: 1px solid #ced4da; border-radius: 4px; overflow: hidden; background: #fff;">
                                <button type="button" class="btn-cantidad" onclick="cambiarCantidadHTML(${item.id}, -1)" style="border: none; background: #f8f9fa; width: 28px; height: 28px; cursor: pointer; font-weight: bold; color: #333; padding: 0;">-</button>
                                <span id="cant-display-${item.id}" style="min-width: 30px; text-align: center; font-weight: bold; font-size: 13px; color: #333; line-height: 28px;">1</span>
                                <button type="button" class="btn-cantidad" onclick="cambiarCantidadHTML(${item.id}, 1)" style="border: none; background: #f8f9fa; width: 28px; height: 28px; cursor: pointer; font-weight: bold; color: #333; padding: 0;">+</button>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm w-100 btn-agregar-carrito"
                                data-id="${item.id}"
                                data-nombre="${item.marca || 'SIN MARCA'} ${item.modelo || ''}"
                                data-precio="${item.precio}"
                                data-imagenes='${JSON.stringify([item.url_Equipo, item.url1, item.url2, item.url3].filter(Boolean))}'>
                            Agregar al carrito
                        </button>
                    `}
                </div>
            </div>
        `;
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
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
        imagenesAgregar = [];
        document.getElementById("previewContainer").innerHTML = "";
        $('#modalAgregar').modal('hide');
        cargarProductos();
    } catch (error) {
        console.error(error);
        alert("Error al guardar el equipo");
    }
}

async function editarEquipo(id) {
    try {
        imagenesEditar = [];
        document.getElementById("editar_fileImage").value = "";
        document.getElementById("editar_previewContainer").innerHTML = "";

        const response = await fetch(`https://mi-proyecto1-2.onrender.com/api/registros`);
        const data = await response.json();
        const item = data.find(x => x.id === id);

        if (!item) {
            alert("Equipo no encontrado");
            return;
        }

        imagenesEditar = [item.url_Equipo, item.url1, item.url2, item.url3].filter(Boolean);

        document.getElementById("editar_tipoEquipo").value = item.tipo_Equipo || "";
        document.getElementById("editar_color").value = item.color || "";
        document.getElementById("editar_marca").value = item.marca || "";
        document.getElementById("editar_modelo").value = item.modelo || "";
        document.getElementById("editar_codigoProducto").value = item.codigo_Producto || "";
        document.getElementById("editar_descripcion").value = item.descripcion || "";
        document.getElementById("editar_precio").value = item.precio || 0;
        document.getElementById("editar_precioAntes").value = item.precio_Antes || "";
        document.getElementById("editar_descuento").value = item.descuento || "";
        document.getElementById("editar_estado").value = item.estado || "";

        renderPreview("editar_previewContainer", imagenesEditar);
        $('#modalEditar').modal('show');
        document.getElementById("btnActualizar").onclick = () => actualizarEquipo(id);
    } catch (error) {
        console.error("Error editarEquipo:", error);
        alert("Error al cargar equipo");
    }
}

async function actualizarEquipo(id) {
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
            color: document.getElementById("editar_color").value,
            marca: document.getElementById("editar_marca").value,
            modelo: document.getElementById("editar_modelo").value,
            codigo_Producto: document.getElementById("editar_codigoProducto").value,
            descripcion: document.getElementById("editar_descripcion").value,
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

// --- NUEVA FUNCIÓN ABRIR ZOOM: CARGA LA INTEGRACIÓN DE LA FICHA TÉCNICA INTERACTIVA ---
function abrirZoom(item) {
    if (!item) return;

    // Resetear contador a 1 cada vez que se abra el modal
    cantidadActualZoom = 1;
    const displayZoom = document.getElementById("cant-display-zoom");
    if (displayZoom) displayZoom.innerText = cantidadActualZoom;

    // Poblar títulos y textos informativos
    document.getElementById("zoom-titulo-producto").innerText = `${item.marca || ''} ${item.modelo || ''}`;
    document.getElementById("zoom-tipo-badge").innerText = item.tipo_Equipo || 'Producto';
    document.getElementById("zoom-marca").innerText = item.marca || 'SIN MARCA';
    document.getElementById("zoom-modelo-desc").innerText = `${item.modelo || ''} ${item.descripcion ? ' - ' + item.descripcion : ''}`;
    document.getElementById("zoom-codigo").innerText = item.codigo_Producto || 'N/A';

    // Manejo de Precios y Descuentos dinámicos
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

    // Configurar imagen de visualización principal
    const imgPrincipal = document.getElementById("zoom-imagen-principal");
    if (imgPrincipal) imgPrincipal.src = item.url_Equipo;

    // Generar miniaturas dinámicas interactivas
    const contenedorMiniaturas = document.getElementById("zoom-galeria-miniaturas");
    if (contenedorMiniaturas) {
        contenedorMiniaturas.innerHTML = "";
        const listaImagenes = [item.url_Equipo, item.url1, item.url2, item.url3].filter(Boolean);

        listaImagenes.forEach((url, index) => {
            const thumb = document.createElement("img");
            thumb.src = url;
            thumb.style.cssText = "width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; cursor: pointer; transition: all 0.2s;";

            if (index === 0) {
                thumb.style.borderColor = "#007bff";
                thumb.style.boxShadow = "0 0 4px rgba(0,123,255,0.5)";
            }

            thumb.onclick = function () {
                if (imgPrincipal) imgPrincipal.src = url;
                Array.from(contenedorMiniaturas.children).forEach(child => {
                    child.style.borderColor = "#ddd";
                    child.style.boxShadow = "none";
                });
                thumb.style.borderColor = "#007bff";
                thumb.style.boxShadow = "0 0 4px rgba(0,123,255,0.5)";
            };

            contenedorMiniaturas.appendChild(thumb);
        });

        // Configurar los atributos data-* en el botón del carrito dentro del modal zoom
        const btnAgregar = document.getElementById("zoom-btn-agregar");
        if (btnAgregar) {
            btnAgregar.setAttribute("data-id", item.id);
            btnAgregar.setAttribute("data-nombre", `${item.marca || 'SIN MARCA'} ${item.modelo || ''}`);
            btnAgregar.setAttribute("data-precio", item.precio);
            btnAgregar.setAttribute("data-imagenes", JSON.stringify(listaImagenes));
        }
    }

    // Abrir modal usando jQuery compatible con Bootstrap 4/5
    $('#modalZoom').modal('show');
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

// --- SISTEMA DEL CARRITO DE COMPRAS ---
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

// Guardar en LocalStorage y actualizar la UI
function guardarYActualizarCarrito() {
    localStorage.setItem("carrito_fractalica", JSON.stringify(carrito));
    actualizarBadgeYDropdown();
}

// Actualizar la insignia roja y el contenido del desplegable del carrito
function actualizarBadgeYDropdown() {
    const badge = document.getElementById("cart-badge");
    const container = document.getElementById("carrito-items");
    const totalSpan = document.getElementById("carrito-total");

    // NUEVO: Capturar elementos del modal del carrito que está en _LayoutInicio.cshtml
    const containerModal = document.getElementById("carrito-items-modal");
    const totalSpanModal = document.getElementById("carrito-total-modal");

    const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // Actualizar Badge
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

    // 3. Actualizar Totales y Cantidad de Productos en el Modal
    if (totalSpanModal) {
        totalSpanModal.innerText = `S/. ${totalPrecio.toFixed(2)}`;
    }
    const cantSpanModal = document.getElementById("carrito-cantidad-total-modal");
    if (cantSpanModal) {
        cantSpanModal.innerText = `${totalCantidad} ${totalCantidad === 1 ? 'producto' : 'productos'}`;
    }

    // HTML del Listado de Productos (Dropdown y Modal)
    // HTML del Listado de Productos (Dropdown y Modal) con botones de cantidad
    // HTML del Listado de Productos (Dropdown y Modal) con P/U y subtotal por item
    const generarHTMLItem = (item, esModal = false) => {
        // Usamos la primera imagen de Cloudinary si existe, de lo contrario un placeholder limpio
        const imagenUrl = (item.imagenes && item.imagenes.length > 0) ? item.imagenes[0] : 'https://images.placeholders.dev/?width=150&height=150&text=Sin+Imagen&bgColor=%23f0f0f0';

        // Determinar qué función de zoom llamará al hacer click en la imagen
        const clickZoomAction = esModal
            ? `onclick="abrirZoomDesdeCarrito(${item.id})"`
            : `onclick="abrirZoomDesdeCarrito(${item.id})"; event.stopPropagation();`;

        // Para evitar que hacer click en los botones del selector cierre el dropdown (si no es modal)
        const stopProp = !esModal ? 'event.stopPropagation();' : '';

        // Cálculo del subtotal por este producto específico
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