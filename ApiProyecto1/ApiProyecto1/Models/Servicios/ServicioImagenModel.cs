namespace ApiProyecto1.Models.Servicios
{
    public class ServicioImagenModel
    {
        public int IdImagen { get; set; }
        public string UrlImagen { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public string? DescImagen { get; set; }
        public int OrdenFoto { get; set; }
    }
}