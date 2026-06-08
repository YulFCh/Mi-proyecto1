namespace ApiProyecto1.Models
{
    public class RegistrosModel
    {
        public int Id { get; set; }
        public string Tipo_Equipo { get; set; }
        public string Color { get; set; }
        public string Modelo { get; set; }
        public string Descripcion { get; set; }
        public decimal Precio { get; set; }
        public DateTime Fecha_Registro { get; set; }
        public string Url_Equipo { get; set; }
        public string Url1 { get; set; }
        public string Url2 { get; set; }
        public string Url3 { get; set; }
        public string Marca { get; set; }
        public string Codigo_Producto { get; set; }
        public string Precio_Antes { get; set; }
        public string Descuento { get; set; }
        public string Estado { get; set; }
        public string Fecha_Modifica { get; set; }
        public string? Usuario_Registra { get; set; }
    }
}