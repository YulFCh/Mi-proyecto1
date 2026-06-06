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
    }
}