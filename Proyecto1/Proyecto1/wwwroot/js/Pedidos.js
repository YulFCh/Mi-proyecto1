const API_PEDIDOS =
    "https://mi-proyecto1-2.onrender.com/api/Pedidos/listar";


document.addEventListener("DOMContentLoaded", function () {

    cargarPedidos();


    const btnBuscar =
        document.getElementById("btnBuscarPedidos");

    if (btnBuscar) {

        btnBuscar.addEventListener(
            "click",
            function () {

                cargarPedidos();

            }
        );

    }


    const btnLimpiar =
        document.getElementById("btnLimpiarPedidos");

    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            function () {

                document.getElementById("buscarNombre").value = "";
                document.getElementById("buscarDni").value = "";
                document.getElementById("buscarCodigo").value = "";

                cargarPedidos();

            }
        );

    }


    const filtros = [
        "buscarNombre",
        "buscarDni",
        "buscarCodigo"
    ];


    filtros.forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;


        input.addEventListener(
            "keypress",
            function (e) {

                if (e.key === "Enter") {

                    cargarPedidos();

                }

            }
        );

    });

});



async function cargarPedidos() {

    const tabla =
        document.getElementById("tbodyPedidos");

    if (!tabla) return;


    const nombre =
        document
            .getElementById("buscarNombre")
            ?.value
            .trim() || "";


    const dni =
        document
            .getElementById("buscarDni")
            ?.value
            .trim() || "";


    const codigoPedido =
        document
            .getElementById("buscarCodigo")
            ?.value
            .trim() || "";


    const parametros =
        new URLSearchParams();


    if (nombre !== "") {

        parametros.append(
            "nombre",
            nombre
        );

    }


    if (dni !== "") {

        parametros.append(
            "dni",
            dni
        );

    }


    if (codigoPedido !== "") {

        parametros.append(
            "codigoPedido",
            codigoPedido
        );

    }


    const url =
        parametros.toString()
            ? `${API_PEDIDOS}?${parametros.toString()}`
            : API_PEDIDOS;


    console.log(
        "Consultando API:",
        url
    );


    tabla.innerHTML = `
        <tr>
            <td colspan="11"
                class="text-center">

                Cargando pedidos...

            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }


        const resultado =
            await response.json();






        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No se pudieron cargar los pedidos."
            );

        }


        const pedidos =
            resultado.data || [];


        if (pedidos.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="11"
                        class="text-center text-muted">

                        No existen pedidos registrados.

                    </td>
                </tr>
            `;

            return;

        }


        tabla.innerHTML =
            pedidos
                .map(
                    (pedido, index) =>
                        generarFilaPedido(
                            pedido,
                            index
                        )
                )
                .join("");


    }
    catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );


        tabla.innerHTML = `
            <tr>
                <td colspan="11"
                    class="text-center text-danger">

                    Error al cargar los pedidos.

                </td>
            </tr>
        `;

    }

}





function generarFilaPedido(pedido, index) {

    const cliente =
        `${pedido.nombres_Pedido || ""} ${pedido.apellidos_Pedido || ""}`.trim();

    const fecha = formatearFecha(pedido.fechRegist_Pedido);

    const total =
        Number(pedido.total_Pedido ?? 0).toFixed(2);

    const adelanto =
        Number(pedido.adelanto_Pedido ?? 0).toFixed(2);

    const totalPagar =
        Number(pedido.totalpago_Pedido ?? 0).toFixed(2);

    return `
        <tr>
            <td>
                <div class="btn-group">
                    <button type="button"
                            class="btn-detalle-pedido"
                            onclick="verDetallePedido(${pedido.id_Pedido})"
                            title="Ver detalle">
                        <i class="feather icon-eye"></i>
                    </button>
                </div>
            </td>

            <td>${index + 1}</td>
            <td><strong>${pedido.cod_Pedido || ""}</strong></td>
            <td>${fecha}</td>
            <td>${cliente}</td>
            <td>${pedido.dni_Pedido || ""}</td>
            <td>${pedido.celular_Pedido || ""}</td>

            <td>S/ ${total}</td>
            <td>S/ ${adelanto}</td>
            <td><strong>S/ ${totalPagar}</strong></td>

            <td>
                ${generarBadgeEstadoPedido(pedido.estado_Pedido)}
            </td>

            <td>
                ${generarBadgeEstadoPago(pedido.estado_Pago_Pedido)}
            </td>
        </tr>
    `;
}



