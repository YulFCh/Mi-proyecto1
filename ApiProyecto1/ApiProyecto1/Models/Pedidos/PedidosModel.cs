namespace ApiProyecto1.Models.Pedidos
{
    public class PedidosModel
    {
        public int Id_Pedido { get; set; }

        public string? Cod_Pedido { get; set; }

        public string Nombres_Pedido { get; set; } = "";
        public string Apellidos_Pedido { get; set; } = "";
        public string Dni_Pedido { get; set; } = "";
        public string Celular_Pedido { get; set; } = "";
        public string Correo_Pedido { get; set; } = "";

        public string Region_Pedido { get; set; } = "";
        public string Provincia_Pedido { get; set; } = "";
        public string Distrito_Pedido { get; set; } = "";
        public string Direccion_Pedido { get; set; } = "";

        public decimal Total_Pedido { get; set; }

        public string Estado_Pedido { get; set; } = "PENDIENTE";
        public string Estado_Pago_Pedido { get; set; } = "PENDIENTE";

        public string? Ticket_Pedido { get; set; }
        public string? Usuario_Registra { get; set; }

        public List<DetallePedidoModel> Detalles { get; set; } = new();
    }


    public class DetallePedidoModel
    {
        public int Id_Detalle_Pedido { get; set; }

        public int Id_Pedido { get; set; }

        public string? Cod_Pedido { get; set; }

        public int Id_Producto { get; set; }

        public string? Codigo_Producto { get; set; }

        public string? Tipo_Equipo { get; set; }
        public string? Marca { get; set; }
        public string? Modelo { get; set; }
        public string? Color { get; set; }
        public string? Descripcion { get; set; }

        public int Cantidad { get; set; }

        public decimal Precio_Unitario { get; set; }

        public decimal Descuento { get; set; }

        public decimal Subtotal { get; set; }
    }
}

