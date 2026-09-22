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


        console.log(
            "Respuesta API pedidos:",
            resultado
        );


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



function generarFilaPedido(
    pedido,
    index
) {

    const cliente =
        `${pedido.nombres_Pedido || ""} ${pedido.apellidos_Pedido || ""}`
            .trim();


    const fecha =
        formatearFecha(
            pedido.fechregist_Pedido
        );


    const adelanto =
        Number(
            pedido.adelanto_Pedido || 0
        ).toFixed(2);


    const total =
        Number(
            pedido.total_Pedido || 0
        ).toFixed(2);


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


            <td>
                ${index + 1}
            </td>


            <td>
                <strong>
                    ${pedido.cod_Pedido || ""}
                </strong>
            </td>


            <td>
                ${fecha}
            </td>


            <td>
                ${cliente}
            </td>


            <td>
                ${pedido.dni_Pedido || ""}
            </td>


            <td>
                ${pedido.celular_Pedido || ""}
            </td>


            <td>
                S/ ${adelanto}
            </td>


            <td>
                <strong>
                    S/ ${total}
                </strong>
            </td>


            <td>
                ${generarBadgeEstadoPedido(
        pedido.estado_Pedido
    )}
            </td>


            <td>
                ${generarBadgeEstadoPago(
        pedido.estado_Pago_Pedido
    )}
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



function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "";

    }


    const fechaObj =
        new Date(fecha);


    if (
        isNaN(
            fechaObj.getTime()
        )
    ) {

        return fecha;

    }


    return fechaObj.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

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
