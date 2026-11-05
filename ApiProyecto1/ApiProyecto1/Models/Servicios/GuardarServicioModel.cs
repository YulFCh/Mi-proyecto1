namespace ApiProyecto1.Models.Servicios
{
    public class GuardarServicioModel
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Resumen { get; set; }
        public string? Descripcion { get; set; }
        public string? Icono { get; set; }
        public int OrdenServicio { get; set; }
        public bool Estado { get; set; } = true;

        public string Usuario { get; set; } = string.Empty;

        public List<ServicioImagenModel> Imagenes { get; set; } = new();
    }
}