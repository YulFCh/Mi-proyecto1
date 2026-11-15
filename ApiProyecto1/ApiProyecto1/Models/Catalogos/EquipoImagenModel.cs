
namespace ApiProyecto1.Models.Catalogos
{
    public class EquipoImagenModel
    {
        public int IdImagen { get; set; }

        public int IdEquipo { get; set; }

        public string UrlImagen { get; set; } = string.Empty;

        public string PublicId { get; set; } = string.Empty;

        public int OrdenImagen { get; set; }
    }
}

