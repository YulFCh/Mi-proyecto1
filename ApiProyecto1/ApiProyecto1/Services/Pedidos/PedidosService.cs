using ApiProyecto1.Models.Pedidos;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services.Pedidos
{
    public class PedidosService
    {
        private readonly string _connectionString;

        public PedidosService(IConfiguration config)
        {
            _connectionString =
                config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró la cadena de conexión.");
        }


        // ============================================================
        // REGISTRAR PEDIDO
        // ============================================================

        public int Registrar(PedidosModel model)
        {
            // ========================================================
            // VALIDACIÓN GENERAL
            // ========================================================

            if (model == null)
            {
                throw new Exception(
                    "Los datos del pedido son obligatorios.");
            }


            if (model.Detalles == null ||
                model.Detalles.Count == 0)
            {
                throw new Exception(
                    "El pedido debe contener al menos un detalle.");
            }


            // ========================================================
            // CONEXIÓN
            // ========================================================

            using SqlConnection con =
                new SqlConnection(_connectionString);

            con.Open();


            // ========================================================
            // TRANSACCIÓN
            // ========================================================

            using SqlTransaction transaction =
                con.BeginTransaction();


            try
            {
                // ====================================================
                // 1. INSERTAR CABECERA
                //
                // cod_pedido es NOT NULL.
                //
                // Primero colocamos un valor temporal único basado
                // en GUID. Después de obtener id_pedido, lo
                // reemplazamos por P-000001, P-000002, etc.
                // ====================================================

                string codigoTemporal =
                    $"TEMP-{Guid.NewGuid():N}";


                string queryPedido = @"
                    INSERT INTO pedidos
                    (
                        cod_pedido,
                        nombres_pedido,
                        apellidos_pedido,
                        dni_pedido,
                        celular_pedido,
                        correo_pedido,
                        region_pedido,
                        provincia_pedido,
                        distrito_pedido,
                        direccion_pedido,
                        total_pedido,
                        estado_pedido,
                        estado_pago_pedido,
                        ticket_pedido,
                        usuaregis_pedido
                    )
                    VALUES
                    (
                        @cod_pedido,
                        @nombres,
                        @apellidos,
                        @dni,
                        @celular,
                        @correo,
                        @region,
                        @provincia,
                        @distrito,
                        @direccion,
                        0,
                        @estado,
                        @estado_pago,
                        @ticket,
                        @usuario
                    );

                    SELECT CAST(SCOPE_IDENTITY() AS INT);
                ";


                int idPedido;


                using (SqlCommand cmd =
                    new SqlCommand(
                        queryPedido,
                        con,
                        transaction))
                {
                    cmd.Parameters.AddWithValue(
                        "@cod_pedido",
                        codigoTemporal);

                    cmd.Parameters.AddWithValue(
                        "@nombres",
                        model.Nombres_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@apellidos",
                        model.Apellidos_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@dni",
                        model.Dni_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@celular",
                        model.Celular_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@correo",
                        model.Correo_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@region",
                        model.Region_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@provincia",
                        model.Provincia_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@distrito",
                        model.Distrito_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@direccion",
                        model.Direccion_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@estado",
                        string.IsNullOrWhiteSpace(
                            model.Estado_Pedido)
                            ? "PENDIENTE"
                            : model.Estado_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@estado_pago",
                        string.IsNullOrWhiteSpace(
                            model.Estado_Pago_Pedido)
                            ? "PENDIENTE"
                            : model.Estado_Pago_Pedido.Trim());

                    cmd.Parameters.AddWithValue(
                        "@ticket",
                        (object?)model.Ticket_Pedido
                        ?? DBNull.Value);

                    cmd.Parameters.AddWithValue(
                        "@usuario",
                        (object?)model.Usuario_Registra
                        ?? DBNull.Value);


                    idPedido =
                        Convert.ToInt32(
                            cmd.ExecuteScalar());
                }


                // ====================================================
                // 2. GENERAR CÓDIGO DEFINITIVO
                //
                // 1      -> P-000001
                // 25     -> P-000025
                // 100    -> P-000100
                // 1250   -> P-001250
                // ====================================================

                string codPedido =
                    $"P-{idPedido:D6}";


                // ====================================================
                // 3. ACTUALIZAR CÓDIGO DEFINITIVO
                // ====================================================

                string queryCodigo = @"
                    UPDATE pedidos
                    SET cod_pedido = @cod_pedido
                    WHERE id_pedido = @id_pedido;
                ";


                using (SqlCommand cmd =
                    new SqlCommand(
                        queryCodigo,
                        con,
                        transaction))
                {
                    cmd.Parameters.AddWithValue(
                        "@cod_pedido",
                        codPedido);

                    cmd.Parameters.AddWithValue(
                        "@id_pedido",
                        idPedido);


                    int filasAfectadas =
                        cmd.ExecuteNonQuery();


                    if (filasAfectadas != 1)
                    {
                        throw new Exception(
                            "No se pudo asignar el código del pedido.");
                    }
                }


                // ====================================================
                // 4. INSERTAR DETALLES
                // ====================================================

                decimal totalPedido = 0;


                foreach (var detalle in model.Detalles)
                {
                    // =================================================
                    // VALIDACIONES
                    // =================================================

                    if (detalle.Id_Producto <= 0)
                    {
                        throw new Exception(
                            "El producto del detalle no es válido.");
                    }


                    if (detalle.Cantidad <= 0)
                    {
                        throw new Exception(
                            "La cantidad debe ser mayor que cero.");
                    }


                    if (detalle.Precio_Unitario < 0)
                    {
                        throw new Exception(
                            "El precio unitario no puede ser negativo.");
                    }


                    if (detalle.Descuento < 0)
                    {
                        throw new Exception(
                            "El descuento no puede ser negativo.");
                    }


                    // =================================================
                    // CALCULAR SUBTOTAL EN EL SERVIDOR
                    // =================================================

                    decimal subtotal =
                        (detalle.Cantidad *
                         detalle.Precio_Unitario)
                        - detalle.Descuento;


                    if (subtotal < 0)
                    {
                        throw new Exception(
                            "El descuento no puede ser mayor al importe.");
                    }


                    totalPedido += subtotal;


                    // =================================================
                    // INSERTAR DETALLE
                    // =================================================

                    string queryDetalle = @"
                        INSERT INTO detalle_pedidos
                        (
                            id_pedido,
                            cod_pedido,
                            id_producto,
                            codigo_producto,
                            tipo_equipo,
                            marca,
                            modelo,
                            color,
                            descripcion,
                            cantidad,
                            precio_unitario,
                            descuento,
                            subtotal
                        )
                        VALUES
                        (
                            @id_pedido,
                            @cod_pedido,
                            @id_producto,
                            @codigo_producto,
                            @tipo_equipo,
                            @marca,
                            @modelo,
                            @color,
                            @descripcion,
                            @cantidad,
                            @precio_unitario,
                            @descuento,
                            @subtotal
                        );
                    ";


                    using (SqlCommand cmd =
                        new SqlCommand(
                            queryDetalle,
                            con,
                            transaction))
                    {
                        cmd.Parameters.AddWithValue(
                            "@id_pedido",
                            idPedido);

                        cmd.Parameters.AddWithValue(
                            "@cod_pedido",
                            codPedido);

                        cmd.Parameters.AddWithValue(
                            "@id_producto",
                            detalle.Id_Producto);

                        cmd.Parameters.AddWithValue(
                            "@codigo_producto",
                            (object?)detalle.Codigo_Producto
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@tipo_equipo",
                            (object?)detalle.Tipo_Equipo
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@marca",
                            (object?)detalle.Marca
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@modelo",
                            (object?)detalle.Modelo
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@color",
                            (object?)detalle.Color
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@descripcion",
                            (object?)detalle.Descripcion
                            ?? DBNull.Value);

                        cmd.Parameters.AddWithValue(
                            "@cantidad",
                            detalle.Cantidad);

                        cmd.Parameters.AddWithValue(
                            "@precio_unitario",
                            detalle.Precio_Unitario);

                        cmd.Parameters.AddWithValue(
                            "@descuento",
                            detalle.Descuento);

                        cmd.Parameters.AddWithValue(
                            "@subtotal",
                            subtotal);


                        cmd.ExecuteNonQuery();
                    }
                }


                // ====================================================
                // 5. ACTUALIZAR TOTAL DEL PEDIDO
                // ====================================================

                string queryTotal = @"
                    UPDATE pedidos
                    SET total_pedido = @total
                    WHERE id_pedido = @id_pedido;
                ";


                using (SqlCommand cmd =
                    new SqlCommand(
                        queryTotal,
                        con,
                        transaction))
                {
                    cmd.Parameters.AddWithValue(
                        "@total",
                        totalPedido);

                    cmd.Parameters.AddWithValue(
                        "@id_pedido",
                        idPedido);


                    int filasAfectadas =
                        cmd.ExecuteNonQuery();


                    if (filasAfectadas != 1)
                    {
                        throw new Exception(
                            "No se pudo actualizar el total del pedido.");
                    }
                }


                // ====================================================
                // 6. CONFIRMAR TRANSACCIÓN
                // ====================================================

                transaction.Commit();


                // ====================================================
                // 7. DEVOLVER ID DEL PEDIDO
                // ====================================================

                return idPedido;
            }
            catch
            {
                // ====================================================
                // SI ALGO FALLA:
                //
                // NO SE GUARDA NADA.
                // ====================================================

                try
                {
                    transaction.Rollback();
                }
                catch
                {
                    // No ocultar la excepción original.
                }


                throw;
            }
        }
    }
}