function generarBadgeEstadoPedido(
    estado
) {

    if (!estado) {

        return `
            <span class="badge bg-secondary">
                Sin estado
            </span>
        `;

    }


    const texto =
        estado.toString().trim();


    let clase =
        "bg-secondary";


    switch (
    texto.toLowerCase()
    ) {

        case "pendiente":

            clase =
                "bg-warning text-dark";

            break;


        case "procesando":

            clase =
                "bg-info";

            break;


        case "completado":

            clase =
                "bg-success";

            break;


        case "anulado":

            clase =
                "bg-danger";

            break;

    }


    return `
        <span class="badge ${clase}">
            ${texto}
        </span>
    `;

}



function generarBadgeEstadoPago(
    estado
) {

    if (!estado) {

        return `
            <span class="badge bg-secondary">
                Sin estado
            </span>
        `;

    }


    const texto =
        estado.toString().trim();


    let clase =
        "bg-secondary";


    switch (
    texto.toLowerCase()
    ) {

        case "pendiente":

            clase =
                "bg-warning text-dark";

            break;


        case "parcial":

            clase =
                "bg-info";

            break;


        case "pagado":

            clase =
                "bg-success";

            break;


        case "anulado":

            clase =
                "bg-danger";

            break;

    }


    return `
        <span class="badge ${clase}">
            ${texto}
        </span>
    `;

}



function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}



