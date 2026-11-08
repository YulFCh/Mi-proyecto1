
namespace ApiProyecto1.Models.Nosotros
{
    public class NosotrosImagenModel
    {
        public int IdImagen { get; set; }
        public int IdNosotros { get; set; }

        public string UrlImagen { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public string? DescImagen { get; set; }

        public int OrdenFoto { get; set; }
    }
}
