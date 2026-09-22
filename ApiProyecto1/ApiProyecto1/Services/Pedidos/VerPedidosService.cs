using ApiProyecto1.Models.Pedidos;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services.Pedidos
{
    public class VerPedidosService
    {
        private readonly string _connectionString;

        public VerPedidosService(IConfiguration config)
        {
            _connectionString =
                config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró la cadena de conexión.");
        }


        // ============================================================
        // LISTAR / BUSCAR PEDIDOS
        // ============================================================

        public List<PedidosModel> Listar(
    string? nombre = null,
    string? dni = null,
    string? codigoPedido = null)
        {
            List<PedidosModel> pedidos = new();

            using SqlConnection con =
                new SqlConnection(_connectionString);

            con.Open();

            string query = @"
        SELECT
            p.id_pedido,
            p.cod_pedido,
            p.nombres_pedido,
            p.apellidos_pedido,
            p.dni_pedido,
            p.celular_pedido,
            p.correo_pedido,
            p.region_pedido,
            p.provincia_pedido,
            p.distrito_pedido,
            p.direccion_pedido,
            p.total_pedido,
            p.estado_pedido,
            p.estado_pago_pedido,
            p.fechregist_pedido,
            p.ticket_pedido,
            p.usuaregis_pedido,
            p.usuarmodif_pedido,
            p.fechmodif_pedido,
            p.motmodif_pedido,
            p.usuaranula_pedido,
            p.fechanula_pedido,
            p.motanula_pedido,
            p.adelanto_pedido
        FROM pedidos p
        WHERE
            (
                @nombre IS NULL
                OR @nombre = ''
                OR p.nombres_pedido LIKE '%' + @nombre + '%'
                OR p.apellidos_pedido LIKE '%' + @nombre + '%'
            )
            AND
            (
                @dni IS NULL
                OR @dni = ''
                OR p.dni_pedido LIKE '%' + @dni + '%'
            )
            AND
            (
                @codigoPedido IS NULL
                OR @codigoPedido = ''
                OR p.cod_pedido LIKE '%' + @codigoPedido + '%'
            )
        ORDER BY p.id_pedido DESC;
    ";

            using SqlCommand cmd =
                new SqlCommand(query, con);

            cmd.Parameters.AddWithValue(
                "@nombre",
                string.IsNullOrWhiteSpace(nombre)
                    ? DBNull.Value
                    : nombre.Trim());

            cmd.Parameters.AddWithValue(
                "@dni",
                string.IsNullOrWhiteSpace(dni)
                    ? DBNull.Value
                    : dni.Trim());

            cmd.Parameters.AddWithValue(
                "@codigoPedido",
                string.IsNullOrWhiteSpace(codigoPedido)
                    ? DBNull.Value
                    : codigoPedido.Trim());

            using SqlDataReader reader =
                cmd.ExecuteReader();

            while (reader.Read())
            {
                pedidos.Add(new PedidosModel
                {
                    Id_Pedido =
                        Convert.ToInt32(
                            reader["id_pedido"]),

                    Cod_Pedido =
                        reader["cod_pedido"] == DBNull.Value
                            ? null
                            : reader["cod_pedido"].ToString(),

                    Nombres_Pedido =
                        reader["nombres_pedido"].ToString() ?? "",

                    Apellidos_Pedido =
                        reader["apellidos_pedido"].ToString() ?? "",

                    Dni_Pedido =
                        reader["dni_pedido"].ToString() ?? "",

                    Celular_Pedido =
                        reader["celular_pedido"].ToString() ?? "",

                    Correo_Pedido =
                        reader["correo_pedido"].ToString() ?? "",

                    Region_Pedido =
                        reader["region_pedido"].ToString() ?? "",

                    Provincia_Pedido =
                        reader["provincia_pedido"].ToString() ?? "",

                    Distrito_Pedido =
                        reader["distrito_pedido"].ToString() ?? "",

                    Direccion_Pedido =
                        reader["direccion_pedido"].ToString() ?? "",

                    Total_Pedido =
                        Convert.ToDecimal(
                            reader["total_pedido"]),

                    Estado_Pedido =
                        reader["estado_pedido"].ToString() ?? "",

                    Estado_Pago_Pedido =
                        reader["estado_pago_pedido"].ToString() ?? "",

                    Ticket_Pedido =
                        reader["ticket_pedido"] == DBNull.Value
                            ? null
                            : reader["ticket_pedido"].ToString(),

                    Usuario_Registra =
                        reader["usuaregis_pedido"] == DBNull.Value
                            ? null
                            : reader["usuaregis_pedido"].ToString(),

                    Adelanto_Pedido =
                        reader["adelanto_pedido"] == DBNull.Value
                            ? 0
                            : Convert.ToDecimal(
                                reader["adelanto_pedido"])
                });
            }

            return pedidos;
        }



        // ============================================================
        // OBTENER DETALLE DE UN PEDIDO
        // ============================================================

        public List<DetallePedidoModel> ObtenerDetalle(
            int idPedido)
        {
            List<DetallePedidoModel> detalles = new();


            using SqlConnection con =
                new SqlConnection(_connectionString);

            con.Open();


            string query = @"
                SELECT
                    d.id_detalle_pedido,
                    d.id_pedido,
                    d.cod_pedido,
                    d.id_producto,
                    d.codigo_producto,
                    d.tipo_equipo,
                    d.marca,
                    d.modelo,
                    d.color,
                    d.descripcion,
                    d.cantidad,
                    d.precio_unitario,
                    d.descuento,
                    d.subtotal
                FROM detalle_pedidos d
                WHERE d.id_pedido = @id_pedido
                ORDER BY d.id_detalle_pedido;
            ";


            using SqlCommand cmd =
                new SqlCommand(query, con);

            cmd.Parameters.AddWithValue(
                "@id_pedido",
                idPedido);


            using SqlDataReader reader =
                cmd.ExecuteReader();


            while (reader.Read())
            {
                detalles.Add(new DetallePedidoModel
                {
                    Id_Detalle_Pedido =
                        Convert.ToInt32(
                            reader["id_detalle_pedido"]),

                    Id_Pedido =
                        Convert.ToInt32(
                            reader["id_pedido"]),

                    Cod_Pedido =
                        reader["cod_pedido"].ToString(),

                    Id_Producto =
                        Convert.ToInt32(
                            reader["id_producto"]),

                    Codigo_Producto =
                        reader["codigo_producto"].ToString(),

                    Tipo_Equipo =
                        reader["tipo_equipo"] == DBNull.Value
                            ? null
                            : reader["tipo_equipo"].ToString(),

                    Marca =
                        reader["marca"] == DBNull.Value
                            ? null
                            : reader["marca"].ToString(),

                    Modelo =
                        reader["modelo"] == DBNull.Value
                            ? null
                            : reader["modelo"].ToString(),

                    Color =
                        reader["color"] == DBNull.Value
                            ? null
                            : reader["color"].ToString(),

                    Descripcion =
                        reader["descripcion"] == DBNull.Value
                            ? null
                            : reader["descripcion"].ToString(),

                    Cantidad =
                        Convert.ToInt32(
                            reader["cantidad"]),

                    Precio_Unitario =
                        Convert.ToDecimal(
                            reader["precio_unitario"]),

                    Descuento =
                        Convert.ToDecimal(
                            reader["descuento"]),

                    Subtotal =
                        Convert.ToDecimal(
                            reader["subtotal"])
                });
            }


            return detalles;
        }
    }
}
