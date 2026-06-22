

let imagenesZoom = [];
let indexZoom = 0;


let imagenesAgregar = [];
let imagenesEditar = [];
let indiceArrastrado = null;


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

    // 1. Para el Modal de Agregar
    const precioAntesInput = document.getElementById("precioAntes");
    const descuentoInput = document.getElementById("descuento");
    const precioActualInput = document.getElementById("precio");

    function calcularPrecioActual() {
        const precioAntes = parseFloat(precioAntesInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;

        if (descuento > 0 && precioAntes > 0) {
            // Fórmula: Precio Anterior - (Precio Anterior * (Descuento / 100))
            const resultado = precioAntes - (precioAntes * (descuento / 100));
            precioActualInput.value = resultado.toFixed(2); // Guarda con 2 decimales
        } else {
            // Si el descuento es 0 o vacío, el precio actual es igual al precio anterior
            precioActualInput.value = precioAntes > 0 ? precioAntes.toFixed(2) : "";
        }
    }

    if (precioAntesInput && descuentoInput) {
        precioAntesInput.addEventListener("input", calcularPrecioActual);
        descuentoInput.addEventListener("input", calcularPrecioActual);
    }

    // 2. Para el Modal de Editar
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
});


async function cargarProductos() {
    const contenedor = document.getElementById("contenedorProductos");
    if (!contenedor) return;

    try {
        const response = await fetch("https://mi-proyecto1-2.onrender.com/api/registros");
        const data = await response.json();

        contenedor.innerHTML = "";

        data.forEach(item => {
            // Normalizamos el estado para evitar problemas con mayúsculas/minúsculas o espacios vacíos
            const estadoEquipo = item.estado ? item.estado.toLowerCase().trim() : "";

            // REGLA DE NEGOCIO: Si el equipo está inactivo y el usuario NO está logueado, se oculta por completo
            if (estadoEquipo === "inactivo" && !estaLogueado) {
                return; // Salta este producto
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
                         onclick="abrirZoom(this)" />
                </div>

                <div class="thumbnail-container">
                    ${item.url_Equipo ? `
                        <img src="${item.url_Equipo}"
                             class="thumbnail-image active-thumb"
                             onclick="changeImage(this, 'main-${item.id}')" />
                    ` : ""}

                    ${item.url1 ? `
                        <img src="${item.url1}"
                             class="thumbnail-image"
                             onclick="changeImage(this, 'main-${item.id}')"/>
                    ` : ""}

                    ${item.url2 ? `
                        <img src="${item.url2}"
                             class="thumbnail-image"
                             onclick="changeImage(this, 'main-${item.id}')" />
                    ` : ""}

                    ${item.url3 ? `
                        <img src="${item.url3}"
                             class="thumbnail-image"
                             onclick="changeImage(this, 'main-${item.id}')" />
                    ` : ""}
                </div>

                <div class="product-info-block" style="text-align: left; margin-top: 10px; line-height: 1.5;">

                    <strong>${item.marca || 'SIN MARCA'}</strong>
                    
                    ${estadoEquipo === "agotado" ? `
                        <span style="color: #ff4d4d; font-style: italic; font-weight: bold; margin-left: 6px;">
                            (Agotado)
                        </span>
                    ` : ""}
                    <br />
                    
                    <span>${item.modelo || ''} - ${item.descripcion || ''}</span><br />
                    
                    <small class="text-muted">Código: ${item.codigo_Producto || 'N/A'}</small><br />
                    
                    <div style="display: flex; align-items: stretch; gap: 8px; margin-top: 4px; line-height: 1.2;">
                        <span style="font-size: 1.1em; font-weight: bold; display: flex; align-items: center;">
                            S/. ${item.precio}
                        </span>
                        
                        ${item.descuento && item.descuento > 0 ? `
                            <span style="
                                background-color: #ff4d4d; 
                                color: white; 
                                font-size: 0.85em; 
                                font-weight: bold; 
                                padding: 0px 6px; 
                                border-radius: 4px; 
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                            ">-${item.descuento}%</span>
                        ` : ""}
                    </div>
                    
                    ${item.precio_Antes && item.descuento > 0 ? `
                        <span style="text-decoration: line-through; color: #888; font-size: 0.9em;">S/. ${item.precio_Antes}</span><br />
                    ` : ""}

                    ${estaLogueado && estadoEquipo === "inactivo" ? `
                        <span style="color: #ff4d4d; font-weight: bold; font-size: 0.9em; display: inline-block; margin-top: 2px;">
                            INACTIVO
                        </span>
                    ` : ""}
                </div>

                ${estaLogueado ? `
                    <button class="btn btn-warning btn-sm w-100 mt-2"
                            onclick="editarEquipo(${item.id})">
                        Editar
                    </button>
                ` : ``}

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

            // si ya es URL
            if (img.startsWith("http")) {
                urls.push(img);
                continue;
            }

            const blob = await fetch(img).then(r => r.blob());

            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", "inventario_preset");

            const cloudResponse = await fetch(
                "https://api.cloudinary.com/v1_1/dkxto4ymq/image/upload", {
                method: "POST",
                body: formData
            }
            );

            const cloudData = await cloudResponse.json();
            urls.push(cloudData.secure_url);
        }

        urls = urls.slice(0, 4);

        // ENVIAR A API
        await fetch("https://mi-proyecto1-2.onrender.com/api/registros", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({

                tipo_Equipo: document.getElementById("tipoEquipo").value,
                color: document.getElementById("color").value,
                marca: document.getElementById("marca").value,
                modelo: document.getElementById("modelo").value,
                codigo_Producto: document.getElementById("codigoProducto").value,
                descripcion: document.getElementById("descripcion").value,

                // Busca estas líneas dentro de JSON.stringify({...}) y cámbialas:
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

        document.getElementById("editar_fileImage").value = "";
        imagenesAgregar = [];
        document.getElementById("previewContainer").innerHTML = "";

        $('#modalAgregar').modal('hide');
        cargarProductos();

    } catch (error) {
        console.error(error);
        alert("Error al guardar el equipo");
    }
}



function zoomImage(lista, index) {

    imagenesZoom = lista;
    indexZoom = index;

    actualizarZoom();

    const modalEl = document.getElementById("modalZoom");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}


async function editarEquipo(id) {

    try {

        imagenesEditar = [];

        document.getElementById("editar_fileImage").value = "";
        document.getElementById("editar_previewContainer").innerHTML = "";

        const response = await fetch(`https://mi-proyecto1-2.onrender.com/api/registros`);
        const data = await response.json();

        const item = data.find(x => x.id === id);
        //console.log(item); 

        if (!item) {
            alert("Equipo no encontrado");
            return;
        }


        imagenesEditar = [
            item.url_Equipo,
            item.url1,
            item.url2,
            item.url3
        ].filter(Boolean);

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

                const cloudResponse = await fetch(
                    "https://api.cloudinary.com/v1_1/dkxto4ymq/image/upload", {
                    method: "POST",
                    body: formData
                }
                );

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
            // Busca estas líneas dentro de "const body = {...}" y cámbialas:
            precio: parseFloat(document.getElementById("editar_precio").value) || 0,

            precio_Antes: document.getElementById("editar_precioAntes").value !== "" ? parseFloat(document.getElementById("editar_precioAntes").value) : null,

            descuento: document.getElementById("editar_descuento").value !== "" ? parseFloat(document.getElementById("editar_descuento").value) : 0,
            estado: document.getElementById("editar_estado").value,

            url_Equipo: cleanUrls[0],
            url1: cleanUrls[1],
            url2: cleanUrls[2],
            url3: cleanUrls[3]
        };

        const response = await fetch(
            `https://mi-proyecto1-2.onrender.com/api/EditarEquipos/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
        );

        if (!response.ok) {
            console.error(await response.text());
            alert("Error al actualizar");
            return;
        }

        mostrarToast("Equipo actualizado correctamente");

        // 🔥 cerrar modal (Bootstrap 4 correcto)
        $('#modalEditar').modal('hide');

        cargarProductos();

    } catch (error) {
        console.error("Error actualizarEquipo:", error);
        alert("Error inesperado");
    }
}




document.getElementById("modalAgregar").addEventListener("show.bs.modal", function (event) {

    // Solo si estás en modo "crear", no editar
    const btn = document.querySelector("#modalAgregar .btn-primary");

    if (btn.innerText === "Guardar Equipo") {

        imagenesAgregar = [];
        document.getElementById("previewContainer").innerHTML = "";
    }
});

function actualizarZoom() {

    const img = document.getElementById("imgZoom");
    img.src = imagenesZoom[indexZoom];

    document.getElementById("btnPrev").style.display =
        indexZoom > 0 ? "block" : "none";

    document.getElementById("btnNext").style.display =
        indexZoom < imagenesZoom.length - 1 ? "block" : "none";
}

function nextImage() {
    if (indexZoom < imagenesZoom.length - 1) {
        indexZoom++;
        actualizarZoom();
    }
}

function prevImage() {
    if (indexZoom > 0) {
        indexZoom--;
        actualizarZoom();
    }
}

document.addEventListener("keydown", function (e) {

    const modal = document.getElementById("modalZoom");

    if (!modal.classList.contains("show")) return;

    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
});

function abrirZoom(imgPrincipal) {

    const galeria = imgPrincipal.closest(".product-gallery");

    const thumbs = galeria.querySelectorAll(".thumbnail-image");

    const imagenes = Array.from(thumbs).map(img => img.src);

    const indiceActual = Array.from(thumbs)
        .findIndex(img => img.classList.contains("active-thumb"));

    zoomImage(imagenes, indiceActual);
}


function mostrarToast(mensaje, color = "#28a745") {
    const toast = document.getElementById("toastMensaje");

    toast.innerText = mensaje;
    toast.style.background = color;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

function renderPreview(containerId, imagenes) {

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    imagenes.forEach((url, index) => {

        const div = document.createElement("div");

        div.style.position = "relative";
        div.style.display = "inline-block";
        div.style.margin = "5px";
        div.draggable = true;

        // INICIO ARRASTRE
        div.addEventListener("dragstart", () => {
            indiceArrastrado = index;
        });

        // PERMITIR SOLTAR
        div.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        // SOLTAR
        div.addEventListener("drop", (e) => {

            e.preventDefault();

            if (
                indiceArrastrado === null ||
                indiceArrastrado === index
            ) return;

            // intercambiar posiciones
            [imagenes[indiceArrastrado], imagenes[index]] =
                [imagenes[index], imagenes[indiceArrastrado]];

            renderPreview(containerId, imagenes);

            indiceArrastrado = null;
        });

        div.innerHTML = `
                <img src="${url}"
                     style="
                        width:80px;
                        height:80px;
                        object-fit:cover;
                        border-radius:8px;
                        border:1px solid #ddd;
                        cursor:move;
                     " />

                <button type="button"
                        style="
                            position:absolute;
                            top:-8px;
                            right:-8px;
                            background:red;
                            color:white;
                            border:none;
                            border-radius:50%;
                            width:20px;
                            height:20px;
                            font-size:12px;
                            cursor:pointer;">
                    ×
                </button>
            `;

        div.querySelector("button").onclick = () => {

            imagenes.splice(index, 1);

            renderPreview(containerId, imagenes);
        };

        container.appendChild(div);
    });
}