async function verDetallePedido(
    idPedido
) {

    const tabla =
        document.getElementById(
            "tablaDetallePedido"
        );


    const informacion =
        document.getElementById(
            "informacionPedido"
        );


    const total =
        document.getElementById(
            "totalDetallePedido"
        );


    if (!tabla) {

        console.error(
            "No existe #tablaDetallePedido"
        );

        return;

    }


    tabla.innerHTML = `
        <tr>

            <td colspan="10"
                class="text-center">

                Cargando detalle...

            </td>

        </tr>
    `;


    if (informacion) {

        informacion.innerHTML = "";

    }


    if (total) {

        total.innerText =
            "S/ 0.00";

    }


    const urlPedido = `${API_PEDIDOS}?${new URLSearchParams({
        codigoPedido: ""
    }).toString()}`;

    // Consultar los pedidos y localizar el seleccionado.
    const responsePedidos = await fetch(API_PEDIDOS, {
        headers: {
            "Accept": "application/json"
        }
    });

    if (!responsePedidos.ok) {
        throw new Error("No se pudo consultar la información del pedido.");
    }

    const resultadoPedidos = await responsePedidos.json();

    if (!resultadoPedidos.success) {
        throw new Error("No se pudo obtener la información del pedido.");
    }

    const pedidoSeleccionado = (resultadoPedidos.data || []).find(
        p => Number(p.id_Pedido) === Number(idPedido)
    );

    if (!pedidoSeleccionado) {
        throw new Error("No se encontró la información del pedido.");
    }

    mostrarInformacionPedido(pedidoSeleccionado);


    $("#modalDetallePedido").modal("show");


    try {

        const url =
            `${API_PEDIDOS.replace("/listar", "")}/${idPedido}/detalle`;


        console.log(
            "Consultando detalle:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const resultado =
            await response.json();


        console.log(
            "Respuesta detalle:",
            resultado
        );


        if (!resultado.success) {

            throw new Error(
                resultado.message ||
                "No se pudo obtener el detalle."
            );

        }


        const detalles =
            resultado.data || [];


        if (
            detalles.length === 0
        ) {

            tabla.innerHTML = `
                <tr>

                    <td colspan="10"
                        class="text-center text-muted">

                        Este pedido no tiene productos registrados.

                    </td>

                </tr>
            `;

            return;

        }


        tabla.innerHTML =
            detalles
                .map(
                    (detalle, index) => {

                        const cantidad =
                            Number(
                                detalle.cantidad || 0
                            );


                        const precio =
                            Number(
                                detalle.precio_Unitario || 0
                            );


                        const descuento =
                            Number(
                                detalle.descuento || 0
                            );


                        const subtotal =
                            Number(
                                detalle.subtotal || 0
                            );


                        return `
                            <tr>

                                <td>
                                    ${index + 1}
                                </td>


                                <td>
                                    ${detalle.codigo_Producto || ""}
                                </td>


                                <td>
                                    ${detalle.tipo_Equipo || ""}
                                </td>


                                <td>
                                    ${detalle.marca || ""}
                                </td>


                                <td>
                                    ${detalle.modelo || ""}
                                </td>


                                <td>
                                    ${detalle.color || ""}
                                </td>


                                <td class="text-center">
                                    ${cantidad}
                                </td>


                                <td>
                                    S/ ${precio.toFixed(2)}
                                </td>


                                <td>
                                    ${descuento.toFixed(2)}
                                </td>


                                <td>
                                    <strong>
                                        S/ ${subtotal.toFixed(2)}
                                    </strong>
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


        const totalCalculado =
            detalles.reduce(
                (
                    acumulado,
                    detalle
                ) => {

                    return acumulado +
                        Number(
                            detalle.subtotal || 0
                        );

                },
                0
            );


        if (total) {

            total.innerText =
                `S/ ${totalCalculado.toFixed(2)}`;

        }


    }
    catch (error) {

        console.error(
            "Error cargando detalle:",
            error
        );


        tabla.innerHTML = `
            <tr>

                <td colspan="10"
                    class="text-center text-danger">

                    Error al cargar el detalle del pedido.

                </td>

            </tr>
        `;

    }

}



function verTicketPedido(
    idPedido
) {

    console.log(
        "Ver ticket:",
        idPedido
    );

}


function mostrarInformacionPedido(pedido) {

    const informacion = document.getElementById("informacionPedido");

    if (!informacion || !pedido) return;

    const nombreCompleto = [
        pedido.nombres_Pedido,
        pedido.apellidos_Pedido
    ].filter(Boolean).join(" ");

    const escaparHTML = (valor) => {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    const campo = (valor) => escaparHTML(valor || "No registrado");

    informacion.innerHTML = `
    <div class="pedido-contacto">

        <!-- CÓDIGO DEL PEDIDO DESTACADO -->
        <div class="pedido-codigo-destacado">
            <div class="pedido-codigo-icono">
    <i class="fa fa-clipboard-list" aria-hidden="true"></i>
</div>


            <div class="pedido-codigo-info">
                <span>CÓDIGO DEL PEDIDO</span>
                <strong>${campo(pedido.cod_Pedido)}</strong>
            </div>


        </div>

        <!-- ENCABEZADO DE CONTACTO -->
        <div class="pedido-contacto-header">
            <div class="pedido-contacto-icono">
                <i class="fa fa-user" aria-hidden="true"></i>
            </div>

            <div>
                <h5>Información de contacto</h5>
            </div>
        </div>

        <!-- INFORMACIÓN DEL CLIENTE -->
        <div class="pedido-contacto-grid">

            <div class="pedido-contacto-item">
                <span><i class="fa fa-user" aria-hidden="true"></i> Cliente</span>
                <strong>${campo(nombreCompleto)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-id-card" aria-hidden="true"></i> DNI</span>
                <strong>${campo(pedido.dni_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-phone" aria-hidden="true"></i> Celular</span>
                <strong>${campo(pedido.celular_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-envelope" aria-hidden="true"></i> Correo</span>
                <strong>${campo(pedido.correo_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-map" aria-hidden="true"></i> Región</span>
                <strong>${campo(pedido.region_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-map-marker" aria-hidden="true"></i> Provincia</span>
                <strong>${campo(pedido.provincia_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item">
                <span><i class="fa fa-location-arrow" aria-hidden="true"></i> Distrito</span>
                <strong>${campo(pedido.distrito_Pedido)}</strong>
            </div>

            <div class="pedido-contacto-item pedido-direccion">
                <span><i class="fa fa-home" aria-hidden="true"></i> Dirección</span>
                <strong>${campo(pedido.direccion_Pedido)}</strong>
            </div>
            <div class="pedido-contacto-item pedido-nota-cliente">
    <div class="pedido-nota-titulo">
        <i class="fa fa-comment" aria-hidden="true"></i>
        <span>Nota del cliente</span>
    </div>

    <strong class="pedido-nota-texto">${campo(pedido.notaCliente_Pedido)}</strong>
</div>
        </div>
    </div>
`;
}