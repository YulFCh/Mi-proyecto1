
namespace ApiProyecto1.Models.Informes
{
    public class ListarElementoSeccionWebModel
    {
        public int IdElemento { get; set; }

        public string TipoElemento { get; set; } = string.Empty;

        public string? Etiqueta { get; set; }
        public string? Contenido { get; set; }
        public string? UrlDestino { get; set; }

        public bool PermiteClick { get; set; }

        public string? UrlImagen { get; set; }
        public string? PublicId { get; set; }

        public string? Icono { get; set; }

        public int OrdenElemento { get; set; }
        public bool Estado { get; set; }

        public DateTime FechRegist { get; set; }
        public string UsuaRegist { get; set; } = string.Empty;
        public DateTime? FechModif { get; set; }
        public string? UsuarModif { get; set; }
    }
}
