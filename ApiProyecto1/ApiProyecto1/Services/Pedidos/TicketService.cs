using ApiProyecto1.Models.Pedidos;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services.Pedidos
{
    public class TicketService
    {
        private readonly string _connectionString;

        public TicketService(IConfiguration config)
        {
            _connectionString =
                config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró la cadena de conexión.");
        }


        // ============================================================
        // OBTENER TICKET
        // ============================================================

        public TicketModel ObtenerTicket(int idPedido)
        {
            if (idPedido <= 0)
            {
                throw new Exception(
                    "El ID del pedido no es válido.");
            }


            using SqlConnection con =
                new SqlConnection(_connectionString);

            con.Open();


            TicketModel? ticket = null;


            // ========================================================
            // 1. OBTENER CABECERA
            // ========================================================

            string queryPedido = @"
                SELECT
                    id_pedido,
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
                    fechregist_pedido,
                    ticket_pedido,
                    usuaregis_pedido,
                    estado_pago_pedido
                FROM pedidos
                WHERE id_pedido = @id_pedido;
            ";


            using (SqlCommand cmd =
                new SqlCommand(queryPedido, con))
            {
                cmd.Parameters.AddWithValue(
                    "@id_pedido",
                    idPedido);


                using SqlDataReader reader =
                    cmd.ExecuteReader();


                if (reader.Read())
                {
                    ticket = new TicketModel
                    {
                        Id_Pedido =
                            Convert.ToInt32(
                                reader["id_pedido"]),

                        Cod_Pedido =
                            reader["cod_pedido"]?.ToString(),

                        Nombres_Pedido =
                            reader["nombres_pedido"]?.ToString(),

                        Apellidos_Pedido =
                            reader["apellidos_pedido"]?.ToString(),

                        Dni_Pedido =
                            reader["dni_pedido"]?.ToString(),

                        Celular_Pedido =
                            reader["celular_pedido"]?.ToString(),

                        Correo_Pedido =
                            reader["correo_pedido"]?.ToString(),

                        Region_Pedido =
                            reader["region_pedido"]?.ToString(),

                        Provincia_Pedido =
                            reader["provincia_pedido"]?.ToString(),

                        Distrito_Pedido =
                            reader["distrito_pedido"]?.ToString(),

                        Direccion_Pedido =
                            reader["direccion_pedido"]?.ToString(),

                        Total_Pedido =
                            reader["total_pedido"] == DBNull.Value
                                ? 0
                                : Convert.ToDecimal(
                                    reader["total_pedido"]),

                        Estado_Pedido =
                            reader["estado_pedido"]?.ToString(),

                        FechRegist_Pedido =
                            reader["fechregist_pedido"] == DBNull.Value
                                ? null
                                : Convert.ToDateTime(
                                    reader["fechregist_pedido"]),

                        Ticket_Pedido =
                            reader["ticket_pedido"]?.ToString(),

                        Usuario_Registra =
                            reader["usuaregis_pedido"]?.ToString(),

                        Estado_Pago_Pedido =
                            reader["estado_pago_pedido"]?.ToString()
                    };
                }
            }


            // ========================================================
            // 2. VALIDAR EXISTENCIA
            // ========================================================

            if (ticket == null)
            {
                throw new Exception(
                    "No se encontró el pedido.");
            }


            // ========================================================
            // 3. OBTENER DETALLES
            // ========================================================

            string queryDetalles = @"
                SELECT
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
                FROM detalle_pedidos
                WHERE id_pedido = @id_pedido
                ORDER BY id_producto;
            ";


            using (SqlCommand cmd =
                new SqlCommand(queryDetalles, con))
            {
                cmd.Parameters.AddWithValue(
                    "@id_pedido",
                    idPedido);


                using SqlDataReader reader =
                    cmd.ExecuteReader();


                while (reader.Read())
                {
                    TicketDetalleModel detalle =
                        new TicketDetalleModel
                        {
                            Id_Producto =
                                Convert.ToInt32(
                                    reader["id_producto"]),

                            Codigo_Producto =
                                reader["codigo_producto"] == DBNull.Value
                                    ? null
                                    : reader["codigo_producto"].ToString(),

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
                        };


                    ticket.Detalles.Add(detalle);
                }
            }


            return ticket;
        }
    }
}
