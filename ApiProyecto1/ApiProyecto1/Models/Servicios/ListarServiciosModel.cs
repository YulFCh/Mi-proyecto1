namespace ApiProyecto1.Models.Servicios
{
    public class ListarServiciosModel
    {
        public int IdServicio { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Resumen { get; set; }
        public string? Descripcion { get; set; }
        public string? Icono { get; set; }
        public int OrdenServicio { get; set; }
        public bool Estado { get; set; }
        public DateTime FechRegist { get; set; }
        public string UsuaRegist { get; set; } = string.Empty;
        public DateTime? FechModif { get; set; }
        public string? UsuarModif { get; set; }

        public List<ServicioImagenModel> Imagenes { get; set; } = new();
    }
}
