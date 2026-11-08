
namespace ApiProyecto1.Models.Nosotros
{
    public class RegistrarNosotrosModel
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Resumen { get; set; }
        public string? Descripcion { get; set; }
        public string? Icono { get; set; }

        public int OrdenNosotros { get; set; }
        public bool Estado { get; set; } = true;

        public string UsuaRegist { get; set; } = string.Empty;
        public string? UsuarModif { get; set; }

        public List<NosotrosImagenModel> Imagenes { get; set; } = new();
    }
}
